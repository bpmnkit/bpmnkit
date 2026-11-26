//! The order-fulfilment blueprint end to end: the builder builds both workers into a signed
//! registry, the host hot-loads them, and reebe runs one instance down the happy path and one
//! down the declined path (`PAYMENT_DECLINED` boundary -> notify script -> cancelled end).
//! Ignored by default; without `BPMNKIT_WORKER_E2E_URL` it returns at once. The charge-card
//! worker's payment API is answered by host-side HTTP stubs, so nothing leaves the machine.

use std::sync::Arc;
use std::time::Duration;

use axum::body::Body;
use axum::http::{header, Request, StatusCode};
use bpmnkit_wasm_build::{LocalExecutor, Toolchain};
use bpmnkit_wasm_builder::*;
use bpmnkit_wasm_contract::{
    BuildRequest, DirRegistry, HttpStub, RegistryStore, SampleJob, SigningKey,
};
use bpmnkit_wasm_host::{Engine, EngineOptions, Event, HttpStubs, MapSecrets, Watcher};
use bpmnkit_wasm_test_support::wasm_root;
use bpmnkit_worker::{ClientConfig, RestClient, Worker, WorkerConfig};
use serde_json::{json, Value};
use tower::ServiceExt;

const TOKEN: &str = "e2e-token-0123456789";
const CHARGE_URL: &str = "https://api.payments.example/v1/charges";

fn base() -> String {
    std::env::var("BPMNKIT_WORKER_E2E_URL").unwrap_or_else(|_| "http://localhost:8080".into())
}

fn stub(status: u16, body: &str) -> HttpStub {
    serde_json::from_value(json!({
        "method": "POST", "url": CHARGE_URL, "status": status, "body": body
    }))
    .unwrap()
}

