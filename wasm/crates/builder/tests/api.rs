//! The HTTP API with a fake executor: no cargo, no target needed.

use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;

use axum::body::Body;
use axum::http::{header, Request, StatusCode};
use axum::Router;
use bpmnkit_wasm_build::{Cmd, ExecError, ExecLimits, ExecOutput, Executor, Toolchain};
use bpmnkit_wasm_builder::*;
use bpmnkit_wasm_contract::{BuildReport, DirRegistry, SigningKey};
use tower::ServiceExt;

const TOKEN: &str = "test-token-0123456789";
const OTHER: &str = "other-token-0123456789";

const ERR: &str = r#"{"reason":"compiler-message","message":{"level":"error","message":"mismatched types","code":{"code":"E0308"},"spans":[{"file_name":"src/lib.rs","line_start":2,"column_start":5,"is_primary":true}],"children":[]}}"#;

/// Fails every cargo run with one rustc error; counts the most runs at once.
#[derive(Default)]
struct Fake {
    delay: Duration,
    running: AtomicUsize,
    peak: AtomicUsize,
}
struct Shared(Arc<Fake>);
impl Executor for Shared {
    fn run(&self, _: &Cmd, _: &ExecLimits) -> Result<ExecOutput, ExecError> {
        let f = &self.0;
        let now = f.running.fetch_add(1, Ordering::SeqCst) + 1;
        f.peak.fetch_max(now, Ordering::SeqCst);
        std::thread::sleep(f.delay);
        f.running.fetch_sub(1, Ordering::SeqCst);
        Ok(ExecOutput {
            code: Some(101),
            stdout: ERR.into(),
            stderr: String::new(),
        })
    }
}

fn tmp(tag: &str) -> std::path::PathBuf {
    static N: AtomicUsize = AtomicUsize::new(0);
    let n = N.fetch_add(1, Ordering::SeqCst);
    std::env::temp_dir().join(format!("bpmnkit-builder-{tag}-{}-{n}", std::process::id()))
}

fn app(fake: Arc<Fake>, rate: RateConfig, max_builds: usize) -> Router {
    app_q(fake, rate, max_builds, 16)
}

fn app_q(fake: Arc<Fake>, rate: RateConfig, max_builds: usize, max_queued: usize) -> Router {
    let mut tc = Toolchain::local("/sdk");
    tc.work_root = tmp("work");
    let b = Builder::new(
        Config {
            tokens: Tokens::parse(&format!("me={TOKEN},you={OTHER}")).unwrap(),
            rate,
            max_builds,
            max_queued,
            toolchain: tc,
        },
        DirRegistry::new(tmp("reg")),
        SigningKey::from_bytes(&[7; 32]),
        Shared(fake),
    );
    router(b)
}

fn default_app() -> Router {
    app(Arc::default(), RateConfig::default(), 2)
}

const REQ: &str = r#"{"manifest":{"worker":{"name":"t","version":"0.1.0","job_types":["t"]}},"source":"fn f() {}"}"#;

fn req(method: &str, uri: &str, token: Option<&str>, body: &str) -> Request<Body> {
    let mut r = Request::builder().method(method).uri(uri);
    if let Some(t) = token {
        r = r.header(header::AUTHORIZATION, format!("Bearer {t}"));
    }
    r.body(Body::from(body.to_owned())).unwrap()
}

async fn call(app: &Router, r: Request<Body>) -> (StatusCode, axum::http::HeaderMap, String) {
    let res = app.clone().oneshot(r).await.unwrap();
    let (parts, body) = res.into_parts();
    let bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap();
    (
        parts.status,
        parts.headers,
        String::from_utf8(bytes.to_vec()).unwrap(),
    )
}

async fn wait_final(app: &Router, id: &str, token: &str) -> BuildStatus {
    for _ in 0..500 {
        let (s, _, body) = call(app, req("GET", &format!("/builds/{id}"), Some(token), "")).await;
        assert_eq!(s, StatusCode::OK, "{body}");
        let st: BuildStatus = serde_json::from_str(&body).unwrap();
        if st.state.is_final() {
            return st;
        }
        tokio::time::sleep(Duration::from_millis(10)).await;
    }
    panic!("build {id} did not finish");
}

#[tokio::test]
async fn every_endpoint_but_healthz_needs_a_known_bearer_token() {
    let app = default_app();
    for (m, uri) in [
        ("POST", "/check"),
        ("POST", "/builds"),
        ("GET", "/builds/x"),
        ("GET", "/builds/x/events"),
    ] {
        for tok in [None, Some("wrong-token-0123456789")] {
            let (s, h, _) = call(&app, req(m, uri, tok, REQ)).await;
            assert_eq!(s, StatusCode::UNAUTHORIZED, "{m} {uri} {tok:?}");
            assert_eq!(h[header::WWW_AUTHENTICATE], "Bearer");
        }
    }
    let (s, _, body) = call(&app, req("GET", "/healthz", None, "")).await;
    assert_eq!((s, body.as_str()), (StatusCode::OK, "ok"));
}

