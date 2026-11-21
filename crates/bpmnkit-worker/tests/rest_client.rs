//! RestClient against wiremock; every body sent is validated against the vendored 8.8 spec.

mod common;

use std::sync::Arc;
use std::time::Duration;

use bpmnkit_worker::*;
use common::{assert_valid, request_schema, schema, violations};
use serde_json::{json, Value};
use wiremock::matchers::{method, path};
use wiremock::{Mock, MockServer, Request, ResponseTemplate};

fn client(server: &MockServer, credentials: Credentials) -> RestClient {
    RestClient::new(ClientConfig {
        rest_address: server.uri(),
        credentials,
        ..ClientConfig::default()
    })
    .unwrap()
}

fn body(r: &Request) -> Value {
    serde_json::from_slice(&r.body).unwrap()
}

/// A response body shaped like the spec's `ActivatedJobResult`.
fn activated(key: &str) -> Value {
    json!({
        "type": "pay", "processDefinitionId": "order", "processDefinitionVersion": 1,
        "elementId": "charge", "customHeaders": { "retryBackoff": "PT5S" }, "worker": "w1",
        "retries": 3, "deadline": 1_757_280_974_277_i64, "variables": { "amount": 5 },
        "tenantId": "<default>", "jobKey": key, "processInstanceKey": "2251799813653000",
        "processDefinitionKey": "2251799813650000", "elementInstanceKey": "2251799813653001",
        "kind": "BPMN_ELEMENT", "listenerEventType": "UNSPECIFIED"
    })
}

async fn only_request(server: &MockServer) -> Request {
    let mut all = server.received_requests().await.unwrap();
    assert_eq!(all.len(), 1, "expected one request");
    all.remove(0)
}

#[test]
fn fixture_response_matches_the_spec() {
    assert_valid(
        schema("JobActivationResult"),
        &json!({ "jobs": [activated("1")] }),
    );
}

#[test]
fn validator_catches_bad_bodies() {
    let s = request_schema("/jobs/activation", "post");
    assert!(
        !violations(s, &json!({ "type": "x", "timeout": 1 })).is_empty(),
        "missing maxJobsToActivate"
    );
    assert!(!violations(
        s,
        &json!({ "type": "x", "timeout": 1, "maxJobsToActivate": 1, "bogus": 1 })
    )
    .is_empty());
    assert!(!violations(
        s,
        &json!({ "type": "x", "timeout": "1", "maxJobsToActivate": 1 })
    )
    .is_empty());
    assert!(!violations(
        s,
        &json!({ "type": "x", "timeout": 1, "maxJobsToActivate": 3_000_000_000_i64 })
    )
    .is_empty());
    let c = request_schema("/jobs/{jobKey}/completion", "post");
    assert!(!violations(
        c,
        &json!({ "result": { "type": "userTask", "denied": "yes" } })
    )
    .is_empty());
}

#[tokio::test]
async fn activate_sends_a_valid_body_and_parses_jobs() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/v2/jobs/activation"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({ "jobs": [activated("42")] })),
        )
        .mount(&server)
        .await;
    let req = ActivateJobsRequest {
        job_type: "pay".into(),
        worker: "w1".into(),
        timeout: 300_000,
        max_jobs_to_activate: 32,
        fetch_variable: vec!["amount".into()],
        request_timeout: 0,
        tenant_ids: vec!["<default>".into()],
    };
    let jobs = client(&server, Credentials::None)
        .activate(&req)
        .await
        .unwrap();
    assert_eq!(jobs.len(), 1);
    let job = &jobs[0];
    assert_eq!(
        (job.job_key.as_str(), job.retries, job.kind),
        ("42", 3, JobKind::BpmnElement)
    );
    assert_eq!(job.header("retryBackoff"), Some("PT5S"));
    assert_eq!(job.variables["amount"], 5);

    let r = only_request(&server).await;
    assert_valid(request_schema("/jobs/activation", "post"), &body(&r));
    assert_eq!(
        body(&r),
        json!({ "type": "pay", "worker": "w1", "timeout": 300000, "maxJobsToActivate": 32,
                "fetchVariable": ["amount"], "requestTimeout": 0, "tenantIds": ["<default>"] })
    );
    let ua = r.headers.get("user-agent").unwrap().to_str().unwrap();
    assert!(ua.starts_with("bpmnkit-worker/"));
}