/// Builds one blueprint worker through the builder's HTTP API; returns its digest string.
async fn build(app: &axum::Router, dir: &str) -> String {
    let d = wasm_root().join("examples/order-fulfilment").join(dir);
    let body = serde_json::to_string(&BuildRequest {
        manifest: toml::from_str(&std::fs::read_to_string(d.join("worker.toml")).unwrap()).unwrap(),
        source: std::fs::read_to_string(d.join("src/lib.rs")).unwrap(),
        samples: serde_json::from_str::<Vec<SampleJob>>(
            &std::fs::read_to_string(d.join("samples.json")).unwrap(),
        )
        .unwrap(),
    })
    .unwrap();
    let send = |m: &str, uri: String, body: String| {
        let r = Request::builder()
            .method(m)
            .uri(uri)
            .header(header::AUTHORIZATION, format!("Bearer {TOKEN}"))
            .body(Body::from(body))
            .unwrap();
        let app = app.clone();
        async move {
            let res = app.oneshot(r).await.unwrap();
            let s = res.status();
            let b = axum::body::to_bytes(res.into_body(), usize::MAX)
                .await
                .unwrap();
            (s, String::from_utf8(b.to_vec()).unwrap())
        }
    };
    let (s, b) = send("POST", "/builds".into(), body).await;
    assert_eq!(s, StatusCode::ACCEPTED, "{b}");
    let Submitted { id } = serde_json::from_str(&b).unwrap();
    let (_, events) = send("GET", format!("/builds/{id}/events"), String::new()).await;
    assert!(
        events.trim_end().ends_with(r#"{"event":"done","ok":true}"#),
        "{dir}: {events}"
    );
    let st: BuildStatus =
        serde_json::from_str(&send("GET", format!("/builds/{id}"), String::new()).await.1).unwrap();
    assert_eq!(st.state, BuildState::Succeeded, "{dir}: {st:?}");
    // The builder already ran the samples (stubbed HTTP) in its smoke test.
    assert!(st.report.unwrap().tests.iter().all(|t| t.passed), "{dir}");
    st.published.unwrap().digest.to_string()
}

async fn deploy(http: &reqwest::Client) {
    let bpmn =
        std::fs::read_to_string(wasm_root().join("examples/order-fulfilment/order.bpmn")).unwrap();
    let boundary = "bpmnkit-e2e-boundary";
    let body = format!(
        "--{boundary}\r\nContent-Disposition: form-data; name=\"resources\"; filename=\"order.bpmn\"\r\nContent-Type: application/xml\r\n\r\n{bpmn}\r\n--{boundary}--\r\n"
    );
    let r = http
        .post(format!("{}/v2/deployments", base()))
        .header(
            "content-type",
            format!("multipart/form-data; boundary={boundary}"),
        )
        .body(body)
        .send()
        .await
        .expect("reebe is running (see BPMNKIT_WORKER_E2E_URL)");
    assert!(r.status().is_success(), "deploy: {}", r.status());
}

async fn post(http: &reqwest::Client, path: &str, body: Value) -> Value {
    let r = http
        .post(format!("{}{path}", base()))
        .json(&body)
        .send()
        .await
        .unwrap();
    assert!(r.status().is_success(), "{path}: {}", r.status());
    r.json().await.unwrap()
}

/// Starts an instance for `sku`, serves it with `handlers` (charge-card answered by `charge`),
/// and returns the instance's final variable names once it has completed.
async fn run_instance(
    http: &reqwest::Client,
    handlers: &[bpmnkit_wasm_host::WasmHandler],
    charge: HttpStub,
    marker: &str,
) -> Vec<String> {
    let started = post(
        http,
        "/v2/process-instances",
        json!({ "processDefinitionId": "order-fulfilment",
                "variables": { "sku": "widget", "quantity": 2, "customerId": "c-1", "amountCents": 2500 } }),
    )
    .await;
    let key = started["processInstanceKey"].clone();
    let stubs = Arc::new(HttpStubs::new(vec![charge]));
    let client = Arc::new(
        RestClient::new(ClientConfig {
            rest_address: base(),
            ..ClientConfig::default()
        })
        .unwrap(),
    );
    let wait = async {
        let deadline = tokio::time::Instant::now() + Duration::from_secs(30);
        while tokio::time::Instant::now() < deadline {
            let r = post(
                http,
                "/v2/process-instances/search",
                json!({ "filter": { "processInstanceKey": key } }),
            )
            .await;
            if r["items"].as_array().is_some_and(|i| {
                i.iter()
                    .any(|p| p["processInstanceKey"] == key && p["state"] == "COMPLETED")
            }) {
                return;
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        panic!("instance {key} did not complete in 30 s");
    };
    // Both workers stop once the instance has completed.
    let done = Arc::new(tokio::sync::Notify::new());
    let mk = |job_type: &str, h: &bpmnkit_wasm_host::WasmHandler| {
        let config = WorkerConfig::new(job_type)
            .request_timeout(Duration::from_secs(1))
            .drain_timeout(Duration::from_secs(10));
        let h = h.clone().with_http_stubs(Arc::clone(&stubs));
        let (c, d) = (Arc::clone(&client), Arc::clone(&done));
        async move {
            Worker::new(c, config, h)
                .run(async move { d.notified().await })
                .await
        }
    };
    let (a, b, ()) = tokio::join!(
        mk("check-stock", &handlers[0]),
        mk("charge-card", &handlers[1]),
        async {
            wait.await;
            done.notify_waiters();
        }
    );
    assert!(a.abandoned.is_empty() && b.abandoned.is_empty());
    // The variable projection can trail the instance state, so wait for the path's marker.
    let mut names = Vec::new();
    for _ in 0..50 {
        let vars = post(
            http,
            "/v2/variables/search",
            json!({ "filter": { "processInstanceKey": key } }),
        )
        .await;
        names = vars["items"]
            .as_array()
            .unwrap()
            .iter()
            .filter_map(|v| v["name"].as_str().map(str::to_owned))
            .collect();
        if names.iter().any(|n| n == marker) {
            break;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    names
}

#[tokio::test(flavor = "multi_thread")]
#[ignore = "needs wasm32-wasip2, a running reebe server and network"]
async fn blueprint_happy_and_declined_paths() {
    if std::env::var_os("BPMNKIT_WORKER_E2E_URL").is_none() {
        eprintln!("BPMNKIT_WORKER_E2E_URL not set, skipping");
        return;
    }
    // Build both workers into a signed registry.
    let root = wasm_root().join("target/builder-e2e");
    let reg_dir = root.join(format!("blueprint-registry-{}", std::process::id()));
    let mut tc = Toolchain::local(Toolchain::in_repo_sdk().unwrap());
    tc.target_dir = Some(root.join("target"));
    tc.work_root = root.join("work");
    let rw = vec![tc.work_root.clone(), root.join("target")];
    std::fs::create_dir_all(&rw[0]).unwrap();
    std::fs::create_dir_all(&rw[1]).unwrap();
    let (iso, _) = detect(rw, Caps::default());
    if matches!(iso, Isolation::Bwrap { .. }) {
        warm(&tc, &LocalExecutor).unwrap();
        tc.offline = true;
    }
    let key = SigningKey::from_bytes(&[9; 32]);
    let app = router(Builder::new(
        Config {
            tokens: Tokens::parse(TOKEN).unwrap(),
            rate: RateConfig::default(),
            max_builds: 1,
            max_queued: 16,
            toolchain: tc,
        },
        DirRegistry::new(&reg_dir),
        key.clone(),
        SandboxExecutor::new(iso, LocalExecutor),
    ));
    let names = ["check-stock", "charge-card"];
    for n in names {
        let digest = build(&app, n).await;
        assert_eq!(
            DirRegistry::new(&reg_dir)
                .current(n)
                .unwrap()
                .unwrap()
                .to_string(),
            digest
        );
    }

    // The host hot-loads the signed entries.
    let engine = Engine::new(EngineOptions {
        pool_slots: Some(4),
        ..EngineOptions::default()
    })
    .unwrap();
    let (watcher, events) = Watcher::start(
        engine,
        DirRegistry::new(&reg_dir),
        key.verifying_key(),
        &names.map(String::from),
        Arc::new(MapSecrets::from([("PAYMENT_API_KEY", "sk_test")])),
    );
    assert!(
        events.iter().all(|e| matches!(e, Event::Loaded { .. })),
        "{events:?}"
    );
    let handlers = watcher.handlers();

    let http = reqwest::Client::new();
    deploy(&http).await;
    let happy = run_instance(&http, &handlers, stub(200, r#"{"id":"ch_1"}"#), "charged").await;
    assert!(happy.contains(&"charged".to_string()), "{happy:?}");
    assert!(!happy.contains(&"notification".to_string()), "{happy:?}");
    let declined = run_instance(
        &http,
        &handlers,
        stub(402, r#"{"error":"declined"}"#),
        "notification",
    )
    .await;
    assert!(
        declined.contains(&"notification".to_string()),
        "{declined:?}"
    );
    let _ = std::fs::remove_dir_all(&reg_dir);
}
