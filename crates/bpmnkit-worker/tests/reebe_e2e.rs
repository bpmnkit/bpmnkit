//! End to end against a running reebe server (`apps/reebe`): activate → complete / fail /
//! BPMN error, and drain. Ignored by default so `cargo test --workspace` needs no server; CI's
//! `worker-e2e` job starts one and runs `cargo test -p bpmnkit-worker --test reebe_e2e -- --ignored`.
//! `BPMNKIT_WORKER_E2E_URL` points at the server (default `http://localhost:8080`);
//! the `grpc` feature's stream test also reads `BPMNKIT_WORKER_E2E_GRPC` (default `http://localhost:26599`).

use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use bpmnkit_worker::*;
use serde_json::{json, Value};

fn base() -> String {
    std::env::var("BPMNKIT_WORKER_E2E_URL").unwrap_or_else(|_| "http://localhost:8080".into())
}

/// A job type no earlier run left jobs for.
fn unique(prefix: &str) -> String {
    let n = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("{prefix}-{n}")
}

fn bpmn(id: &str, job_type: &str) -> String {
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="http://bpmnkit.com/e2e">
  <bpmn:error id="err" errorCode="E2E_ERROR" />
  <bpmn:process id="{id}" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="work">
      <bpmn:extensionElements><zeebe:taskDefinition type="{job_type}" /></bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:boundaryEvent id="caught" attachedToRef="work">
      <bpmn:outgoing>f3</bpmn:outgoing><bpmn:errorEventDefinition errorRef="err" />
    </bpmn:boundaryEvent>
    <bpmn:endEvent id="end"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="endError"><bpmn:incoming>f3</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="work" />
    <bpmn:sequenceFlow id="f2" sourceRef="work" targetRef="end" />
    <bpmn:sequenceFlow id="f3" sourceRef="caught" targetRef="endError" />
  </bpmn:process>
</bpmn:definitions>"#
    )
}

/// Deploys the one-task process and starts `instances` instances; returns the job type.
async fn setup(prefix: &str, instances: usize) -> String {
    let http = reqwest::Client::new();
    let job_type = unique(prefix);
    let process = job_type.replace('-', "_");
    let boundary = "bpmnkit-e2e-boundary";
    let body = format!(
        "--{boundary}\r\nContent-Disposition: form-data; name=\"resources\"; filename=\"{process}.bpmn\"\r\nContent-Type: application/xml\r\n\r\n{}\r\n--{boundary}--\r\n",
        bpmn(&process, &job_type)
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
        "deploy: {} {}",
        r.status(),
        r.text().await.unwrap()
    );
    for _ in 0..instances {
        let r = http
            .post(format!("{}/v2/process-instances", base()))
            .json(&json!({ "processDefinitionId": process, "variables": { "amount": 5 } }))
            .send()
            .await
            .unwrap();
        assert!(
            r.status().is_success(),
            "start: {} {}",
            r.status(),
            r.text().await.unwrap()
        );
    }
    job_type
}

async fn jobs(job_type: &str) -> Vec<Value> {
    let r: Value = reqwest::Client::new()
        .post(format!("{}/v2/jobs/search", base()))
        // 8.8 names the filter `type`; reebe reads `jobType`.
        .json(&json!({ "filter": { "type": job_type, "jobType": job_type } }))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    r["items"].as_array().cloned().unwrap_or_default()
}

fn client() -> Arc<RestClient> {
    Arc::new(
        RestClient::new(ClientConfig {
            rest_address: base(),
            ..ClientConfig::default()
        })
        .unwrap(),
    )
}

/// Runs a worker until `done` handlers have finished (or 20 s pass).
async fn run<H: Handler>(
    job_type: &str,
    handler: H,
    done: Arc<AtomicUsize>,
    want: usize,
) -> ShutdownReport {
    let config = WorkerConfig::new(job_type)
        .request_timeout(Duration::from_secs(1))
        .drain_timeout(Duration::from_secs(10));
    Worker::new(client(), config, handler)
        .run(async move {
            let deadline = tokio::time::Instant::now() + Duration::from_secs(20);
            while done.load(Ordering::SeqCst) < want && tokio::time::Instant::now() < deadline {
                tokio::time::sleep(Duration::from_millis(20)).await;
            }
            // Let the last command reach the server before shutdown starts.
            tokio::time::sleep(Duration::from_millis(200)).await;
        })
        .await
}

async fn states(job_type: &str) -> Vec<String> {
    let mut s: Vec<String> = jobs(job_type)
        .await
        .iter()
        .map(|j| j["state"].as_str().unwrap_or("").to_owned())
        .collect();
    s.sort();
    s
}

#[tokio::test]
#[ignore = "needs a running reebe server"]
async fn completes_jobs() {
    let t = setup("e2e-complete", 3).await;
    let done = Arc::new(AtomicUsize::new(0));
    let d = done.clone();
    let handler = move |job: ActivatedJob| {
        let d = d.clone();
        async move {
            assert_eq!(job.variables["amount"], 5);
            d.fetch_add(1, Ordering::SeqCst);
            Ok(Complete::new().var("charged", true))
        }
    };
    let report = run(&t, handler, done, 3).await;
    assert!(report.abandoned.is_empty());
    assert_eq!(states(&t).await, ["COMPLETED"; 3]);
}

