//! `bpmnkit worker gen --lang java` end to end.

use assert_cmd::Command;

const FIXTURE: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../bpmnkit-codegen/tests/fixtures/order.bpmn"
);

fn gen(args: &[&str]) -> assert_cmd::assert::Assert {
    Command::cargo_bin("bpmnkit")
        .unwrap()
        .args(["worker", "gen", "--lang", "java", "--name", "order-workers"])
        .args(args)
        .arg(FIXTURE)
        .assert()
}

#[test]
fn writes_then_checks_then_detects_drift_and_keeps_stubs() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("p");
    let out_s = out.to_str().unwrap();

    gen(&["--out", out_s]).success();
    gen(&["--out", out_s, "--check"]).success();

    let types = out.join("src/main/java/com/example/orderworkers/gen/JobTypes.java");
    let stub = out.join("src/main/java/com/example/orderworkers/handlers/ShipOrderHandler.java");
    std::fs::write(&types, "// edited\n").unwrap();
    std::fs::write(&stub, "// mine\n").unwrap();
    let drift = gen(&["--out", out_s, "--check"])
        .code(1)
        .get_output()
        .stderr
        .clone();
    let drift = String::from_utf8(drift).unwrap();
    assert!(
        drift.contains("changed: src/main/java/com/example/orderworkers/gen/JobTypes.java"),
        "{drift}"
    );
    // A stub edit alone is not drift.
    assert!(!drift.contains("ShipOrderHandler"), "{drift}");

    gen(&["--out", out_s]).success();
    assert_eq!(std::fs::read_to_string(&stub).unwrap(), "// mine\n");
    gen(&["--out", out_s, "--check"]).success();
}

#[test]
fn explain_lists_rules_and_files_and_writes_nothing() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("p");
    let stdout = gen(&["--out", out.to_str().unwrap(), "--explain", "--spring"])
        .success()
        .get_output()
        .stdout
        .clone();
    let text = String::from_utf8(stdout).unwrap();
    assert!(text.contains("charge-card\tworker\tR4"), "{text}");
    assert!(text.contains("application.properties\tonce"), "{text}");
    assert!(!out.exists());
}

const TYPED_SCHEMA: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../bpmnkit-codegen/tests/fixtures/typed.schema.json"
);

fn gen_with(lang: &str, args: &[&str]) -> assert_cmd::assert::Assert {
    Command::cargo_bin("bpmnkit")
        .unwrap()
        .args(["worker", "gen", "--lang", lang, "--name", "order-workers"])
        .args(args)
        .arg(FIXTURE)
        .assert()
}

#[test]
fn rust_writes_checks_locks_and_keeps_stubs() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("p");
    let out_s = out.to_str().unwrap();
    let schema = format!("charge-card={TYPED_SCHEMA}");

    gen_with("rust", &["--out", out_s, "--input-schema", &schema]).success();
    gen_with(
        "rust",
        &["--out", out_s, "--input-schema", &schema, "--check"],
    )
    .success();
    let lock = std::fs::read_to_string(out.join("bpmnkit.lock.json")).unwrap();
    assert!(
        lock.contains("\"target\": \"rust\"") && lock.contains("\"irHash\""),
        "{lock}"
    );

    let stub = out.join("src/handlers/ship_order.rs");
    std::fs::write(&stub, "// mine\n").unwrap();
    std::fs::write(out.join("src/gen/errors.rs"), "// edited\n").unwrap();
    // The schema is part of the IR: checking without it is drift in the lock file too.
    let drift = gen_with("rust", &["--out", out_s, "--check"])
        .code(1)
        .get_output()
        .stderr
        .clone();
    let drift = String::from_utf8(drift).unwrap();
    assert!(
        drift.contains("changed: src/gen/errors.rs")
            && drift.contains("changed: bpmnkit.lock.json"),
        "{drift}"
    );
    assert!(!drift.contains("handlers/ship_order.rs"), "{drift}");

    gen_with("rust", &["--out", out_s, "--input-schema", &schema]).success();
    assert_eq!(std::fs::read_to_string(&stub).unwrap(), "// mine\n");
}

#[test]
fn java_has_a_lock_file_too() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("p");
    gen_with("java", &["--out", out.to_str().unwrap()]).success();
    assert!(out.join("bpmnkit.lock.json").is_file());
}

#[test]
fn template_target_needs_rest_jobs() {
    let dir = tempfile::tempdir().unwrap();
    // Both jobs of the fixture are workers (R4): nothing to bind.
    gen_with("template", &["--out", dir.path().to_str().unwrap()]).failure();
    gen_with(
        "template",
        &["--all", "--out", dir.path().to_str().unwrap()],
    )
    .success();
    assert!(dir.path().join("templates/charge-card.json").is_file());
    assert!(!dir.path().join("bpmnkit.lock.json").exists());
}

#[test]
fn unknown_schema_job_type_is_an_error() {
    let dir = tempfile::tempdir().unwrap();
    let schema = format!("nope={TYPED_SCHEMA}");
    gen_with(
        "rust",
        &[
            "--out",
            dir.path().to_str().unwrap(),
            "--input-schema",
            &schema,
        ],
    )
    .failure();
}
