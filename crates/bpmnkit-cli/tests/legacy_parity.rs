//! Native commands against output recorded from the legacy Node CLI's command objects
//! (`scripts/record-cli-snapshots.mjs`; goldens in `tests/legacy/`).
//!
//! Byte-equal: `lint` text, `diff` text on diagram-only changes. Normalised: JSON (the legacy
//! `lint` prints its finding objects, the native one `LintDiagnostic`s; both are compared on the
//! fields they share). Documented deviation: legacy `diff` only compares diagrams (positions),
//! the native one also reports semantic changes, so a model pair without diagram interchange
//! differs (legacy: "No differences.").

use assert_cmd::Command;
use serde_json::Value;
use std::path::PathBuf;

fn dir(sub: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join(sub)
}

/// (stdout with the fixtures path made symbolic, exit code)
fn native(args: &[&str]) -> (String, i32) {
    let fixtures = dir("fixtures");
    let args: Vec<String> = args
        .iter()
        .map(|a| {
            if a.ends_with(".bpmn") {
                fixtures.join(a).display().to_string()
            } else {
                (*a).to_owned()
            }
        })
        .collect();
    let out = Command::cargo_bin("bpmnkit")
        .unwrap()
        .env("BPMNKIT_NO_LEGACY", "1")
        .args(&args)
        .output()
        .unwrap();
    let text = String::from_utf8(out.stdout).unwrap();
    (
        text.replace(&fixtures.display().to_string(), "<fixtures>"),
        out.status.code().unwrap(),
    )
}

fn legacy(case: &str) -> (String, i32) {
    let out = std::fs::read_to_string(dir("legacy").join(format!("{case}.out"))).unwrap();
    let code = std::fs::read_to_string(dir("legacy").join(format!("{case}.code"))).unwrap();
    (out, code.trim().parse().unwrap())
}

#[test]
fn lint_text_matches_legacy() {
    for (case, args) in [
        ("lint-two-errors", vec!["lint", "two-errors.bpmn"]),
        ("lint-deployable", vec!["lint", "deployable.bpmn"]),
        (
            "lint-categories-naming",
            vec!["lint", "two-errors.bpmn", "--categories", "naming"],
        ),
    ] {
        assert_eq!(native(&args), legacy(case), "{case}");
    }
}

fn lint_tuples(json: &str) -> Vec<(String, String, String, String, Value)> {
    let v: Value = serde_json::from_str(json).unwrap();
    v.as_array()
        .unwrap()
        .iter()
        .map(|f| {
            let s = |k: &str| f[k].as_str().unwrap().to_owned();
            (
                s("id"),
                s("category"),
                s("severity"),
                s("message"),
                f["elementIds"].clone(),
            )
        })
        .collect()
}

#[test]
fn lint_json_matches_legacy_on_shared_fields() {
    for (case, extra) in [
        ("lint-two-errors-json", vec![]),
        ("lint-deploy-json", vec!["--profile", "deploy"]),
    ] {
        let mut args = vec!["lint", "two-errors.bpmn", "--format", "json"];
        args.extend(extra);
        let (n, ncode) = native(&args);
        let (l, lcode) = legacy(case);
        assert_eq!(lint_tuples(&n), lint_tuples(&l), "{case}");
        assert_eq!(ncode, lcode, "{case}");
    }
}

#[test]
fn diff_text_matches_legacy_on_diagram_changes() {
    for (case, args) in [
        ("diff-moved", vec!["diff", "laid-out.bpmn", "moved.bpmn"]),
        (
            "diff-same",
            vec!["diff", "deployable.bpmn", "deployable.bpmn"],
        ),
    ] {
        assert_eq!(native(&args), legacy(case), "{case}");
    }
}

#[test]
fn diff_json_lists_the_same_ids_per_kind() {
    let (n, _) = native(&["diff", "laid-out.bpmn", "moved.bpmn", "--format", "json"]);
    let (l, _) = legacy("diff-moved-json");
    let (n, l): (Value, Value) = (
        serde_json::from_str(&n).unwrap(),
        serde_json::from_str(&l).unwrap(),
    );
    for kind in ["added", "removed", "changed", "moved"] {
        let mut native_ids: Vec<&str> = n["changes"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|c| c["kind"] == kind)
            .map(|c| c["id"].as_str().unwrap())
            .collect();
        let mut legacy_ids: Vec<&str> = l[kind]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_str().unwrap())
            .collect();
        native_ids.sort_unstable();
        legacy_ids.sort_unstable();
        assert_eq!(native_ids, legacy_ids, "{kind}");
    }
}

#[test]
fn diff_deviation_semantic_changes_are_reported() {
    let (legacy_out, _) = legacy("diff-deployable-two-errors");
    assert_eq!(legacy_out, "✓ No differences.\n");
    let (out, _) = native(&["diff", "deployable.bpmn", "two-errors.bpmn"]);
    assert!(out.contains("6 differences"), "{out}");
}
