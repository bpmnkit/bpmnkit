//! An in-process tonic server (real HTTP/2 on 127.0.0.1) plays the gateway.

use std::collections::BTreeSet;
use std::convert::Infallible;
use std::future::Ready;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use std::task::{Context, Poll};

use tonic::body::Body as BoxBody;
use tonic::codegen::{http, tokio_stream, Service};
use tonic::server::{NamedService, ServerStreamingService};
use tonic::transport::Server;
use tonic::{Response, Status};

use super::*;
use crate::config::WorkerConfig;
use crate::testing::{Call, FakeClient};
use crate::worker::{Complete, JobError, Worker};
use crate::Credentials;

/// One connection's script: jobs to push, then close (`Ok`) or break with a status (`Err`).
#[derive(Clone)]
struct Script {
    jobs: Vec<GrpcActivatedJob>,
    end: Result<(), Status>,
}

/// A request and the `authorization` header it carried.
type Seen1 = (StreamActivatedJobsRequest, Option<String>);

#[derive(Clone, Default)]
struct Seen {
    requests: Arc<Mutex<Vec<Seen1>>>,
}

#[derive(Clone)]
struct Mock {
    scripts: Arc<Mutex<std::collections::VecDeque<Script>>>,
    seen: Seen,
    opens: Arc<AtomicUsize>,
}

struct Stream(Mock);

impl ServerStreamingService<StreamActivatedJobsRequest> for Stream {
    type Response = GrpcActivatedJob;
    type ResponseStream = tokio_stream::wrappers::ReceiverStream<Result<GrpcActivatedJob, Status>>;
    type Future = Ready<Result<Response<Self::ResponseStream>, Status>>;

    fn call(&mut self, request: tonic::Request<StreamActivatedJobsRequest>) -> Self::Future {
        let auth = request
            .metadata()
            .get("authorization")
            .and_then(|v| v.to_str().ok())
            .map(str::to_owned);
        self.0.opens.fetch_add(1, Ordering::SeqCst);
        self.0
            .seen
            .requests
            .lock()
            .unwrap()
            .push((request.into_inner(), auth));
        let script = self.0.scripts.lock().unwrap().pop_front();
        let (tx, rx) = tokio::sync::mpsc::channel(16);
        tokio::spawn(async move {
            let Some(s) = script else {
                // No script left: hold the stream open and idle.
                std::future::pending::<()>().await;
                return;
            };
            for j in s.jobs {
                let _ = tx.send(Ok(j)).await;
            }
            if let Err(e) = s.end {
                let _ = tx.send(Err(e)).await;
            }
            // Dropping `tx` closes the stream.
        });
        std::future::ready(Ok(Response::new(
            tokio_stream::wrappers::ReceiverStream::new(rx),
        )))
    }
}

impl Service<http::Request<BoxBody>> for Mock {
    type Response = http::Response<BoxBody>;
    type Error = Infallible;
    type Future = tonic::codegen::BoxFuture<Self::Response, Self::Error>;

    fn poll_ready(&mut self, _: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, req: http::Request<BoxBody>) -> Self::Future {
        let mock = self.clone();
        Box::pin(async move {
            if req.uri().path() != STREAM_PATH {
                return Ok(Status::unimplemented("only StreamActivatedJobs").into_http());
            }
            let mut grpc = tonic::server::Grpc::new(ProstCodec::<
                GrpcActivatedJob,
                StreamActivatedJobsRequest,
            >::default());
            Ok(grpc.server_streaming(Stream(mock), req).await)
        })
    }
}

impl NamedService for Mock {
    const NAME: &'static str = "gateway_protocol.Gateway";
}

async fn serve(scripts: Vec<Script>) -> (String, Mock) {
    let mock = Mock {
        scripts: Arc::new(Mutex::new(scripts.into())),
        seen: Seen::default(),
        opens: Arc::new(AtomicUsize::new(0)),
    };
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    let svc = mock.clone();
    tokio::spawn(async move {
        Server::builder()
            .add_service(svc)
            .serve_with_incoming(tokio_stream::wrappers::TcpListenerStream::new(listener))
            .await
            .unwrap();
    });
    (format!("http://{addr}"), mock)
}

