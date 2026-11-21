//! Replays `conformance/connectors/*.json` against a local mock (no network): each fixture's
//! job runs through the connector, every request must match the recorded one, and the command
//! must equal `expected`. Also asserts no secret value reaches the command or the logs.
//!
//! `BPMNKIT_BLESS=1 cargo test -p bpmnkit-connector-runtime --test replay` rewrites `expected`
//! (review the diff: fixtures recorded against the real runtime must not change).

use std::collections::BTreeMap;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

use axum::body::{to_bytes, Body};
use axum::extract::{Request, State};
use axum::response::Response;
use axum::Router;
use bpmnkit_connector_runtime::{command_json, run_job, HttpJsonConnector, Secrets};
use bpmnkit_worker::ActivatedJob;
use hyper_util::rt::TokioIo;
use hyper_util::service::TowerToHyperService;
use serde_json::{json, Map, Value};

const PLACEHOLDER: &str = "http://mock.local";

fn dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/connectors")
}

#[derive(Clone, Debug)]
struct Seen {
    method: String,
    path: String,
    query: BTreeMap<String, String>,
    headers: Vec<(String, String)>,
    body: Vec<u8>,
}

#[derive(Clone, Default)]
struct Mock {
    responses: Arc<Mutex<Vec<Value>>>,
    seen: Arc<Mutex<Vec<Seen>>>,
}

fn pairs(s: &str) -> BTreeMap<String, String> {
    url_pairs(s).into_iter().collect()
}

fn url_pairs(s: &str) -> Vec<(String, String)> {
    fn dec(s: &str) -> String {
        let b = s.replace('+', " ");
        let bytes = b.as_bytes();
        let mut out = Vec::new();
        let mut i = 0;
        while i < bytes.len() {
            if bytes[i] == b'%' && i + 2 < bytes.len() {
                if let Ok(v) = u8::from_str_radix(&b[i + 1..i + 3], 16) {
                    out.push(v);
                    i += 3;
                    continue;
                }
            }
            out.push(bytes[i]);
            i += 1;
        }
        String::from_utf8_lossy(&out).into_owned()
    }
    s.split('&')
        .filter(|p| !p.is_empty())
        .map(|p| match p.split_once('=') {
            Some((k, v)) => (dec(k), dec(v)),
            None => (dec(p), String::new()),
        })
        .collect()
}

async fn handle(State(m): State<Mock>, req: Request) -> Response {
    let (parts, body) = req.into_parts();
    let body = to_bytes(body, usize::MAX)
        .await
        .unwrap_or_default()
        .to_vec();
    let n = {
        let mut seen = m.seen.lock().unwrap();
        seen.push(Seen {
            method: parts.method.to_string(),
            path: parts.uri.path().to_owned(),
            query: pairs(parts.uri.query().unwrap_or("")),
            headers: parts
                .headers
                .iter()
                .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_owned()))
                .collect(),
            body,
        });
        seen.len() - 1
    };
    let r = m.responses.lock().unwrap().get(n).cloned();
    let Some(r) = r else {
        return Response::builder()
            .status(599)
            .body(Body::from("unexpected request"))
            .unwrap();
    };
    let mut b = Response::builder().status(r["status"].as_u64().unwrap_or(200) as u16);
    let mut body = Vec::new();
    if let Some(t) = r.get("bodyText").and_then(Value::as_str) {
        body = t.as_bytes().to_vec();
    } else if let Some(v) = r.get("body") {
        body = serde_json::to_vec(v).unwrap();
        b = b.header("content-type", "application/json");
    }
    for (k, v) in r["headers"].as_object().into_iter().flatten() {
        b = b.header(k.as_str(), v.as_str().unwrap_or(""));
    }
    b.body(Body::from(body)).unwrap()
}

async fn serve(mock: Mock) -> String {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    let app = Router::new().fallback(handle).with_state(mock);
    tokio::spawn(async move {
        loop {
            let Ok((stream, _)) = listener.accept().await else {
                return;
            };
            let svc = TowerToHyperService::new(app.clone());
            tokio::spawn(async move {
                let _ = hyper::server::conn::http1::Builder::new()
                    .auto_date_header(false)
                    .serve_connection(TokioIo::new(stream), svc)
                    .await;
            });
        }
    });
    format!("http://{addr}")
}