#[tokio::test]
async fn auth_is_checked_before_the_body_is_parsed() {
    let (s, _, _) = call(&default_app(), req("POST", "/check", None, "not json")).await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn bad_json_is_a_400() {
    let (s, _, body) = call(&default_app(), req("POST", "/check", Some(TOKEN), "{")).await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert!(body.contains("bad build request"), "{body}");
}

#[tokio::test]
async fn rate_limit_is_per_caller_with_retry_after() {
    let app = app(
        Arc::default(),
        RateConfig {
            burst: 2,
            per_minute: 1,
        },
        2,
    );
    for _ in 0..2 {
        let (s, _, _) = call(&app, req("POST", "/check", Some(TOKEN), REQ)).await;
        assert_eq!(s, StatusCode::OK);
    }
    let (s, h, _) = call(&app, req("POST", "/builds", Some(TOKEN), REQ)).await;
    assert_eq!(s, StatusCode::TOO_MANY_REQUESTS);
    let secs: u64 = h[header::RETRY_AFTER].to_str().unwrap().parse().unwrap();
    assert!((1..=60).contains(&secs), "{secs}");
    let (s, _, _) = call(&app, req("POST", "/check", Some(OTHER), REQ)).await;
    assert_eq!(s, StatusCode::OK, "another caller has its own bucket");
}

#[tokio::test]
async fn check_returns_rustc_diagnostics() {
    let (s, _, body) = call(&default_app(), req("POST", "/check", Some(TOKEN), REQ)).await;
    assert_eq!(s, StatusCode::OK);
    let r: BuildReport = serde_json::from_str(&body).unwrap();
    assert!(!r.ok);
    assert_eq!(
        (r.diagnostics[0].code.as_str(), r.diagnostics[0].line),
        ("E0308", 2)
    );
    let stages: Vec<_> = r.timings.iter().map(|t| t.stage.as_str()).collect();
    assert_eq!(stages, ["render", "check"]);
}

#[tokio::test]
async fn check_reports_manifest_errors_without_cargo() {
    let fake = Arc::new(Fake::default());
    let app = app(Arc::clone(&fake), RateConfig::default(), 1);
    let bad = REQ.replace(r#""job_types":["t"]"#, r#""job_types":[]"#);
    let (s, _, body) = call(&app, req("POST", "/check", Some(TOKEN), &bad)).await;
    assert_eq!(s, StatusCode::OK);
    let r: BuildReport = serde_json::from_str(&body).unwrap();
    assert!(!r.ok && !r.diagnostics.is_empty(), "{body}");
    assert_eq!(fake.peak.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn failed_build_has_report_events_and_ndjson_stream() {
    let app = default_app();
    let (s, _, body) = call(&app, req("POST", "/builds", Some(TOKEN), REQ)).await;
    assert_eq!(s, StatusCode::ACCEPTED);
    let Submitted { id } = serde_json::from_str(&body).unwrap();

    let (s, h, body) = call(
        &app,
        req("GET", &format!("/builds/{id}/events"), Some(TOKEN), ""),
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(h[header::CONTENT_TYPE], "application/x-ndjson");
    let events: Vec<BuildEvent> = body
        .lines()
        .map(|l| serde_json::from_str(l).unwrap())
        .collect();
    let st = wait_final(&app, &id, TOKEN).await;
    assert_eq!(st.state, BuildState::Failed);
    assert_eq!(events, st.events, "the stream is the full event log");
    assert_eq!(
        st.events.first().zip(st.events.last()),
        Some((&BuildEvent::Queued, &BuildEvent::Done { ok: false }))
    );
    assert!(st.events.contains(&BuildEvent::Started {
        stage: "check".into()
    }));
    assert!(st
        .events
        .iter()
        .any(|e| matches!(e, BuildEvent::Finished { stage, ok: false, .. } if stage == "check")));
    assert_eq!(st.report.unwrap().diagnostics[0].code, "E0308");
    assert!(st.published.is_none());
}

#[tokio::test]
async fn builds_are_private_to_their_caller() {
    let app = default_app();
    let (_, _, body) = call(&app, req("POST", "/builds", Some(TOKEN), REQ)).await;
    let Submitted { id } = serde_json::from_str(&body).unwrap();
    for uri in [format!("/builds/{id}"), format!("/builds/{id}/events")] {
        let (s, _, _) = call(&app, req("GET", &uri, Some(OTHER), "")).await;
        assert_eq!(s, StatusCode::NOT_FOUND, "{uri}");
    }
    let (s, _, _) = call(&app, req("GET", "/builds/nope", Some(TOKEN), "")).await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    wait_final(&app, &id, TOKEN).await;
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn semaphore_caps_concurrent_builds() {
    let fake = Arc::new(Fake {
        delay: Duration::from_millis(50),
        ..Default::default()
    });
    let app = app(Arc::clone(&fake), RateConfig::default(), 1);
    let mut ids = vec![];
    for _ in 0..3 {
        let (_, _, body) = call(&app, req("POST", "/builds", Some(TOKEN), REQ)).await;
        ids.push(serde_json::from_str::<Submitted>(&body).unwrap().id);
    }
    for id in &ids {
        wait_final(&app, id, TOKEN).await;
    }
    assert_eq!(fake.peak.load(Ordering::SeqCst), 1);
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn full_queue_is_a_503_with_retry_after() {
    let fake = Arc::new(Fake {
        delay: Duration::from_millis(200),
        ..Default::default()
    });
    // One running, one waiting; the third has nowhere to go.
    let app = app_q(fake, RateConfig::default(), 1, 1);
    let mut ids = vec![];
    let mut refused = None;
    for _ in 0..3 {
        let (s, h, body) = call(&app, req("POST", "/builds", Some(TOKEN), REQ)).await;
        if s == StatusCode::ACCEPTED {
            ids.push(serde_json::from_str::<Submitted>(&body).unwrap().id);
        } else {
            refused = Some((s, h));
        }
        tokio::time::sleep(Duration::from_millis(20)).await;
    }
    let (s, h) = refused.expect("one build refused");
    assert_eq!(s, StatusCode::SERVICE_UNAVAILABLE);
    assert!(h.contains_key(header::RETRY_AFTER));
    for id in &ids {
        wait_final(&app, id, TOKEN).await;
    }
    // Slots are released: a new build is accepted again.
    let (s, _, _) = call(&app, req("POST", "/builds", Some(TOKEN), REQ)).await;
    assert_eq!(s, StatusCode::ACCEPTED);
}