fn proto_job(key: i64) -> GrpcActivatedJob {
    GrpcActivatedJob {
        key,
        r#type: "t".into(),
        process_instance_key: 11,
        bpmn_process_id: "proc".into(),
        process_definition_version: 2,
        process_definition_key: 12,
        element_id: "task".into(),
        element_instance_key: 13,
        custom_headers: r#"{"retryBackoff":"PT1S"}"#.into(),
        worker: "w".into(),
        retries: 3,
        deadline: 99,
        variables: r#"{"a":1}"#.into(),
        tenant_id: "<default>".into(),
        user_task: Some(UserTaskProperties {
            action: Some("assign".into()),
            assignee: Some("ann".into()),
            candidate_groups: vec!["g".into()],
            candidate_users: vec!["u".into()],
            changed_attributes: vec!["assignee".into()],
            due_date: Some("2026-01-01T00:00:00Z".into()),
            follow_up_date: Some("2026-01-02T00:00:00Z".into()),
            form_key: Some(7),
            priority: Some(50),
            user_task_key: Some(8),
        }),
        kind: 2,
        listener_event_type: 2,
        tags: vec!["vip".into()],
    }
}

fn source(addr: &str, creds: Credentials) -> GrpcJobSource {
    let config = ClientConfig {
        rest_address: "http://127.0.0.1:1".into(),
        grpc_address: addr.into(),
        credentials: creds,
        ..ClientConfig::default()
    };
    GrpcJobSource::new(Arc::new(RestClient::new(config.clone()).unwrap()), &config).unwrap()
}

fn req() -> StreamRequest {
    StreamRequest {
        job_type: "t".into(),
        worker: "w".into(),
        timeout: 60_000,
        fetch_variable: vec!["a".into()],
        tenant_ids: vec!["x".into()],
    }
}

#[test]
fn job_maps_to_the_rest_shape() {
    let j: ActivatedJob = proto_job(7).try_into().unwrap();
    assert_eq!(j.job_key, "7");
    assert_eq!(j.process_definition_id, "proc");
    assert_eq!(j.process_instance_key, "11");
    assert_eq!(j.process_definition_key, "12");
    assert_eq!(j.element_instance_key, "13");
    assert_eq!(j.variables["a"], 1);
    assert_eq!(j.header("retryBackoff"), Some("PT1S"));
    assert_eq!(j.kind, JobKind::TaskListener);
    let mut empty = proto_job(1);
    empty.variables.clear();
    empty.custom_headers.clear();
    let j: ActivatedJob = empty.try_into().unwrap();
    assert!(j.variables.is_empty() && j.custom_headers.is_empty());
    let mut bad = proto_job(1);
    bad.variables = "[1]".into();
    assert!(matches!(ActivatedJob::try_from(bad), Err(Error::Decode(_))));
}

/// Field numbers present when every field is set.
fn tags(bytes: &[u8]) -> BTreeSet<u32> {
    fn varint(b: &[u8], i: &mut usize) -> u64 {
        let (mut v, mut shift) = (0u64, 0);
        loop {
            let byte = b[*i];
            *i += 1;
            v |= u64::from(byte & 0x7f) << shift;
            if byte & 0x80 == 0 {
                return v;
            }
            shift += 7;
        }
    }
    let (mut i, mut out) = (0, BTreeSet::new());
    while i < bytes.len() {
        let key = varint(bytes, &mut i);
        out.insert((key >> 3) as u32);
        match key & 7 {
            0 => {
                varint(bytes, &mut i);
            }
            2 => {
                let n = varint(bytes, &mut i) as usize;
                i += n;
            }
            w => panic!("unexpected wire type {w}"),
        }
    }
    out
}

