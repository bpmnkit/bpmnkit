//! Runs the built component in Wasmtime with its manifest's limits against the agent's sample
//! jobs. Secrets are fake; the network is a recording stub that resolves nothing, so no packet
//! leaves the machine and a worker that calls out fails inside the sandbox, visibly.

use std::io;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use std::time::Instant;

use bpmnkit_wasm_contract::{ExpectedOutcome, SampleJob, TestResult};
use bpmnkit_wasm_host::{
    run_job_blocking, Engine, EngineOptions, Job, MapSecrets, NetPolicy, Outcome, Resolver,
};

use crate::cargo::Built;

/// Records every host a worker tried to reach and refuses to resolve it.
#[derive(Default)]
struct Recording(Mutex<Vec<String>>);
impl Resolver for Recording {
    fn resolve(&self, host: &str, port: u16) -> io::Result<Vec<SocketAddr>> {
        self.0.lock().expect("lock").push(format!("{host}:{port}"));
        Err(io::Error::other("no network in smoke tests"))
    }
}

fn kind(o: &Outcome) -> ExpectedOutcome {
    match o {
        Outcome::Complete(_) => ExpectedOutcome::Complete,
        Outcome::Fail(_) => ExpectedOutcome::Fail,
        Outcome::ThrowError(_) => ExpectedOutcome::ThrowError,
    }
}

fn describe(o: &Outcome) -> String {
    match o {
        Outcome::Complete(v) => format!("complete {v}"),
        Outcome::Fail(f) => format!("fail: {}", f.message),
        Outcome::ThrowError(e) => format!("throw-error {}: {}", e.code, e.message),
    }
}

fn result(name: &str, passed: bool, message: Option<String>, t: Instant) -> TestResult {
    TestResult {
        name: name.into(),
        passed,
        message,
        duration_ms: t.elapsed().as_millis() as u64,
    }
}

/// One result per sample; with no samples, one failing result (a worker nobody ran is not tested).
pub fn smoke_test(b: &Built, samples: &[SampleJob]) -> Vec<TestResult> {
    let t0 = Instant::now();
    if samples.is_empty() {
        return vec![result(
            "samples",
            false,
            Some("no sample jobs: add samples.json with at least one job".into()),
            t0,
        )];
    }
    let recording = Arc::new(Recording::default());
    let engine = match Engine::new(EngineOptions {
        // On-demand allocation: no up-front virtual memory for a one-shot run.
        pool_slots: None,
        net: NetPolicy {
            resolver: Arc::clone(&recording) as Arc<dyn Resolver>,
            ..NetPolicy::default()
        },
    }) {
        Ok(e) => e,
        Err(e) => return vec![result("engine", false, Some(e.to_string()), t0)],
    };
    let loaded = match engine.load_bytes(b.manifest.clone(), &b.wasm) {
        Ok(l) => l,
        Err(e) => return vec![result("load", false, Some(e.to_string()), t0)],
    };
    // Every declared secret exists and is obviously fake.
    let secrets = MapSecrets(
        b.manifest
            .secrets
            .names
            .iter()
            .map(|n| (n.clone(), format!("fake-{n}")))
            .collect(),
    );
    samples
        .iter()
        .enumerate()
        .map(|(i, s)| {
            let t = Instant::now();
            if !b.manifest.worker.job_types.contains(&s.job_type) {
                return result(
                    &s.name,
                    false,
                    Some(format!(
                        "sample job type `{}` is not in the manifest's job_types",
                        s.job_type
                    )),
                    t,
                );
            }
            let vars = if s.variables.is_null() {
                "{}".to_owned()
            } else {
                s.variables.to_string()
            };
            let job = Job {
                key: (i + 1).to_string(),
                job_type: s.job_type.clone(),
                process_instance_key: "1".into(),
                element_id: "smoke".into(),
                retries: 3,
                variables: vars,
                custom_headers: s
                    .custom_headers
                    .iter()
                    .map(|(k, v)| (k.clone(), v.clone()))
                    .collect(),
            };
            let before = recording.0.lock().expect("lock").len();
            let outcome = run_job_blocking(&loaded, job, &secrets);
            let expect = s.expect.unwrap_or(ExpectedOutcome::Complete);
            let passed = kind(&outcome) == expect;
            let mut message = describe(&outcome);
            let reached: Vec<_> = recording.0.lock().expect("lock")[before..].to_vec();
            if !reached.is_empty() {
                message.push_str(&format!(" (blocked network: {})", reached.join(", ")));
            }
            result(&s.name, passed, Some(message), t)
        })
        .collect()
}
