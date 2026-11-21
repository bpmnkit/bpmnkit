//! The REST connector runner against a running reebe server: deploy a process whose service task
//! is a REST connector (input mappings in FEEL, result / error expressions as headers), call a
//! local mock API and check what the engine recorded. Ignored by default; CI's `worker-e2e` job
//! runs it with `-- --ignored` (`BPMNKIT_WORKER_E2E_URL`, default `http://localhost:8080`).

use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use axum::extract::Path;
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};
use bpmnkit_connector_runtime::{HttpJsonConnector, Secrets};
use bpmnkit_worker::{
    ActivatedJob, ClientConfig, Complete, Handler, JobError, RestClient, Worker, WorkerConfig,
};
use serde_json::{json, Value};

fn base() -> String {
    std::env::var("BPMNKIT_WORKER_E2E_URL").unwrap_or_else(|_| "http://localhost:8080".into())
}

fn unique(prefix: &str) -> String {
    let n = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("{prefix}-{n}")
}

async fn mock_api() -> String {
    let app = Router::new().route(
        "/pets/{id}",
        get(|Path(id): Path<u32>| async move {
            if id == 404 {
                (StatusCode::NOT_FOUND, Json(json!({"message": "no pet"})))
            } else {
                (StatusCode::OK, Json(json!({"id": id, "name": "Rex"})))
            }
        }),
    );
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });
    format!("http://{addr}")
}

fn bpmn(process: &str, job_type: &str, api: &str) -> String {
    let url = format!("=&quot;{api}/pets/&quot; + string(petId)");
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="http://bpmnkit.com/e2e">
  <bpmn:error id="err" errorCode="PET_NOT_FOUND" />
  <bpmn:process id="{process}" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="rest">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="{job_type}" />
        <zeebe:ioMapping>
          <zeebe:input source="GET" target="method" />
          <zeebe:input source="{url}" target="url" />
          <zeebe:input source="bearer" target="authentication.type" />
          <zeebe:input source="{{{{secrets.E2E_PET_TOKEN}}}}" target="authentication.token" />
        </zeebe:ioMapping>
        <zeebe:taskHeaders>
          <zeebe:header key="resultExpression" value="={{petName: response.body.name}}" />
          <zeebe:header key="errorExpression" value="=if error.code = &quot;404&quot; then bpmnError(&quot;PET_NOT_FOUND&quot;, &quot;no pet&quot;) else null" />
        </zeebe:taskHeaders>
      </bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:boundaryEvent id="caught" attachedToRef="rest">
      <bpmn:outgoing>f3</bpmn:outgoing><bpmn:errorEventDefinition errorRef="err" />
    </bpmn:boundaryEvent>
    <bpmn:endEvent id="end"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="endError"><bpmn:incoming>f3</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="rest" />
    <bpmn:sequenceFlow id="f2" sourceRef="rest" targetRef="end" />
    <bpmn:sequenceFlow id="f3" sourceRef="caught" targetRef="endError" />
  </bpmn:process>
</bpmn:definitions>"#
    )
}

async fn setup(pet_ids: &[u32]) -> String {
    let api = mock_api().await;
    let http = reqwest::Client::new();
    let job_type = unique("e2e-rest");
    let process = job_type.replace('-', "_");
    let boundary = "bpmnkit-e2e-boundary";
    let body = format!(
        "--{boundary}\r\nContent-Disposition: form-data; name=\"resources\"; filename=\"{process}.bpmn\"\r\nContent-Type: application/xml\r\n\r\n{}\r\n--{boundary}--\r\n",
        bpmn(&process, &job_type, &api)
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
    assert!(
        r.status().is_success(),
        "deploy: {}",
        r.text().await.unwrap()
    );
    for id in pet_ids {
        let r = http
            .post(format!("{}/v2/process-instances", base()))
            .json(&json!({ "processDefinitionId": process, "variables": { "petId": id } }))
            .send()
            .await
            .unwrap();
        assert!(
            r.status().is_success(),
            "start: {}",
            r.text().await.unwrap()
        );
    }
    job_type
}

async fn jobs(job_type: &str) -> Vec<Value> {
    let r: Value = reqwest::Client::new()
        .post(format!("{}/v2/jobs/search", base()))
        .json(&json!({ "filter": { "type": job_type, "jobType": job_type } }))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    r["items"].as_array().cloned().unwrap_or_default()
}

/// Counts finished jobs so the test knows when to stop the worker.
struct Counting(HttpJsonConnector, Arc<AtomicUsize>);

impl Handler for Counting {
    async fn handle(&self, job: ActivatedJob) -> Result<Complete, JobError> {
        let r = self.0.execute(&job).await;
        self.1.fetch_add(1, Ordering::SeqCst);
        r
    }
}

async fn run(job_type: &str, want: usize) {
    let done = Arc::new(AtomicUsize::new(0));
    let secrets = Secrets::from_lookup("", |n| (n == "E2E_PET_TOKEN").then(|| "e2e-token".into()));
    let client = Arc::new(
        RestClient::new(ClientConfig {
            rest_address: base(),
            ..ClientConfig::default()
        })
        .unwrap(),
    );
    let config = WorkerConfig::new(job_type)
        .request_timeout(Duration::from_secs(1))
        .drain_timeout(Duration::from_secs(10));
    let d = done.clone();
    Worker::new(
        client,
        config,
        Counting(HttpJsonConnector::new(secrets), done),
    )
    .run(async move {
        let deadline = tokio::time::Instant::now() + Duration::from_secs(20);
        while d.load(Ordering::SeqCst) < want && tokio::time::Instant::now() < deadline {
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
        tokio::time::sleep(Duration::from_millis(200)).await;
    })
    .await;
}

#[tokio::test]
#[ignore = "needs a running reebe server"]
async fn rest_connector_completes_and_throws() {
    let t = setup(&[7, 404]).await;
    run(&t, 2).await;
    let mut states: Vec<(String, String)> = jobs(&t)
        .await
        .iter()
        .map(|j| {
            (
                j["state"].as_str().unwrap_or("").to_owned(),
                j["errorCode"].as_str().unwrap_or("").to_owned(),
            )
        })
        .collect();
    states.sort();
    assert_eq!(states.len(), 2, "{states:?}");
    assert_eq!(states[0], ("COMPLETED".into(), String::new()));
    // reebe records a thrown error as FAILED with the code; Zeebe calls it ERROR_THROWN.
    assert!(
        matches!(states[1].0.as_str(), "ERROR_THROWN" | "FAILED") && states[1].1 == "PET_NOT_FOUND",
        "{states:?}"
    );
}