fn check_request(name: &str, i: usize, want: &Value, got: &Seen) -> Vec<String> {
    let mut errs = Vec::new();
    let mut fail = |m: String| errs.push(format!("{name} request {i}: {m}"));
    let s = |k: &str| want.get(k).and_then(Value::as_str);
    if let Some(m) = s("method") {
        if m != got.method {
            fail(format!("method {} != {m}", got.method));
        }
    }
    if let Some(p) = s("path") {
        if p != got.path {
            fail(format!("path {} != {p}", got.path));
        }
    }
    let want_q: BTreeMap<String, String> = want["query"]
        .as_object()
        .into_iter()
        .flatten()
        .map(|(k, v)| (k.clone(), v.as_str().unwrap_or_default().to_owned()))
        .collect();
    if want_q != got.query {
        fail(format!("query {:?} != {want_q:?}", got.query));
    }
    let header = |n: &str| {
        got.headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case(n))
            .map(|(_, v)| v.as_str())
    };
    for (k, v) in want["headers"].as_object().into_iter().flatten() {
        if header(k) != v.as_str() {
            fail(format!("header {k}: {:?} != {v}", header(k)));
        }
    }
    for k in want["absentHeaders"].as_array().into_iter().flatten() {
        let k = k.as_str().unwrap_or_default();
        if header(k).is_some() {
            fail(format!("header {k} must be absent"));
        }
    }
    let text = String::from_utf8_lossy(&got.body).into_owned();
    if let Some(b) = want.get("body") {
        match serde_json::from_slice::<Value>(&got.body) {
            Ok(v) if &v == b => {}
            _ => fail(format!("body {text} != {b}")),
        }
    } else if let Some(t) = s("bodyText") {
        if t != text {
            fail(format!("body {text:?} != {t:?}"));
        }
    } else if let Some(f) = want.get("form") {
        let got_f: Value = url_pairs(&text)
            .into_iter()
            .map(|(k, v)| (k, Value::String(v)))
            .collect::<Map<_, _>>()
            .into();
        if &got_f != f {
            fail(format!("form {got_f} != {f}"));
        }
    } else if !got.body.is_empty() {
        fail(format!("unexpected body {text}"));
    }
    errs
}

#[derive(Clone, Default)]
struct Logs(Arc<Mutex<Vec<u8>>>);

