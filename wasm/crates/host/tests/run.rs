mod common;

use std::time::{Duration, Instant};

use bpmnkit_wasm_host::{
    run_job, run_job_blocking, BpmnError, Failure, LoadError, MapSecrets, Outcome,
};
use common::*;

fn fail_message(o: Outcome) -> String {
    match o {
        Outcome::Fail(f) => f.message,
        other => panic!("expected fail, got {other:?}"),
    }
}

#[tokio::test]
async fn completes_with_the_guest_output() {
    let l = loaded(ECHO, "");
    let o = run_job(&l, job(r#"{"a":1}"#), &MapSecrets::default()).await;
    assert_eq!(o, Outcome::Complete(r#"{"a":1}"#.into()));
}

#[test]
fn blocking_variant_needs_no_runtime() {
    let o = run_job_blocking(&loaded(ECHO, ""), job("{}"), &MapSecrets::default());
    assert_eq!(o, Outcome::Complete("{}".into()));
}

#[tokio::test]
async fn fail_and_throw_cross_the_boundary() {
    let s = MapSecrets::default();
    assert_eq!(
        run_job(&loaded(FAIL, ""), job("{}"), &s).await,
        Outcome::Fail(Failure {
            message: "boom".into(),
            retries: Some(2),
            retry_backoff_ms: Some(5000)
        })
    );
    assert_eq!(
        run_job(&loaded(THROW, ""), job("{}"), &s).await,
        Outcome::ThrowError(BpmnError {
            code: "E".into(),
            message: "boom".into(),
            variables: Some("{}".into())
        })
    );
}

#[tokio::test]
async fn trap_becomes_fail() {
    let m = fail_message(run_job(&loaded(TRAP, ""), job("{}"), &MapSecrets::default()).await);
    assert!(m.starts_with("worker trapped:"), "{m}");
}

#[tokio::test]
async fn endless_loop_hits_the_timeout() {
    let l = loaded(SPIN, "[limits]\ntimeout_ms = 200");
    let t = Instant::now();
    let m = fail_message(run_job(&l, job("{}"), &MapSecrets::default()).await);
    assert_eq!(m, "worker exceeded its timeout of 200 ms");
    assert!(t.elapsed() < Duration::from_secs(2), "{:?}", t.elapsed());
}

#[tokio::test]
async fn memory_limit_is_enforced() {
    let s = MapSecrets::default();
    // 64 KB initial + 12.5 MB fits in 16 MB but not in 8 MB.
    let ok = run_job(&loaded(&grow(), "[limits]\nmemory_mb = 16"), job("{}"), &s).await;
    assert_eq!(ok, Outcome::Complete("{}".into()));
    let m = fail_message(run_job(&loaded(&grow(), "[limits]\nmemory_mb = 8"), job("{}"), &s).await);
    assert_eq!(m, "worker exceeded its memory limit of 8 MB");
}

#[tokio::test]
async fn only_declared_secrets_resolve() {
    let l = loaded(SECRET, "[secrets]\nnames = [\"API_KEY\"]");
    let src = MapSecrets::from([("API_KEY", r#"{"k":"v"}"#), ("OTHER", "leak")]);
    assert_eq!(
        run_job(&l, job("API_KEY"), &src).await,
        Outcome::Complete(r#"{"k":"v"}"#.into())
    );
    assert_eq!(fail_message(run_job(&l, job("OTHER"), &src).await), "none");
    assert_eq!(
        fail_message(run_job(&l, job("API_KEY"), &MapSecrets::default()).await),
        "none"
    );
}

#[tokio::test]
async fn stores_are_not_shared_between_jobs() {
    // The bump allocator lives in a global; a reused instance would hand out new addresses,
    // a fresh one returns the same output every time.
    let l = loaded(ECHO, "");
    for _ in 0..3 {
        assert_eq!(
            run_job(&l, job(r#"{"n":1}"#), &MapSecrets::default()).await,
            Outcome::Complete(r#"{"n":1}"#.into())
        );
    }
}

#[test]
fn load_rejects_what_verify_rejects() {
    // A component without `handle` export: a bare component.
    let e = engine()
        .load_bytes(manifest(""), &wat::parse_str("(component)").unwrap())
        .unwrap_err();
    assert!(matches!(e, LoadError::Verify(_)), "{e}");
    let e = engine().load_bytes(manifest(""), b"not wasm").unwrap_err();
    assert!(matches!(e, LoadError::Inspect(_)), "{e}");
}

#[test]
fn load_reads_a_worker_directory() {
    let dir = std::env::temp_dir().join(format!("bpmnkit-wasm-host-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(dir.join("worker.toml"), manifest("").to_toml()).unwrap();
    std::fs::write(dir.join("worker.wasm"), component(ECHO)).unwrap();
    let l = bpmnkit_wasm_host::load(&engine(), &dir).unwrap();
    assert_eq!(l.manifest.worker.name, "t");
    std::fs::remove_file(dir.join("worker.wasm")).unwrap();
    assert!(matches!(
        bpmnkit_wasm_host::load(&engine(), &dir),
        Err(LoadError::Io(..))
    ));
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn compiled_components_are_cached_by_digest() {
    let e = engine();
    let bytes = component(ECHO);
    let a = e.load_bytes(manifest(""), &bytes).unwrap();
    let b = e.load_bytes(manifest(""), &bytes).unwrap();
    assert_eq!(a.digest, b.digest);
    assert!(e.cached(&a.digest));
}