#[tokio::test]
async fn activation_tolerates_nulls_and_new_kinds() {
    let server = MockServer::start().await;
    let mut j = activated("1");
    j["listenerEventType"] = Value::Null;
    j["kind"] = json!("SOMETHING_NEW");
    j["customHeaders"] = Value::Null;
    Mock::given(path("/v2/jobs/activation"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({ "jobs": [j] })))
        .mount(&server)
        .await;
    let req = ActivateJobsRequest {
        job_type: "pay".into(),
        worker: "w".into(),
        timeout: 1,
        max_jobs_to_activate: 1,
        fetch_variable: vec![],
        request_timeout: 0,
        tenant_ids: vec![],
    };
    let jobs = client(&server, Credentials::None)
        .activate(&req)
        .await
        .unwrap();
    assert_eq!(jobs[0].kind, JobKind::Other);
    assert!(jobs[0].custom_headers.is_empty());
    let r = only_request(&server).await;
    assert_valid(request_schema("/jobs/activation", "post"), &body(&r));
    assert!(body(&r).get("tenantIds").is_none());
}

async fn command_server(verb: &str, p: &str) -> MockServer {
    let server = MockServer::start().await;
    Mock::given(method(verb))
        .and(path(p))
        .respond_with(ResponseTemplate::new(204))
        .mount(&server)
        .await;
    server
}

#[tokio::test]
async fn complete_variants_are_valid() {
    let results = [
        CompleteJobRequest::default(),
        CompleteJobRequest {
            variables: Some(serde_json::from_value(json!({ "ok": true, "n": 1 })).unwrap()),
            result: None,
        },
        CompleteJobRequest {
            variables: None,
            result: Some(JobResult::UserTask {
                denied: Some(true),
                denied_reason: Some("no budget".into()),
                corrections: Some(
                    serde_json::from_value(json!({ "assignee": "anna", "priority": 80 })).unwrap(),
                ),
            }),
        },
        CompleteJobRequest {
            variables: None,
            result: Some(JobResult::AdHocSubProcess {
                activate_elements: vec![ActivateElement {
                    element_id: "review".into(),
                    variables: Some(serde_json::from_value(json!({ "x": 1 })).unwrap()),
                }],
                is_completion_condition_fulfilled: false,
                is_cancel_remaining_instances: true,
            }),
        },
    ];
    for req in results {
        let server = command_server("POST", "/v2/jobs/7/completion").await;
        client(&server, Credentials::None)
            .complete("7", &req)
            .await
            .unwrap();
        let r = only_request(&server).await;
        assert_valid(
            request_schema("/jobs/{jobKey}/completion", "post"),
            &body(&r),
        );
    }
}

#[tokio::test]
async fn fail_error_update_are_valid() {
    let vars: serde_json::Map<String, Value> =
        serde_json::from_value(json!({ "why": "x" })).unwrap();

    let server = command_server("POST", "/v2/jobs/7/failure").await;
    let fail = FailJobRequest {
        retries: 2,
        error_message: Some("down".into()),
        retry_back_off: 5000,
        variables: Some(vars.clone()),
    };
    client(&server, Credentials::None)
        .fail("7", &fail)
        .await
        .unwrap();
    let b = body(&only_request(&server).await);
    assert_valid(request_schema("/jobs/{jobKey}/failure", "post"), &b);
    assert_eq!(
        b,
        json!({ "retries": 2, "errorMessage": "down", "retryBackOff": 5000, "variables": { "why": "x" } })
    );

    let server = command_server("POST", "/v2/jobs/7/error").await;
    let err = ThrowErrorRequest {
        error_code: "E1".into(),
        error_message: Some("nope".into()),
        variables: Some(vars),
    };
    client(&server, Credentials::None)
        .throw_error("7", &err)
        .await
        .unwrap();
    assert_valid(
        request_schema("/jobs/{jobKey}/error", "post"),
        &body(&only_request(&server).await),
    );

    let server = command_server("PATCH", "/v2/jobs/7").await;
    let upd = UpdateJobRequest {
        changeset: JobChangeset {
            retries: Some(5),
            timeout: Some(60_000),
        },
        operation_reference: Some(1),
    };
    client(&server, Credentials::None)
        .update("7", &upd)
        .await
        .unwrap();
    assert_valid(
        request_schema("/jobs/{jobKey}", "patch"),
        &body(&only_request(&server).await),
    );
}

