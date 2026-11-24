//! Against the real guest fixtures (WP2's SDK, built for wasm32-wasip2).
mod common;

use std::io;
use std::net::{IpAddr, SocketAddr};
use std::sync::Arc;

use bpmnkit_wasm_contract::{validate_with, Manifest, PlatformCeilings};
use bpmnkit_wasm_host::{
    load, run_job, Engine, EngineOptions, MapSecrets, NetPolicy, Outcome, Resolver,
};
use bpmnkit_wasm_test_support::{build_fixture, fixture_dir};
use common::job;
use serde_json::{json, Value};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

fn fixture(name: &str) -> bpmnkit_wasm_host::Loaded {
    load(&common::engine(), &fixture_dir(name)).unwrap()
}

fn complete(o: Outcome) -> Value {
    match o {
        Outcome::Complete(s) => serde_json::from_str(&s).unwrap(),
        other => panic!("expected complete, got {other:?}"),
    }
}

fn fail_message(o: Outcome) -> String {
    match o {
        Outcome::Fail(f) => f.message,
        other => panic!("expected fail, got {other:?}"),
    }
}

#[tokio::test]
#[ignore = "needs wasm32-wasip2"]
async fn echo_completes() {
    let o = run_job(&fixture("echo"), job(r#"{"a":1}"#), &MapSecrets::default()).await;
    assert_eq!(complete(o), json!({"a": 1, "job_key": "1"}));
}

#[tokio::test]
#[ignore = "needs wasm32-wasip2"]
async fn throw_is_a_bpmn_error() {
    let o = run_job(&fixture("throw"), job("{}"), &MapSecrets::default()).await;
    assert!(
        matches!(o, Outcome::ThrowError(ref e) if e.code == "ECHO_ERROR"),
        "{o:?}"
    );
}

#[tokio::test]
#[ignore = "needs wasm32-wasip2"]
async fn panic_becomes_fail() {
    let m = fail_message(run_job(&fixture("panic"), job("{}"), &MapSecrets::default()).await);
    assert!(m.starts_with("worker trapped:"), "{m}");
}

#[tokio::test]
#[ignore = "needs wasm32-wasip2"]
async fn spin_hits_the_timeout() {
    // Load first: compiling the component is slow in a debug build and is not the timeout.
    let spin = fixture("spin");
    let t = std::time::Instant::now();
    let m = fail_message(run_job(&spin, job("{}"), &MapSecrets::default()).await);
    assert_eq!(m, "worker exceeded its timeout of 1000 ms");
    assert!(t.elapsed().as_millis() < 3000, "{:?}", t.elapsed());
}

#[tokio::test]
#[ignore = "needs wasm32-wasip2"]
async fn secret_sees_only_declared_names() {
    let src = MapSecrets::from([("API_KEY", "k"), ("OTHER", "leak")]);
    let o = run_job(&fixture("secret"), job("{}"), &src).await;
    assert_eq!(complete(o), json!({"api_key": "k", "other_visible": false}));
}

#[tokio::test]
#[ignore = "needs wasm32-wasip2"]
async fn http_outside_the_allow_list_is_denied() {
    let o = run_job(
        &fixture("http-get"),
        job(r#"{"url":"https://evil.example.com/"}"#),
        &MapSecrets::default(),
    )
    .await;
    let m = fail_message(o);
    assert!(m.contains("HttpRequestDenied"), "{m}");
}

/// `api.example.com` → 127.0.0.1, so the test needs no DNS and no internet.
struct Local;
impl Resolver for Local {
    fn resolve(&self, _: &str, port: u16) -> io::Result<Vec<SocketAddr>> {
        Ok(vec![SocketAddr::new(IpAddr::from([127, 0, 0, 1]), port)])
    }
}

fn http_get_on(port: u16, allow_private: bool) -> bpmnkit_wasm_host::Loaded {
    let engine = Engine::new(EngineOptions {
        pool_slots: Some(2),
        net: NetPolicy {
            resolver: Arc::new(Local),
            allow_private_addrs: allow_private,
            allow_plain_http: true,
        },
    })
    .unwrap();
    // A test server listens on a random port; the platform only allows 443 by default.
    let raw: Manifest = serde_json::from_value(json!({
        "worker": {"name": "http-get", "version": "0.1.0", "job_types": ["http-get"]},
        "network": {"allow": [format!("api.example.com:{port}")]},
    }))
    .unwrap();
    let ceilings = PlatformCeilings {
        ports: vec![port],
        ..PlatformCeilings::default()
    };
    let m = validate_with(raw, &ceilings).unwrap();
    engine
        .load_bytes(m, &std::fs::read(build_fixture("http-get")).unwrap())
        .unwrap()
}

async fn one_shot_server() -> u16 {
    let l = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let port = l.local_addr().unwrap().port();
    tokio::spawn(async move {
        let (mut s, _) = l.accept().await.unwrap();
        let mut buf = [0u8; 4096];
        let _ = s.read(&mut buf).await.unwrap();
        s.write_all(b"HTTP/1.1 200 OK\r\ncontent-length: 5\r\nconnection: close\r\n\r\nhello")
            .await
            .unwrap();
    });
    port
}

#[tokio::test(flavor = "multi_thread")]
#[ignore = "needs wasm32-wasip2"]
async fn http_to_an_allowed_host_goes_through() {
    let port = one_shot_server().await;
    let o = run_job(
        &http_get_on(port, true),
        job(&format!(r#"{{"url":"http://api.example.com:{port}/x"}}"#)),
        &MapSecrets::default(),
    )
    .await;
    assert_eq!(complete(o), json!({"status": 200, "body": "hello"}));
}

#[tokio::test(flavor = "multi_thread")]
#[ignore = "needs wasm32-wasip2"]
async fn allowed_name_resolving_to_loopback_is_blocked() {
    let port = one_shot_server().await;
    let m = fail_message(
        run_job(
            &http_get_on(port, false),
            job(&format!(r#"{{"url":"http://api.example.com:{port}/x"}}"#)),
            &MapSecrets::default(),
        )
        .await,
    );
    assert!(m.contains("DestinationIpProhibited"), "{m}");
}
