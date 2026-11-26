//! A real `echo` component completes a job on a running reebe server: deploy a BPMN with one
//! service task, start an instance, let `WasmHandler` serve it, read the instance's variables back.
//! Ignored by default; without `BPMNKIT_WORKER_E2E_URL` it returns at once. CI's `wasm-workers` job starts reebe
//! and sets `BPMNKIT_WORKER_E2E_URL`, like `worker-e2e.yml`.
mod common;

use std::sync::Arc;
use std::time::Duration;

use bpmnkit_wasm_host::{load, MapSecrets, WasmHandler};
use bpmnkit_wasm_test_support::fixture_dir;
use bpmnkit_worker::{ClientConfig, RestClient, Worker, WorkerConfig};
use serde_json::{json, Value};

fn base() -> String {
    std::env::var("BPMNKIT_WORKER_E2E_URL").unwrap_or_else(|_| "http://localhost:8080".into())
}

fn bpmn(process: &str) -> String {
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="http://bpmnkit.com/e2e">
  <bpmn:process id="{process}" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="work">
      <bpmn:extensionElements><zeebe:taskDefinition type="echo" /></bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="end"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="work" />
    <bpmn:sequenceFlow id="f2" sourceRef="work" targetRef="end" />
  </bpmn:process>
</bpmn:definitions>"#
    )
}

#[tokio::test]
#[ignore = "needs a running reebe server and wasm32-wasip2"]
async fn echo_component_completes_a_job() {
    // `verify:wasm` runs ignored tests everywhere; without a server there is nothing to do.
    if std::env::var_os("BPMNKIT_WORKER_E2E_URL").is_none() {
        eprintln!("BPMNKIT_WORKER_E2E_URL not set, skipping");
        return;
    }
    let http = reqwest::Client::new();
    let process = format!(
        "wasm_e2e_{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    );
    let boundary = "bpmnkit-e2e-boundary";
    let body = format!(
        "--{boundary}\r\nContent-Disposition: form-data; name=\"resources\"; filename=\"{process}.bpmn\"\r\nContent-Type: application/xml\r\n\r\n{}\r\n--{boundary}--\r\n",
        bpmn(&process)
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
    let r = http
        .post(format!("{}/v2/process-instances", base()))
        .json(&json!({ "processDefinitionId": process, "variables": { "amount": 5 } }))
        .send()
        .await
        .unwrap();
    assert!(r.status().is_success(), "start: {}", r.status());
    let instance = r.json::<Value>().await.unwrap()["processInstanceKey"].clone();

    let loaded = load(&common::engine(), &fixture_dir("echo")).unwrap();
    let handler = WasmHandler::new(loaded, Arc::new(MapSecrets::default()));
    let client = Arc::new(
        RestClient::new(ClientConfig {
            rest_address: base(),
            ..ClientConfig::default()
        })
        .unwrap(),
    );
    let config = WorkerConfig::new("echo")
        .request_timeout(Duration::from_secs(1))
        .drain_timeout(Duration::from_secs(10));
    let report = Worker::new(client, config, handler)
        .run(async {
            // Until the instance has completed, at most 20 s.
            let deadline = tokio::time::Instant::now() + Duration::from_secs(20);
            while tokio::time::Instant::now() < deadline {
                if completed(&http, &process, &instance).await {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(100)).await;
            }
        })
        .await;
    assert!(report.abandoned.is_empty());

    // Variables can lag the instance state.
    let mut vars = Value::Null;
    for _ in 0..50 {
        vars = http
            .post(format!("{}/v2/variables/search", base()))
            .json(&json!({ "filter": { "processInstanceKey": instance } }))
            .send()
            .await
            .unwrap()
            .json()
            .await
            .unwrap();
        let has_output = vars["items"].as_array().is_some_and(|i| {
            i.iter()
                .any(|v| v["name"] == "job_key" && v["processInstanceKey"] == instance)
        });
        if has_output {
            break;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    let names: Vec<&str> = vars["items"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|v| v["processInstanceKey"] == instance)
        .filter_map(|v| v["name"].as_str())
        .collect();
    assert!(names.contains(&"job_key"), "echo output missing: {vars}");
    assert!(names.contains(&"amount"), "{vars}");
}

// reebe's search may ignore the filter, so match the instance key in the results.
async fn completed(http: &reqwest::Client, process: &str, instance: &Value) -> bool {
    let r: Value = http
        .post(format!("{}/v2/process-instances/search", base()))
        .json(&json!({ "filter": { "processDefinitionId": process } }))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    r["items"].as_array().is_some_and(|i| {
        i.iter()
            .any(|p| p["processInstanceKey"] == *instance && p["state"] == "COMPLETED")
    })
}
