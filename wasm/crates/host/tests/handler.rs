mod common;

use std::sync::Arc;
use std::time::Duration;

use bpmnkit_wasm_host::{MapSecrets, WasmHandler};
use bpmnkit_worker::testing::{map, run_handler, Call, FakeClient, MockJob};
use bpmnkit_worker::{Command, Runtime, WorkerConfig};
use common::*;
use serde_json::json;

fn handler(body: &str) -> WasmHandler {
    WasmHandler::new(loaded(body, ""), Arc::new(MapSecrets::default()))
}

#[tokio::test]
async fn maps_outcomes_to_commands() {
    let job = MockJob::new("t").var("a", 1).header("h", "v").build();
    match run_handler(&handler(ECHO), job.clone()).await {
        Command::Complete(c) => assert_eq!(c.variables, Some(map(json!({"a": 1})))),
        other => panic!("{other:?}"),
    }
    match run_handler(&handler(FAIL), job.clone()).await {
        Command::Fail(f) => {
            assert_eq!(f.error_message.as_deref(), Some("boom"));
            assert_eq!((f.retries, f.retry_back_off), (2, 5000));
        }
        other => panic!("{other:?}"),
    }
    match run_handler(&handler(THROW), job.clone()).await {
        Command::ThrowError(t) => {
            assert_eq!(t.error_code, "E");
            assert_eq!(t.error_message.as_deref(), Some("boom"));
            assert_eq!(t.variables, Some(map(json!({}))));
        }
        other => panic!("{other:?}"),
    }
    match run_handler(&handler(TRAP), job).await {
        Command::Fail(f) => {
            assert!(f.error_message.unwrap().starts_with("worker trapped:"));
            assert_eq!(f.retries, 2, "a trap uses the job's retries − 1");
        }
        other => panic!("{other:?}"),
    }
}

#[test]
fn non_object_output_fails() {
    use bpmnkit_wasm_host::handler::{to_result, to_wit};
    assert_eq!(to_wit(&MockJob::new("t").build()).variables, "{}");
    // Valid JSON, but process variables must be an object.
    assert!(to_result(bpmnkit_wasm_host::Outcome::Complete("[1]".into())).is_err());
}

#[tokio::test]
async fn serves_jobs_through_the_worker_runtime() {
    let client = Arc::new(FakeClient::new());
    client.push_jobs(vec![
        MockJob::new("t").key("10").var("x", "y").build(),
        MockJob::new("t").key("11").build(),
    ]);
    let rt = Runtime::new(Arc::clone(&client)).register(
        WorkerConfig::new("t").poll_interval(Duration::from_millis(10)),
        handler(ECHO),
    );
    let c = Arc::clone(&client);
    rt.run_until(async move {
        while c.commands().len() < 2 {
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await;
    let mut done: Vec<_> = client
        .commands()
        .into_iter()
        .map(|c| match c {
            Call::Complete(k, r) => (k, r.variables),
            other => panic!("{other:?}"),
        })
        .collect();
    done.sort_by(|a, b| a.0.cmp(&b.0));
    assert_eq!(
        done,
        [
            ("10".into(), Some(map(json!({"x": "y"})))),
            ("11".into(), Some(map(json!({})))),
        ]
    );
}
