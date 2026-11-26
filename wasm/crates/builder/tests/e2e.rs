//! Full build of the `echo` fixture through the HTTP API into a signed registry entry.

use axum::body::Body;
use axum::http::{header, Request, StatusCode};
use bpmnkit_wasm_build::{LocalExecutor, Toolchain};
use bpmnkit_wasm_builder::*;
use bpmnkit_wasm_contract::{
    verify_signature, BuildRequest, DirRegistry, RegistryStore, SampleJob, SigningKey,
};
use bpmnkit_wasm_test_support::{fixture_manifest, fixture_src, wasm_root};
use tower::ServiceExt;

const TOKEN: &str = "e2e-token-0123456789";

#[tokio::test(flavor = "multi_thread")]
#[ignore = "needs wasm32-wasip2 and network"]
async fn echo_fixture_builds_signs_and_publishes() {
    let root = wasm_root().join("target/builder-e2e");
    let reg_dir = root.join(format!("registry-{}", std::process::id()));
    let mut tc = Toolchain::local(Toolchain::in_repo_sdk().unwrap());
    tc.target_dir = Some(root.join("target"));
    tc.work_root = root.join("work");
    let rw = vec![tc.work_root.clone(), root.join("target")];
    std::fs::create_dir_all(&rw[0]).unwrap();
    std::fs::create_dir_all(&rw[1]).unwrap();
    let (iso, _) = detect(rw, Caps::default());
    if matches!(iso, Isolation::Bwrap { .. }) {
        // No network inside bwrap: fetch and compile the dependencies first.
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
    let body = serde_json::to_string(&BuildRequest {
        manifest: toml::from_str(&fixture_manifest("echo")).unwrap(),
        source: std::fs::read_to_string(fixture_src("echo").join("src/lib.rs")).unwrap(),
        samples: vec![serde_json::from_value::<SampleJob>(serde_json::json!({
            "name": "echoes", "job_type": "echo", "variables": { "a": 1 }, "expect": "complete"
        }))
        .unwrap()],
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
    // The stream follows the build to its end.
    let (_, events) = send("GET", format!("/builds/{id}/events"), String::new()).await;
    assert!(
        events.trim_end().ends_with(r#"{"event":"done","ok":true}"#),
        "{events}"
    );
    let st: BuildStatus =
        serde_json::from_str(&send("GET", format!("/builds/{id}"), String::new()).await.1).unwrap();
    assert_eq!(st.state, BuildState::Succeeded, "{st:?}");
    let report = st.report.unwrap();
    assert!(report.tests.iter().all(|t| t.passed), "{:?}", report.tests);
    let p = st.published.unwrap();
    assert_eq!(p.name, "echo");

    let reg = DirRegistry::new(&reg_dir);
    assert_eq!(reg.current("echo").unwrap(), Some(p.digest.clone()));
    let e = reg.load("echo", &p.digest).unwrap();
    assert_eq!(e.metadata.component_digest, p.digest);
    verify_signature(&key.verifying_key(), &p.digest, &e.manifest, &e.signature).unwrap();
    let other = SigningKey::from_bytes(&[1; 32]).verifying_key();
    assert!(verify_signature(&other, &p.digest, &e.manifest, &e.signature).is_err());
    let _ = std::fs::remove_dir_all(&reg_dir);
}