#[tokio::test]
async fn http_errors_carry_status_and_problem_body() {
    let server = MockServer::start().await;
    Mock::given(path("/v2/jobs/7/completion"))
        .respond_with(
            ResponseTemplate::new(404)
                .set_body_json(json!({ "title": "NOT_FOUND", "status": 404 })),
        )
        .mount(&server)
        .await;
    Mock::given(path("/v2/jobs/8/completion"))
        .respond_with(ResponseTemplate::new(503))
        .mount(&server)
        .await;
    let c = client(&server, Credentials::None);
    let e = c
        .complete("7", &CompleteJobRequest::default())
        .await
        .unwrap_err();
    assert_eq!(e.status(), Some(404));
    assert!(!e.is_transient());
    assert!(e.to_string().contains("NOT_FOUND"));
    let e = c
        .complete("8", &CompleteJobRequest::default())
        .await
        .unwrap_err();
    assert!(e.is_transient());
}

#[tokio::test]
async fn basic_and_bearer_headers() {
    let server = command_server("POST", "/v2/jobs/1/completion").await;
    let basic = Credentials::Basic {
        username: "demo".into(),
        password: "demo".into(),
    };
    client(&server, basic)
        .complete("1", &CompleteJobRequest::default())
        .await
        .unwrap();
    let r = only_request(&server).await;
    assert_eq!(
        r.headers.get("authorization").unwrap(),
        "Basic ZGVtbzpkZW1v"
    );

    let server = command_server("POST", "/v2/jobs/1/completion").await;
    client(&server, Credentials::Bearer("t0k".into()))
        .complete("1", &CompleteJobRequest::default())
        .await
        .unwrap();
    assert_eq!(
        only_request(&server)
            .await
            .headers
            .get("authorization")
            .unwrap(),
        "Bearer t0k"
    );
}

#[test]
fn credentials_never_print_secrets() {
    let s = format!(
        "{:?} {:?}",
        Credentials::Basic {
            username: "u".into(),
            password: "hunter2".into()
        },
        Credentials::Bearer("hunter2".into())
    );
    assert!(!s.contains("hunter2"));
}

#[cfg(feature = "oauth")]
mod oauth {
    use super::*;
    use wiremock::matchers::{body_string_contains, header};

    fn oauth(server: &MockServer) -> Credentials {
        Credentials::OAuth(OAuthConfig {
            token_url: format!("{}/oauth/token", server.uri()),
            client_id: "id".into(),
            client_secret: "secret".into(),
            audience: Some("zeebe-api".into()),
            scope: None,
        })
    }

    fn token(t: &str, expires_in: u64) -> ResponseTemplate {
        ResponseTemplate::new(200).set_body_json(
            json!({ "access_token": t, "expires_in": expires_in, "token_type": "Bearer" }),
        )
    }