impl Write for Logs {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        self.0.lock().unwrap().extend_from_slice(buf);
        Ok(buf.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}

async fn run_fixture(path: &Path, bless: bool) -> Vec<String> {
    let name = path.file_name().unwrap().to_string_lossy().into_owned();
    let raw = std::fs::read_to_string(path).unwrap();
    serde_json::from_str::<Value>(&raw).unwrap_or_else(|e| panic!("{name}: {e}"));
    let mock = Mock::default();
    let base = serve(mock.clone()).await;
    // Recorded URLs (a redirect's Location, say) point at the mock once its port is known.
    let fixture: Value = serde_json::from_str(&raw.replace(PLACEHOLDER, &base)).unwrap();
    *mock.responses.lock().unwrap() = fixture["exchanges"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|e| e["response"].clone())
        .collect();

    let env: BTreeMap<String, String> = fixture["env"]
        .as_object()
        .into_iter()
        .flatten()
        .map(|(k, v)| (k.clone(), v.as_str().unwrap_or_default().to_owned()))
        .collect();
    let prefix = fixture["secretPrefix"].as_str().unwrap_or("").to_owned();
    let lookup = env.clone();
    let connector = HttpJsonConnector::new(Secrets::from_lookup(prefix, move |n| {
        lookup.get(n).cloned()
    }));
    let job = ActivatedJob {
        job_key: "2251799813685249".into(),
        job_type: "io.camunda:http-json:1".into(),
        element_id: "rest".into(),
        retries: fixture["job"]["retries"].as_i64().unwrap_or(3) as i32,
        variables: fixture["job"]["variables"]
            .as_object()
            .cloned()
            .unwrap_or_default(),
        custom_headers: fixture["job"]["headers"]
            .as_object()
            .cloned()
            .unwrap_or_default(),
        ..ActivatedJob::default()
    };

    let logs = Logs::default();
    let writer = logs.clone();
    let subscriber = tracing_subscriber::fmt()
        .with_max_level(tracing::Level::TRACE)
        .with_writer(move || writer.clone())
        .finish();
    let guard = tracing::subscriber::set_default(subscriber);
    let command = run_job(&connector, &job).await;
    drop(guard);

    let actual: Value = serde_json::from_str(
        &serde_json::to_string(&command_json(&command))
            .unwrap()
            .replace(&base, PLACEHOLDER),
    )
    .unwrap();

    let mut errs = Vec::new();
    let seen = mock.seen.lock().unwrap().clone();
    let wanted: Vec<Value> = fixture["exchanges"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|e| e["request"].clone())
        .collect();
    if seen.len() != wanted.len() {
        errs.push(format!(
            "{name}: {} requests, recorded {}",
            seen.len(),
            wanted.len()
        ));
    }
    for (i, (w, g)) in wanted.iter().zip(&seen).enumerate() {
        errs.extend(check_request(&name, i, w, g));
    }

    let log_text = String::from_utf8_lossy(&logs.0.lock().unwrap()).into_owned();
    let command_text = actual.to_string();
    let echoes: Vec<String> = fixture["secretsEchoed"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|v| v.as_str().map(str::to_owned))
        .collect();
    for (k, v) in &env {
        if v.len() >= 4 && log_text.contains(v.as_str()) {
            errs.push(format!("{name}: secret {k} appears in the logs"));
        }
        if v.len() >= 4 && command_text.contains(v.as_str()) && !echoes.contains(k) {
            errs.push(format!("{name}: secret {k} appears in the command"));
        }
    }

    if bless {
        let mut original: Value = serde_json::from_str(&raw).unwrap();
        original["expected"] = actual;
        let mut text = serde_json::to_string_pretty(&original).unwrap();
        text.push('\n');
        std::fs::write(path, text).unwrap();
    } else {
        let want: Value = serde_json::from_str(&raw).unwrap();
        if want["expected"] != actual {
            errs.push(format!(
                "{name}: command\n  got      {actual}\n  expected {}",
                want["expected"]
            ));
        }
    }
    errs
}

#[tokio::test]
async fn replay_conformance_fixtures() {
    let bless = std::env::var("BPMNKIT_BLESS").is_ok_and(|v| v == "1");
    let mut files: Vec<PathBuf> = std::fs::read_dir(dir())
        .expect("conformance/connectors")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "json"))
        .collect();
    files.sort();
    assert!(
        files.len() >= 30,
        "plan P5 wants ≥ 30 fixtures, found {}",
        files.len()
    );
    let mut errs = Vec::new();
    for f in &files {
        errs.extend(run_fixture(f, bless).await);
    }
    assert!(errs.is_empty(), "{}", errs.join("\n"));
}

#[tokio::test]
async fn transport_errors_are_redacted() {
    // Nothing listens on port 9 (discard) of localhost in CI; the URL carries the secret.
    let connector = HttpJsonConnector::new(Secrets::from_lookup("", |n| {
        (n == "KEY").then(|| "hunter2-key".to_owned())
    }));
    let job = ActivatedJob {
        job_key: "1".into(),
        retries: 2,
        variables: json!({
            "url": "http://127.0.0.1:9/x",
            "authentication": {"type": "apiKey", "apiKeyLocation": "query", "name": "key", "value": "{{secrets.KEY}}"},
        })
        .as_object()
        .unwrap()
        .clone(),
        ..ActivatedJob::default()
    };
    let out = command_json(&run_job(&connector, &job).await);
    let msg = out["fail"]["errorMessage"].as_str().unwrap();
    assert!(msg.starts_with("HTTP request failed"), "{msg}");
    assert!(!msg.contains("hunter2"), "{msg}");
    assert_eq!(out["fail"]["retries"], 1);
}
