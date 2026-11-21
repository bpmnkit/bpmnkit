//! `connector test`: template → input mappings (FEEL) → one REST call → command JSON.

use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::mpsc;

use assert_cmd::Command;
use serde_json::{json, Value};

/// Answers one request with `body` and hands back the request head.
fn one_shot(body: &'static str) -> (String, mpsc::Receiver<String>) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        let (mut s, _) = listener.accept().unwrap();
        let mut buf = vec![0u8; 8192];
        let n = s.read(&mut buf).unwrap();
        tx.send(String::from_utf8_lossy(&buf[..n]).into_owned())
            .unwrap();
        let resp = format!(
            "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{body}",
            body.len()
        );
        s.write_all(resp.as_bytes()).unwrap();
    });
    (base, rx)
}

fn template(base: &str) -> Value {
    json!({
        "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
        "name": "Get pet", "id": "io.test.getpet", "version": 1,
        "appliesTo": ["bpmn:Task"], "elementType": {"value": "bpmn:ServiceTask"},
        "properties": [
            {"type": "Hidden", "value": "io.camunda:http-json:1", "binding": {"type": "zeebe:taskDefinition", "property": "type"}},
            {"type": "Hidden", "value": "GET", "binding": {"type": "zeebe:input", "name": "method"}},
            {"type": "String", "value": format!("=\"{base}/pets/\" + string(petId)"), "binding": {"type": "zeebe:input", "name": "url"}},
            {"type": "Hidden", "value": "bearer", "binding": {"type": "zeebe:input", "name": "authentication.type"}},
            {"type": "String", "value": "{{secrets.PET_TOKEN}}", "binding": {"type": "zeebe:input", "name": "authentication.token"}},
            {"type": "Text", "value": "={name: response.body.name}", "binding": {"type": "zeebe:taskHeader", "key": "resultExpression"}}
        ]
    })
}

#[test]
fn connector_test_runs_a_template() {
    let (base, rx) = one_shot(r#"{"name":"Rex"}"#);
    let dir = tempfile::tempdir().unwrap();
    let t = dir.path().join("t.json");
    std::fs::write(&t, template(&base).to_string()).unwrap();
    let vars = dir.path().join("v.json");
    std::fs::write(&vars, r#"{"petId": 7}"#).unwrap();
    let out = Command::cargo_bin("bpmnkit")
        .unwrap()
        .env("PET_TOKEN", "pet-secret-1")
        .env_remove("CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX")
        .args(["connector", "test"])
        .arg(&t)
        .arg("--vars")
        .arg(&vars)
        .output()
        .unwrap();
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "{stdout}\n{}",
        String::from_utf8_lossy(&out.stderr)
    );
    let v: Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(v, json!({"complete": {"variables": {"name": "Rex"}}}));
    let head = rx.recv().unwrap();
    assert!(head.starts_with("GET /pets/7 "), "{head}");
    assert!(
        head.to_ascii_lowercase()
            .contains("authorization: bearer pet-secret-1"),
        "{head}"
    );
}

#[test]
fn connector_test_reports_a_missing_secret_and_exits_1() {
    let dir = tempfile::tempdir().unwrap();
    let t = dir.path().join("t.json");
    std::fs::write(&t, template("http://127.0.0.1:9").to_string()).unwrap();
    let out = Command::cargo_bin("bpmnkit")
        .unwrap()
        .env_remove("PET_TOKEN")
        .args(["connector", "test"])
        .arg(&t)
        .output()
        .unwrap();
    assert_eq!(out.status.code(), Some(1));
    let v: Value = serde_json::from_slice(&out.stdout).unwrap();
    assert_eq!(
        v["fail"]["errorMessage"],
        "Secret with name 'PET_TOKEN' is not available"
    );
    assert_eq!(v["fail"]["retries"], 2);
}

#[test]
fn connector_test_needs_id_for_arrays() {
    let dir = tempfile::tempdir().unwrap();
    let t = dir.path().join("t.json");
    let one = template("http://x");
    std::fs::write(&t, json!([one, one]).to_string()).unwrap();
    let out = Command::cargo_bin("bpmnkit")
        .unwrap()
        .args(["connector", "test"])
        .arg(&t)
        .output()
        .unwrap();
    assert_eq!(out.status.code(), Some(1));
    assert!(String::from_utf8_lossy(&out.stderr).contains("--id"));
}

#[test]
fn connector_gen_writes_the_api_index() {
    let dir = tempfile::tempdir().unwrap();
    let index = dir.path().join("index.json");
    let spec = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../bpmnkit-connectors/tests/fixtures/specs/petstore3.json"
    );
    let out = Command::cargo_bin("bpmnkit")
        .unwrap()
        .args(["connector", "gen", spec, "--dry-run", "--api-index"])
        .arg(&index)
        .output()
        .unwrap();
    assert!(
        out.status.success(),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
    let v: Value = serde_json::from_str(&std::fs::read_to_string(&index).unwrap()).unwrap();
    assert_eq!(v["id"], "petstore3");
    let ops = v["operations"].as_array().unwrap();
    assert!(!ops.is_empty());
    assert!(
        ops.iter().any(|o| o["responseMediaTypes"].is_array()),
        "{v}"
    );
}