    #[tokio::test]
    async fn one_token_fetch_for_concurrent_requests() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/oauth/token"))
            .and(body_string_contains("grant_type=client_credentials"))
            .and(body_string_contains("client_id=id"))
            .and(body_string_contains("client_secret=secret"))
            .and(body_string_contains("audience=zeebe-api"))
            .respond_with(token("T1", 3600).set_delay(Duration::from_millis(50)))
            .expect(1)
            .mount(&server)
            .await;
        Mock::given(path("/v2/jobs/1/completion"))
            .and(header("authorization", "Bearer T1"))
            .respond_with(ResponseTemplate::new(204))
            .expect(10)
            .mount(&server)
            .await;
        let c = Arc::new(client(&server, oauth(&server)));
        let calls: Vec<_> = (0..10)
            .map(|_| {
                let c = Arc::clone(&c);
                tokio::spawn(async move { c.complete("1", &CompleteJobRequest::default()).await })
            })
            .collect();
        for h in calls {
            h.await.unwrap().unwrap();
        }
    }

    #[tokio::test]
    async fn refreshes_at_eighty_percent_of_lifetime() {
        let server = MockServer::start().await;
        Mock::given(path("/oauth/token"))
            .respond_with(token("T", 1))
            .expect(2)
            .mount(&server)
            .await;
        Mock::given(path("/v2/jobs/1/completion"))
            .respond_with(ResponseTemplate::new(204))
            .mount(&server)
            .await;
        let c = client(&server, oauth(&server));
        c.complete("1", &CompleteJobRequest::default())
            .await
            .unwrap();
        c.complete("1", &CompleteJobRequest::default())
            .await
            .unwrap(); // cached
        tokio::time::sleep(Duration::from_millis(850)).await; // past 800 ms of 1 s
        c.complete("1", &CompleteJobRequest::default())
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn a_401_refetches_the_token_once() {
        let server = MockServer::start().await;
        Mock::given(path("/oauth/token"))
            .respond_with(token("T", 3600))
            .expect(2)
            .mount(&server)
            .await;
        Mock::given(path("/v2/jobs/1/completion"))
            .respond_with(ResponseTemplate::new(401))
            .up_to_n_times(1)
            .mount(&server)
            .await;
        Mock::given(path("/v2/jobs/1/completion"))
            .respond_with(ResponseTemplate::new(204))
            .mount(&server)
            .await;
        client(&server, oauth(&server))
            .complete("1", &CompleteJobRequest::default())
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn token_endpoint_errors_surface() {
        let server = MockServer::start().await;
        Mock::given(path("/oauth/token"))
            .respond_with(ResponseTemplate::new(401).set_body_string("invalid_client"))
            .mount(&server)
            .await;
        let e = client(&server, oauth(&server))
            .complete("1", &CompleteJobRequest::default())
            .await
            .unwrap_err();
        assert!(
            matches!(e, Error::Auth(ref m) if m.contains("invalid_client")),
            "{e}"
        );
    }
}

#[tokio::test]
async fn worker_over_rest_completes_a_job() {
    let server = MockServer::start().await;
    Mock::given(path("/v2/jobs/activation"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({ "jobs": [activated("42")] })),
        )
        .up_to_n_times(1)
        .mount(&server)
        .await;
    Mock::given(path("/v2/jobs/activation"))
        .respond_with(
            ResponseTemplate::new(200)
                .set_body_json(json!({ "jobs": [] }))
                .set_delay(Duration::from_millis(20)),
        )
        .mount(&server)
        .await;
    Mock::given(path("/v2/jobs/42/completion"))
        .respond_with(ResponseTemplate::new(204))
        .expect(1)
        .mount(&server)
        .await;
    let c = Arc::new(client(&server, Credentials::None));
    let metrics = Arc::new(CounterMetrics::new());
    let handler = |job: ActivatedJob| async move {
        Ok(Complete::new().var("charged", job.variables["amount"].clone()))
    };
    let reports = Runtime::new(c)
        .metrics(metrics.clone())
        .default_tenant_ids(vec!["<default>".into()])
        .register(
            WorkerConfig::new("pay").request_timeout(Duration::from_millis(10)),
            handler,
        )
        .run_until(tokio::time::sleep(Duration::from_millis(300)))
        .await;
    assert_eq!(reports.len(), 1);
    assert!(reports[0].abandoned.is_empty());
    assert_eq!(metrics.get("pay").completed, 1);
    let reqs = server.received_requests().await.unwrap();
    for r in &reqs {
        let p = r.url.path();
        let (key, verb) = if p == "/v2/jobs/activation" {
            ("/jobs/activation", "post")
        } else {
            ("/jobs/{jobKey}/completion", "post")
        };
        assert_valid(request_schema(key, verb), &body(r));
    }
    let done = reqs
        .iter()
        .find(|r| r.url.path() == "/v2/jobs/42/completion")
        .unwrap();
    assert_eq!(body(done), json!({ "variables": { "charged": 5 } }));
}