#[tokio::test]
#[ignore = "needs a running reebe server"]
async fn fails_jobs_without_retries() {
    let t = setup("e2e-fail", 1).await;
    let done = Arc::new(AtomicUsize::new(0));
    let d = done.clone();
    let handler = move |_: ActivatedJob| {
        let d = d.clone();
        async move {
            d.fetch_add(1, Ordering::SeqCst);
            // Explicit 0 so no other activation races the assertions.
            Err::<Complete, _>(JobError::fail("e2e failure").retries(0))
        }
    };
    run(&t, handler, done, 1).await;
    let all = jobs(&t).await;
    assert_eq!(all.len(), 1);
    assert_eq!(all[0]["state"], "FAILED");
    assert_eq!(all[0]["retries"], 0);
    assert_eq!(all[0]["errorMessage"], "e2e failure");
}

#[tokio::test]
#[ignore = "needs a running reebe server"]
async fn throws_bpmn_errors() {
    let t = setup("e2e-error", 1).await;
    let done = Arc::new(AtomicUsize::new(0));
    let d = done.clone();
    let handler = move |_: ActivatedJob| {
        let d = d.clone();
        async move {
            d.fetch_add(1, Ordering::SeqCst);
            Err::<Complete, _>(JobError::bpmn("E2E_ERROR", "caught by the boundary event"))
        }
    };
    run(&t, handler, done, 1).await;
    let all = jobs(&t).await;
    // reebe records a thrown error as FAILED with the code; Zeebe calls it ERROR_THROWN.
    assert!(
        matches!(all[0]["state"].as_str(), Some("ERROR_THROWN" | "FAILED")),
        "{}",
        all[0]
    );
    assert_eq!(all[0]["errorCode"], "E2E_ERROR");
    assert_eq!(all[0]["errorMessage"], "caught by the boundary event");
}

#[tokio::test]
#[ignore = "needs a running reebe server"]
async fn drains_running_handlers_on_shutdown() {
    let t = setup("e2e-drain", 2).await;
    let started = Arc::new(AtomicUsize::new(0));
    let s = started.clone();
    let handler = move |_: ActivatedJob| {
        let s = s.clone();
        async move {
            s.fetch_add(1, Ordering::SeqCst);
            tokio::time::sleep(Duration::from_secs(1)).await;
            Ok(Complete::new())
        }
    };
    // Shut down as soon as both handlers started: the drain must still let them complete.
    let report = run(&t, handler, started, 2).await;
    assert!(report.abandoned.is_empty());
    assert_eq!(states(&t).await, ["COMPLETED"; 2]);
}

/// Jobs created after the stream opened reach the handler by push: polling is set so far apart
/// that it cannot be what delivered them. Needs `--features grpc` and reebe's gRPC port.
#[cfg(feature = "grpc")]
#[tokio::test]
#[ignore = "needs a running reebe server"]
async fn streams_jobs_over_grpc() {
    use std::sync::Mutex;
    use std::time::Instant;

    let t = setup("e2e-stream", 0).await;
    let process = t.replace('-', "_");
    let rest = ClientConfig {
        rest_address: base(),
        grpc_address: std::env::var("BPMNKIT_WORKER_E2E_GRPC")
            .unwrap_or_else(|_| "http://localhost:26599".into()),
        ..ClientConfig::default()
    };
    let client = Arc::new(RestClient::new(rest.clone()).unwrap());
    let source = Arc::new(grpc::GrpcJobSource::new(Arc::clone(&client), &rest).unwrap());
    let latencies = Arc::new(Mutex::new(Vec::<Duration>::new()));
    let created = Arc::new(Mutex::new(None::<Instant>));
    let (l, c) = (latencies.clone(), created.clone());
    let handler = move |job: ActivatedJob| {
        let (l, c) = (l.clone(), c.clone());
        async move {
            if let Some(at) = *c.lock().unwrap() {
                l.lock().unwrap().push(at.elapsed());
            }
            assert_eq!(job.variables["amount"], 5);
            Ok(Complete::new())
        }
    };
    let config = WorkerConfig::new(&t)
        .stream_enabled(true)
        .poll_interval(Duration::from_secs(120))
        .request_timeout(Duration::from_secs(1))
        .drain_timeout(Duration::from_secs(10));
    let (stop_tx, stop_rx) = tokio::sync::oneshot::channel::<()>();
    let worker = tokio::spawn(Worker::new(client, config, handler).stream(source).run(
        async move {
            let _ = stop_rx.await;
        },
    ));
    // The first poll is empty and the next is two minutes away; give the stream time to open.
    tokio::time::sleep(Duration::from_secs(2)).await;
    for _ in 0..3 {
        *created.lock().unwrap() = Some(Instant::now());
        let r = reqwest::Client::new()
            .post(format!("{}/v2/process-instances", base()))
            .json(&json!({ "processDefinitionId": process, "variables": { "amount": 5 } }))
            .send()
            .await
            .unwrap();
        assert!(r.status().is_success());
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
    let _ = stop_tx.send(());
    let report = worker.await.unwrap();
    assert!(report.abandoned.is_empty());
    assert_eq!(states(&t).await, ["COMPLETED"; 3]);
    let l = latencies.lock().unwrap();
    assert_eq!(l.len(), 3);
    println!("stream latency, create instance -> handler start: {l:?}");
}
