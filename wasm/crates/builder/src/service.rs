//! The HTTP API and build jobs.

use std::collections::{HashMap, VecDeque};
use std::convert::Infallible;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;

use axum::body::{Body, Bytes};
use axum::extract::{Path, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use bpmnkit_wasm_build::{
    run_pipeline_observed, run_pipeline_until, Artifact, BuildInput, Executor, Stage, StageEvent,
    Toolchain,
};
use bpmnkit_wasm_contract::{
    sign, BuildReport, BuildRequest, Digest, RegistryEntry, RegistryStore, SigningKey,
};
use serde::{Deserialize, Serialize};
use tokio::sync::{watch, Semaphore};

use crate::auth::Tokens;
use crate::rate::{RateConfig, RateLimiter};

/// Finished builds kept for `GET /builds/{id}`; the oldest finished are dropped first.
const MAX_KEPT: usize = 512;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum BuildState {
    Queued,
    Running,
    Succeeded,
    Failed,
}
impl BuildState {
    pub fn is_final(self) -> bool {
        matches!(self, Self::Succeeded | Self::Failed)
    }
}

/// One line of `GET /builds/{id}/events`. Stages: the pipeline's, then `sign` and `publish`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "event", rename_all = "kebab-case")]
pub enum BuildEvent {
    Queued,
    Started { stage: String },
    Finished { stage: String, ok: bool, ms: u64 },
    Published { name: String, digest: Digest },
    Done { ok: bool },
}

impl From<StageEvent> for BuildEvent {
    fn from(e: StageEvent) -> Self {
        match e {
            StageEvent::Started(s) => Self::Started {
                stage: s.name().into(),
            },
            StageEvent::Finished { stage, ok, ms } => Self::Finished {
                stage: stage.name().into(),
                ok,
                ms,
            },
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Published {
    pub name: String,
    pub digest: Digest,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BuildStatus {
    pub id: String,
    pub state: BuildState,
    pub events: Vec<BuildEvent>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub report: Option<BuildReport>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub published: Option<Published>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Submitted {
    pub id: String,
}

pub struct Config {
    pub tokens: Tokens,
    pub rate: RateConfig,
    /// Builds and checks running cargo at the same time.
    pub max_builds: usize,
    /// Builds allowed to wait for a permit; more are answered 503.
    pub max_queued: usize,
    pub toolchain: Toolchain,
}

struct Job {
    owner: String,
    status: Mutex<BuildStatus>,
    tick: watch::Sender<()>,
}

impl Job {
    fn update(&self, f: impl FnOnce(&mut BuildStatus)) {
        f(&mut self.status.lock().expect("not poisoned"));
        self.tick.send_replace(());
    }
    fn push(&self, e: BuildEvent) {
        self.update(|s| s.events.push(e));
    }
    fn finish(&self, published: Option<Published>, error: Option<String>) {
        self.update(|s| {
            let ok = error.is_none() && s.report.as_ref().is_some_and(|r| r.ok);
            if let Some(p) = &published {
                s.events.push(BuildEvent::Published {
                    name: p.name.clone(),
                    digest: p.digest.clone(),
                });
            }
            s.events.push(BuildEvent::Done { ok });
            s.state = if ok {
                BuildState::Succeeded
            } else {
                BuildState::Failed
            };
            s.published = published;
            s.error = error;
        });
    }
    fn snapshot(&self) -> BuildStatus {
        self.status.lock().expect("not poisoned").clone()
    }
}

#[derive(Default)]
struct Jobs {
    map: HashMap<String, Arc<Job>>,
    order: VecDeque<String>,
}

pub struct Builder {
    tokens: Tokens,
    limiter: Mutex<RateLimiter>,
    permits: Semaphore,
    /// Waiting builds, capped by `max_queued`.
    queued: AtomicUsize,
    max_queued: usize,
    jobs: Mutex<Jobs>,
    registry: Box<dyn RegistryStore + Send + Sync>,
    key: SigningKey,
    tc: Toolchain,
    ex: Box<dyn Executor + Send + Sync>,
}

/// A JSON `{error}` response; boxed, as responses are large.
struct ApiError(Box<Response>);
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        *self.0
    }
}

type Reply<T> = Result<T, ApiError>;

fn error(status: StatusCode, msg: impl Into<String>) -> ApiError {
    ApiError(Box::new(
        (status, Json(serde_json::json!({ "error": msg.into() }))).into_response(),
    ))
}

impl Builder {
    pub fn new(
        cfg: Config,
        registry: impl RegistryStore + Send + Sync + 'static,
        key: SigningKey,
        ex: impl Executor + Send + Sync + 'static,
    ) -> Arc<Self> {
        Arc::new(Self {
            tokens: cfg.tokens,
            limiter: Mutex::new(RateLimiter::new(cfg.rate)),
            permits: Semaphore::new(cfg.max_builds.max(1)),
            queued: AtomicUsize::new(0),
            max_queued: cfg.max_queued,
            jobs: Mutex::default(),
            registry: Box::new(registry),
            key,
            tc: cfg.toolchain,
            ex: Box::new(ex),
        })
    }

    fn caller(&self, h: &HeaderMap) -> Reply<String> {
        let auth = h.get(header::AUTHORIZATION).and_then(|v| v.to_str().ok());
        self.tokens.caller(auth).map(str::to_owned).ok_or_else(|| {
            let mut r = error(StatusCode::UNAUTHORIZED, "missing or unknown bearer token");
            r.0.headers_mut()
                .insert(header::WWW_AUTHENTICATE, "Bearer".parse().expect("valid"));
            r
        })
    }

    /// Authenticates, rate-limits and parses a request that will run cargo.
    fn admit(&self, h: &HeaderMap, body: &[u8]) -> Reply<(String, BuildInput)> {
        let caller = self.caller(h)?;
        let taken = self
            .limiter
            .lock()
            .expect("not poisoned")
            .take(&caller, Instant::now());
        if let Err(wait) = taken {
            let secs = wait.as_secs_f64().ceil() as u64;
            let mut r = error(
                StatusCode::TOO_MANY_REQUESTS,
                format!("rate limit: retry in {secs} s"),
            );
            r.0.headers_mut()
                .insert(header::RETRY_AFTER, secs.max(1).into());
            return Err(r);
        }
        let req: BuildRequest = serde_json::from_slice(body)
            .map_err(|e| error(StatusCode::BAD_REQUEST, format!("bad build request: {e}")))?;
        Ok((caller, req.into()))
    }

    fn job(&self, h: &HeaderMap, id: &str) -> Reply<Arc<Job>> {
        let caller = self.caller(h)?;
        let jobs = self.jobs.lock().expect("not poisoned");
        // Another caller's build reads as missing, so ids leak nothing.
        jobs.map
            .get(id)
            .filter(|j| j.owner == caller)
            .cloned()
            .ok_or_else(|| error(StatusCode::NOT_FOUND, format!("no build `{id}`")))
    }

    fn insert(&self, id: &str, job: Arc<Job>) {
        let mut jobs = self.jobs.lock().expect("not poisoned");
        jobs.map.insert(id.to_owned(), job);
        jobs.order.push_back(id.to_owned());
        while jobs.map.len() > MAX_KEPT {
            let Jobs { map, order } = &mut *jobs;
            let Some(pos) = order
                .iter()
                .position(|k| map[k].snapshot().state.is_final())
            else {
                break;
            };
            let k = order.remove(pos).expect("in range");
            map.remove(&k);
        }
    }

    /// Runs on a blocking thread, holding a build permit.
    fn build_blocking(&self, job: &Job, input: &BuildInput) {
        let p = run_pipeline_observed(input, &self.tc, &*self.ex, Stage::Package, &mut |e| {
            job.push(e.into())
        });
        let ok = p.report.ok;
        job.update(|s| s.report = Some(p.report));
        match (ok, p.artifact) {
            (true, Some(a)) => match self.publish(job, a) {
                Ok(pubd) => job.finish(Some(pubd), None),
                Err(e) => job.finish(None, Some(e)),
            },
            (true, None) => job.finish(None, Some("pipeline produced no artifact".into())),
            (false, _) => job.finish(None, None),
        }
    }

    fn publish(&self, job: &Job, a: Artifact) -> Result<Published, String> {
        let staged = |stage: &str, f: &mut dyn FnMut() -> Result<(), String>| {
            job.push(BuildEvent::Started {
                stage: stage.into(),
            });
            let t = Instant::now();
            let r = f();
            job.push(BuildEvent::Finished {
                stage: stage.into(),
                ok: r.is_ok(),
                ms: t.elapsed().as_millis() as u64,
            });
            r.map_err(|e| format!("{stage}: {e}"))
        };
        let name = a.metadata.manifest.worker.name.clone();
        let mut entry = None;
        staged("sign", &mut || {
            entry = Some(sign_entry(&self.key, a.clone()));
            Ok(())
        })?;
        let entry = entry.expect("signed");
        let mut digest = None;
        staged("publish", &mut || {
            digest = Some(self.registry.publish(&entry).map_err(|e| e.to_string())?);
            Ok(())
        })?;
        Ok(Published {
            name,
            digest: digest.expect("published"),
        })
    }
}

/// The registry entry for a built artifact, signed over its digest and manifest.
pub fn sign_entry(key: &SigningKey, a: Artifact) -> RegistryEntry {
    let manifest = a.metadata.manifest.clone();
    let signature = sign(key, &a.metadata.component_digest, &manifest);
    RegistryEntry {
        wasm: a.component,
        manifest,
        metadata: a.metadata,
        signature,
    }
}

/// Compiles the dependency set into the shared target dir, so later builds compile only the
/// worker. Runs unsandboxed with network: the source is fixed here, never caller input.
pub fn warm(tc: &Toolchain, ex: &dyn Executor) -> Result<(), String> {
    const SRC: &str = "use bpmnkit_wasm_sdk::prelude::*;\n\nstruct W;\n\nimpl Worker for W {\n    fn handle(job: Job) -> Outcome {\n        let v: Value = job.variables().unwrap_or_default();\n        Outcome::complete(json!({ \"v\": v }))\n    }\n}\n\nbpmnkit_wasm_sdk::export!(W);\n";
    let req = BuildRequest {
        manifest: serde_json::from_value(serde_json::json!({
            "worker": { "name": "warm", "version": "0.1.0", "job_types": ["warm"] }
        }))
        .expect("valid manifest"),
        source: SRC.into(),
        samples: vec![],
    };
    let r = run_pipeline_until(&req.into(), tc, ex, Stage::Build).report;
    if r.ok {
        Ok(())
    } else {
        Err(r
            .diagnostics
            .iter()
            .map(|d| format!("{}: {}", d.code, d.message))
            .collect::<Vec<_>>()
            .join("; "))
    }
}

fn new_id() -> String {
    let b = crate::random_bytes(8).expect("/dev/urandom");
    bpmnkit_wasm_contract::encode_hex(&b)
}

pub fn router(b: Arc<Builder>) -> Router {
    Router::new()
        .route("/healthz", get(|| async { "ok" }))
        .route("/check", post(check))
        .route("/builds", post(submit))
        .route("/builds/{id}", get(status))
        .route("/builds/{id}/events", get(events))
        .with_state(b)
}

fn joined(e: tokio::task::JoinError) -> ApiError {
    error(
        StatusCode::INTERNAL_SERVER_ERROR,
        format!("task failed: {e}"),
    )
}

async fn check(
    State(b): State<Arc<Builder>>,
    h: HeaderMap,
    body: Bytes,
) -> Reply<Json<BuildReport>> {
    let (_, input) = b.admit(&h, &body)?;
    let _permit = b.permits.acquire().await.expect("never closed");
    let b2 = Arc::clone(&b);
    let report = tokio::task::spawn_blocking(move || {
        run_pipeline_until(&input, &b2.tc, &*b2.ex, Stage::Check).report
    })
    .await
    .map_err(joined)?;
    Ok(Json(report))
}

async fn submit(
    State(b): State<Arc<Builder>>,
    h: HeaderMap,
    body: Bytes,
) -> Reply<(StatusCode, Json<Submitted>)> {
    let (owner, input) = b.admit(&h, &body)?;
    // Reserve a queue slot; it is released once a permit is held.
    if b.queued.fetch_add(1, Ordering::SeqCst) >= b.max_queued {
        b.queued.fetch_sub(1, Ordering::SeqCst);
        let mut r = error(StatusCode::SERVICE_UNAVAILABLE, "build queue is full");
        r.0.headers_mut().insert(header::RETRY_AFTER, 30.into());
        return Err(r);
    }
    let id = new_id();
    let job = Arc::new(Job {
        owner,
        status: Mutex::new(BuildStatus {
            id: id.clone(),
            state: BuildState::Queued,
            events: vec![BuildEvent::Queued],
            report: None,
            published: None,
            error: None,
        }),
        tick: watch::channel(()).0,
    });
    b.insert(&id, Arc::clone(&job));
    tokio::spawn(async move {
        let _permit = b.permits.acquire().await.expect("never closed");
        b.queued.fetch_sub(1, Ordering::SeqCst);
        job.update(|s| s.state = BuildState::Running);
        let (b2, j2) = (Arc::clone(&b), Arc::clone(&job));
        let r = tokio::task::spawn_blocking(move || b2.build_blocking(&j2, &input)).await;
        if let Err(e) = r {
            job.finish(None, Some(format!("build task failed: {e}")));
        }
    });
    Ok((StatusCode::ACCEPTED, Json(Submitted { id })))
}

async fn status(
    State(b): State<Arc<Builder>>,
    h: HeaderMap,
    Path(id): Path<String>,
) -> Reply<Json<BuildStatus>> {
    Ok(Json(b.job(&h, &id)?.snapshot()))
}

/// Every event from the start, then new ones as they happen; ends after `done`.
async fn events(
    State(b): State<Arc<Builder>>,
    h: HeaderMap,
    Path(id): Path<String>,
) -> Reply<Response> {
    let job = b.job(&h, &id)?;
    let rx = job.tick.subscribe();
    let stream = futures_util::stream::unfold((job, rx, 0usize), |(job, mut rx, i)| async move {
        loop {
            rx.borrow_and_update();
            let next = {
                let s = job.status.lock().expect("not poisoned");
                match s.events.get(i) {
                    Some(e) => Some(e.clone()),
                    None if s.state.is_final() => return None,
                    None => None,
                }
            };
            match next {
                Some(e) => {
                    let mut line = serde_json::to_vec(&e).expect("serialisable");
                    line.push(b'\n');
                    return Some((Ok::<_, Infallible>(Bytes::from(line)), (job, rx, i + 1)));
                }
                None => rx.changed().await.ok()?,
            }
        }
    });
    Ok((
        [(header::CONTENT_TYPE, "application/x-ndjson")],
        Body::from_stream(stream),
    )
        .into_response())
}

#[cfg(test)]
mod tests {
    use bpmnkit_wasm_contract::{verify_signature, ArtifactMetadata, DirRegistry, ValidManifest};

    use super::*;

    fn artifact(wasm: &[u8]) -> Artifact {
        let manifest = ValidManifest::from_toml(
            "[worker]\nname = \"t\"\nversion = \"0.1.0\"\njob_types = [\"t\"]\n",
        )
        .unwrap();
        Artifact {
            component: wasm.to_vec(),
            metadata: ArtifactMetadata {
                component_digest: Digest::of(wasm),
                source_digest: Digest::of(b"src"),
                manifest,
                contract_version: "0.1.0".parse().unwrap(),
                sdk_version: "0.1.0".parse().unwrap(),
                toolchain: "rustc test".into(),
                lock_digest: Digest::of(b"lock"),
            },
            tests: vec![],
        }
    }

    #[test]
    fn signed_entry_publishes_and_verifies() {
        let key = SigningKey::from_bytes(&[3; 32]);
        let e = sign_entry(&key, artifact(b"\0asm-fake"));
        let digest = Digest::of(b"\0asm-fake");
        verify_signature(&key.verifying_key(), &digest, &e.manifest, &e.signature).unwrap();

        let dir = std::env::temp_dir().join(format!("bpmnkit-builder-sign-{}", std::process::id()));
        let reg = DirRegistry::new(&dir);
        assert_eq!(reg.publish(&e).unwrap(), digest);
        assert_eq!(reg.current("t").unwrap(), Some(digest.clone()));
        assert_eq!(reg.load("t", &digest).unwrap(), e);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn signature_does_not_cover_a_different_component() {
        let key = SigningKey::from_bytes(&[3; 32]);
        let e = sign_entry(&key, artifact(b"one"));
        let other = Digest::of(b"two");
        assert!(verify_signature(&key.verifying_key(), &other, &e.manifest, &e.signature).is_err());
    }

    #[test]
    fn stage_events_serialise_as_tagged_lines() {
        let e: BuildEvent = StageEvent::Finished {
            stage: Stage::Check,
            ok: false,
            ms: 5,
        }
        .into();
        assert_eq!(
            serde_json::to_string(&e).unwrap(),
            r#"{"event":"finished","stage":"check","ok":false,"ms":5}"#
        );
    }
}
