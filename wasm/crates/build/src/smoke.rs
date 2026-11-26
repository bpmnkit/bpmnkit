//! Runs the built component in Wasmtime with its manifest's limits against the agent's sample
//! jobs. Secrets are fake; outbound HTTP the manifest allows is answered from the sample's
//! `http` stubs and nothing resolves, so no packet leaves the machine and a request without a
//! stub fails inside the sandbox, visibly.

use std::io;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Instant;

use bpmnkit_wasm_contract::{ExpectedOutcome, SampleJob, TestResult};
use bpmnkit_wasm_host::{
    run_job_stubbed_blocking, Engine, EngineOptions, HttpStubs, Job, MapSecrets, NetPolicy,
    Outcome, Resolver,
};

use crate::cargo::Built;

/// Defence in depth: stubs answer before any lookup, and this one resolves nothing.
struct NoNetwork;
impl Resolver for NoNetwork {
    fn resolve(&self, _: &str, _: u16) -> io::Result<Vec<SocketAddr>> {
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
    let engine = match Engine::new(EngineOptions {
        // On-demand allocation: no up-front virtual memory for a one-shot run.
        pool_slots: None,
        net: NetPolicy {
            resolver: Arc::new(NoNetwork),
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
            let stubs = Arc::new(HttpStubs::new(s.http.clone()));
            let outcome = run_job_stubbed_blocking(&loaded, job, &secrets, Arc::clone(&stubs));
            let expect = s.expect.unwrap_or(ExpectedOutcome::Complete);
            let passed = kind(&outcome) == expect;
            let mut message = describe(&outcome);
            let unmatched = stubs.unmatched();
            if !unmatched.is_empty() {
                message.push_str(&format!(" (no HTTP stub for: {})", unmatched.join(", ")));
            }
            result(&s.name, passed, Some(message), t)
        })
        .collect()
}