/// `message <name> { type name = N; … }` → (field name, N) per field, from the vendored file.
fn proto_fields(src: &str, message: &str) -> Vec<(String, u32)> {
    let body = src
        .split(&format!("message {message} {{"))
        .nth(1)
        .unwrap_or_else(|| panic!("message {message} not in proto"));
    // Fields only: skip nested enum bodies and stop at the message's own closing brace.
    let (mut depth, mut out) = (0, Vec::new());
    for l in body.lines().map(str::trim) {
        if l.ends_with('{') {
            depth += 1;
        } else if l == "}" {
            if depth == 0 {
                break;
            }
            depth -= 1;
        } else if depth == 0 {
            let Some((decl, n)) = l.strip_suffix(';').and_then(|l| l.split_once('=')) else {
                continue;
            };
            if let (Some(name), Ok(n)) = (decl.split_whitespace().last(), n.trim().parse()) {
                out.push((name.to_owned(), n));
            }
        }
    }
    out
}

#[test]
fn matches_vendored_proto() {
    let src = include_str!("../spec/gateway-streaming.proto");
    assert!(src.contains(
        "rpc StreamActivatedJobs(StreamActivatedJobsRequest) returns (stream ActivatedJob)"
    ));
    assert!(src.contains("package gateway_protocol;"));
    assert_eq!(STREAM_PATH, "/gateway_protocol.Gateway/StreamActivatedJobs");

    let want = |m: &str| {
        proto_fields(src, m)
            .into_iter()
            .map(|(_, n)| n)
            .collect::<BTreeSet<_>>()
    };
    let all_set = StreamActivatedJobsRequest {
        r#type: "a".into(),
        worker: "a".into(),
        timeout: 1,
        fetch_variable: vec!["a".into()],
        tenant_ids: vec!["a".into()],
    };
    assert_eq!(
        tags(&prost::Message::encode_to_vec(&all_set)),
        want("StreamActivatedJobsRequest")
    );
    assert_eq!(
        tags(&prost::Message::encode_to_vec(&proto_job(1))),
        want("ActivatedJob")
    );
    // Names too, so a swapped pair of same-typed fields is caught.
    let names: Vec<_> = proto_fields(src, "ActivatedJob")
        .into_iter()
        .map(|(n, _)| n)
        .collect();
    assert_eq!(names[3], "bpmnProcessId");
    assert_eq!(names[8], "customHeaders");
    assert_eq!(names[12], "variables");
    assert_eq!(names[15], "kind");
    assert_eq!(
        tags(&prost::Message::encode_to_vec(
            &proto_job(1).user_task.unwrap()
        )),
        want("UserTaskProperties")
    );
}

// Regression: the slice once stopped at field 14, so listener and ad-hoc jobs arrived as
// BPMN_ELEMENT with no user-task data.
#[test]
fn streamed_job_keeps_kind_listener_and_user_task() {
    let job = ActivatedJob::try_from(proto_job(1)).unwrap();
    assert_eq!(job.kind, JobKind::TaskListener);
    assert_eq!(job.listener_event_type, "COMPLETING");
    assert_eq!(job.tags, Some(vec!["vip".to_owned()]));
    let ut = job.user_task.unwrap();
    assert_eq!(ut["userTaskKey"], "8");
    assert_eq!(ut["formKey"], "7");
    assert_eq!(ut["candidateGroups"][0], "g");

    let plain = ActivatedJob::try_from(GrpcActivatedJob {
        kind: 3,
        user_task: None,
        tags: vec![],
        ..proto_job(2)
    })
    .unwrap();
    assert_eq!(plain.kind, JobKind::AdHocSubProcess);
    assert_eq!(plain.listener_event_type, "UNSPECIFIED");
    assert!(plain.user_task.is_none() && plain.tags.is_none());
    assert_eq!(
        ActivatedJob::try_from(GrpcActivatedJob {
            kind: 9,
            ..proto_job(3)
        })
        .unwrap()
        .kind,
        JobKind::Other
    );
}

#[tokio::test]
async fn streams_jobs_with_auth_and_request_fields() {
    let (addr, mock) = serve(vec![Script {
        jobs: vec![proto_job(1), proto_job(2)],
        end: Ok(()),
    }])
    .await;
    let src = source(
        &addr,
        Credentials::Basic {
            username: "u".into(),
            password: "p".into(),
        },
    );
    let mut s = src.open(req()).await.unwrap();
    assert_eq!(s.next().await.unwrap().unwrap().job_key, "1");
    assert_eq!(s.next().await.unwrap().unwrap().job_key, "2");
    assert!(s.next().await.unwrap().is_none());
    let seen = mock.seen.requests.lock().unwrap();
    let (r, auth) = &seen[0];
    assert_eq!(
        (
            r.r#type.as_str(),
            r.worker.as_str(),
            r.timeout,
            &r.fetch_variable,
            &r.tenant_ids
        ),
        (
            "t",
            "w",
            60_000,
            &vec!["a".to_string()],
            &vec!["x".to_string()]
        )
    );
    assert_eq!(auth.as_deref(), Some("Basic dTpw"));
}

