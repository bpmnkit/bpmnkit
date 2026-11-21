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
