//! Pipeline behaviour with a fake executor: no cargo, no target needed.

use std::cell::RefCell;
use std::collections::BTreeMap;

use bpmnkit_wasm_build::*;

struct Fake {
    calls: RefCell<Vec<Vec<String>>>,
    reply: Result<ExecOutput, ExecError>,
}
impl Executor for Fake {
    fn run(&self, cmd: &Cmd, _: &ExecLimits) -> Result<ExecOutput, ExecError> {
        self.calls.borrow_mut().push(cmd.args.clone());
        self.reply.clone()
    }
}
fn fake(reply: Result<ExecOutput, ExecError>) -> Fake {
    Fake {
        calls: RefCell::default(),
        reply,
    }
}

fn input(src: &str) -> BuildInput {
    BuildInput {
        manifest: toml::from_str(
            "[worker]\nname = \"t\"\nversion = \"0.1.0\"\njob_types = [\"t\"]\n",
        )
        .unwrap(),
        sources: BTreeMap::from([("src/lib.rs".into(), src.into())]),
        samples: vec![],
    }
}

const ERR: &str = r#"{"reason":"compiler-message","message":{"level":"error","message":"mismatched types","code":{"code":"E0308"},"spans":[{"file_name":"src/lib.rs","line_start":2,"column_start":5,"is_primary":true}],"children":[]}}"#;

fn tc() -> Toolchain {
    let mut tc = Toolchain::local("/sdk");
    tc.work_root = std::env::temp_dir().join("bpmnkit-wasm-pipeline-test");
    tc
}

#[test]
fn check_failure_maps_diagnostics_and_stops() {
    let ex = fake(Ok(ExecOutput {
        code: Some(101),
        stdout: ERR.into(),
        stderr: String::new(),
    }));
    let p = run_pipeline_until(&input("fn f() {}"), &tc(), &ex, Stage::Package);
    assert!(!p.report.ok);
    assert_eq!(p.report.diagnostics[0].code, "E0308");
    assert_eq!(p.report.diagnostics[0].line, 2);
    let stages: Vec<_> = p.report.timings.iter().map(|t| t.stage.as_str()).collect();
    assert_eq!(
        stages,
        ["render", "check"],
        "stops at the first failing stage"
    );
    assert_eq!(ex.calls.borrow().len(), 1);
    assert_eq!(ex.calls.borrow()[0][0], "check");
}

#[test]
fn source_rejection_never_reaches_the_executor() {
    let ex = fake(Ok(ExecOutput::default()));
    let p = run_pipeline_until(
        &input(r#"const X: &[u8] = include_bytes!("/etc/passwd");"#),
        &tc(),
        &ex,
        Stage::Package,
    );
    assert!(!p.report.ok);
    assert_eq!(p.report.diagnostics[0].code, "forbidden-macro");
    assert!(ex.calls.borrow().is_empty());
}

#[test]
fn executor_failure_is_a_diagnostic() {
    let ex = fake(Err(ExecError::WallTime(std::time::Duration::from_secs(
        300,
    ))));
    let p = run_pipeline_until(&input("fn f() {}"), &tc(), &ex, Stage::Package);
    assert_eq!(p.report.diagnostics[0].code, "exec");
    assert!(p.report.diagnostics[0].message.contains("wall time"));
}

#[test]
fn silent_cargo_failure_reports_stderr() {
    let ex = fake(Ok(ExecOutput {
        code: Some(101),
        stdout: String::new(),
        stderr: "error: no matching package named `x`\n".into(),
    }));
    let p = run_pipeline_until(&input("fn f() {}"), &tc(), &ex, Stage::Check);
    assert!(p.report.diagnostics[0]
        .message
        .contains("no matching package"));
}

#[test]
fn check_only_succeeds_on_a_clean_check() {
    let ex = fake(Ok(ExecOutput {
        code: Some(0),
        ..Default::default()
    }));
    let p = run_pipeline_until(&input("fn f() {}"), &tc(), &ex, Stage::Check);
    assert!(p.report.ok, "{:?}", p.report.diagnostics);
    assert_eq!(p.report.timings.len(), 2);
    assert!(p.artifact.is_none());
}

#[test]
fn offline_and_locked_follow_the_toolchain() {
    let ex = fake(Ok(ExecOutput {
        code: Some(0),
        ..Default::default()
    }));
    let mut t = tc();
    let lock = std::env::temp_dir().join("bpmnkit-wasm-test.lock");
    std::fs::write(&lock, "# lock\n").unwrap();
    t.lockfile = Some(lock);
    t.offline = true;
    run_pipeline_until(&input("fn f() {}"), &t, &ex, Stage::Check);
    let args = ex.calls.borrow()[0].join(" ");
    assert!(
        args.contains("--locked") && args.contains("--offline") && args.contains("wasm32-wasip2"),
        "{args}"
    );
}

#[test]
fn observer_sees_each_stage_start_and_finish() {
    let ex = fake(Ok(ExecOutput {
        code: Some(101),
        stdout: ERR.into(),
        stderr: String::new(),
    }));
    let mut seen = Vec::new();
    run_pipeline_observed(&input("fn f() {}"), &tc(), &ex, Stage::Package, &mut |e| {
        seen.push(match e {
            StageEvent::Started(s) => (s, None),
            StageEvent::Finished { stage, ok, .. } => (stage, Some(ok)),
        })
    });
    assert_eq!(
        seen,
        [
            (Stage::Render, None),
            (Stage::Render, Some(true)),
            (Stage::Check, None),
            (Stage::Check, Some(false)),
        ]
    );
}