#[tokio::test]
async fn bearer_and_no_auth_headers() {
    let (addr, mock) = serve(vec![]).await;
    drop(source(&addr, Credentials::None).open(req()).await.unwrap());
    drop(
        source(&addr, Credentials::Bearer("tok".into()))
            .open(req())
            .await
            .unwrap(),
    );
    let seen = mock.seen.requests.lock().unwrap();
    assert_eq!(seen[0].1, None);
    assert_eq!(seen[1].1.as_deref(), Some("Bearer tok"));
}

#[tokio::test]
async fn server_status_is_a_stream_error() {
    let (addr, _) = serve(vec![Script {
        jobs: vec![],
        end: Err(Status::unavailable("going away")),
    }])
    .await;
    let mut s = source(&addr, Credentials::None).open(req()).await.unwrap();
    let e = s.next().await.err().unwrap();
    assert!(
        matches!(&e, Error::Stream(m) if m.contains("going away")),
        "{e}"
    );
    assert!(e.is_transient());
}

#[tokio::test]
async fn unreachable_gateway_fails_to_open() {
    let l = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = format!("http://{}", l.local_addr().unwrap());
    drop(l);
    let e = source(&addr, Credentials::None)
        .open(req())
        .await
        .err()
        .unwrap();
    assert!(matches!(e, Error::Stream(_)), "{e}");
}

#[test]
fn bad_address_and_half_a_client_identity_are_config_errors() {
    let rest = Arc::new(RestClient::new(ClientConfig::default()).unwrap());
    let bad = ClientConfig {
        grpc_address: "not a uri".into(),
        ..ClientConfig::default()
    };
    assert!(matches!(
        GrpcJobSource::new(Arc::clone(&rest), &bad),
        Err(Error::Config(_))
    ));
    let half = ClientConfig {
        grpc_address: "https://localhost:26500".into(),
        tls: Some(crate::TlsConfig {
            client_cert_pem: Some(b"x".to_vec()),
            ..Default::default()
        }),
        ..ClientConfig::default()
    };
    assert!(matches!(
        GrpcJobSource::new(rest, &half),
        Err(Error::Config(_))
    ));
}

#[tokio::test]
async fn worker_reconnects_over_real_grpc_and_completes_every_job() {
    let (addr, mock) = serve(vec![
        Script {
            jobs: vec![proto_job(1)],
            end: Err(Status::unavailable("restart")),
        },
        Script {
            jobs: vec![proto_job(2), proto_job(3)],
            end: Ok(()),
        },
    ])
    .await;
    let client = Arc::new(FakeClient::new());
    let cfg = WorkerConfig::new("t")
        .stream_enabled(true)
        .poll_interval(Duration::from_secs(60))
        .request_timeout(Duration::from_secs(60))
        .backoff(crate::BackoffConfig {
            min: Duration::from_millis(5),
            max: Duration::from_millis(20),
            ..Default::default()
        });
    let handler = |_: ActivatedJob| async { Ok::<_, JobError>(Complete::new()) };
    let report = Worker::new(Arc::clone(&client), cfg, handler)
        .stream(Arc::new(source(&addr, Credentials::None)))
        .run(tokio::time::sleep(Duration::from_millis(800)))
        .await;
    assert!(report.abandoned.is_empty());
    let mut done: Vec<_> = client
        .commands()
        .into_iter()
        .filter_map(|c| match c {
            Call::Complete(k, _) => Some(k),
            _ => None,
        })
        .collect();
    done.sort();
    assert_eq!(done, ["1", "2", "3"]);
    assert!(mock.opens.load(Ordering::SeqCst) >= 2);
}
