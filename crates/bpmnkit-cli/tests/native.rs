//! Native `lint`, `layout`, `diff`, `render`, `convert`: snapshots plus fallback routing.
//! `legacy_parity.rs` checks the same commands against recorded legacy-CLI output.

use assert_cmd::Command;
use std::fs;
use std::path::PathBuf;

fn fixture(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests/fixtures")
        .join(name)
}

fn bin() -> Command {
    let mut c = Command::cargo_bin("bpmnkit").unwrap();
    // The legacy CLI must never run: a fallback would print its own banner.
    c.env("BPMNKIT_NO_LEGACY", "1");
    c
}

fn run(args: &[&str], code: i32) -> String {
    let out = bin().args(args).assert().code(code).get_output().clone();
    format!(
        "{}{}",
        String::from_utf8(out.stdout).unwrap(),
        if out.stderr.is_empty() {
            String::new()
        } else {
            format!("--- stderr\n{}", String::from_utf8(out.stderr).unwrap())
        }
    )
}

fn f(name: &str) -> String {
    fixture(name).display().to_string()
}

#[test]
fn lint_text_fails_on_errors() {
    insta::assert_snapshot!(run(&["lint", &f("two-errors.bpmn")], 1));
}

#[test]
fn lint_text_clean_model_names_no_platform() {
    insta::assert_snapshot!(run(&["lint", &f("deployable.bpmn")], 0));
}

#[test]
fn lint_json_is_the_findings_array() {
    let out = run(&["lint", &f("two-errors.bpmn"), "--format", "json"], 0);
    let v: serde_json::Value = serde_json::from_str(&out).unwrap();
    assert!(v
        .as_array()
        .unwrap()
        .iter()
        .any(|x| x["id"] == "deploy/service-task-no-type" && x["severity"] == "error"));
}

#[test]
fn lint_deploy_profile_shows_errors_only() {
    let out = run(
        &[
            "lint",
            &f("two-errors.bpmn"),
            "--profile",
            "deploy",
            "--format",
            "json",
        ],
        0,
    );
    let v: serde_json::Value = serde_json::from_str(&out).unwrap();
    assert!(v
        .as_array()
        .unwrap()
        .iter()
        .all(|x| x["severity"] == "error"));
}

#[test]
fn lint_sketch_profile_skips_engine_rules() {
    let out = run(&["lint", &f("two-errors.bpmn"), "--profile", "sketch"], 0);
    assert!(!out.contains("[deploy]"), "{out}");
}

#[test]
fn lint_categories_narrow_the_run() {
    let out = run(
        &["lint", &f("two-errors.bpmn"), "--categories", "naming"],
        0,
    );
    assert!(
        out.contains("[naming]") && !out.contains("[pattern]"),
        "{out}"
    );
}

#[test]
fn lint_unknown_category_is_an_error() {
    let out = run(&["lint", &f("two-errors.bpmn"), "--categories", "nope"], 1);
    assert!(out.contains("unknown category \"nope\""), "{out}");
}

#[test]
fn legacy_nested_verbs_still_work() {
    assert_eq!(
        run(&["lint", "lint", &f("two-errors.bpmn")], 1),
        run(&["lint", &f("two-errors.bpmn")], 1)
    );
    assert_eq!(
        run(
            &["diff", "bpmn", &f("deployable.bpmn"), &f("two-errors.bpmn")],
            0
        ),
        run(&["diff", &f("deployable.bpmn"), &f("two-errors.bpmn")], 0)
    );
}

#[test]
fn layout_prints_xml_with_diagram_interchange() {
    let out = run(&["layout", &f("deployable.bpmn")], 0);
    assert!(out.contains("<bpmndi:BPMNShape"), "{out}");
}

#[test]
fn layout_is_idempotent_and_writes_in_place() {
    let t = tempfile::tempdir().unwrap();
    let p = t.path().join("m.bpmn");
    fs::copy(fixture("deployable.bpmn"), &p).unwrap();
    let ps = p.display().to_string();
    run(&["layout", &ps, "--in-place"], 0);
    let once = fs::read_to_string(&p).unwrap();
    run(&["layout", &ps, "--in-place"], 0);
    assert_eq!(once, fs::read_to_string(&p).unwrap());
    assert_eq!(once, run(&["layout", &ps], 0));
}

#[test]
fn diff_text_and_exit_code() {
    let (a, b) = (f("deployable.bpmn"), f("two-errors.bpmn"));
    insta::assert_snapshot!(run(&["diff", &a, &b], 0));
    run(&["diff", &a, &b, "--exit-code"], 1);
    insta::assert_snapshot!("diff_same", run(&["diff", &a, &a, "--exit-code"], 0));
}

#[test]
fn diff_json_has_a_summary() {
    let out = run(
        &[
            "diff",
            &f("deployable.bpmn"),
            &f("two-errors.bpmn"),
            "--format",
            "json",
        ],
        0,
    );
    let v: serde_json::Value = serde_json::from_str(&out).unwrap();
    assert_eq!(v["summary"]["total"], 6);
}

#[test]
fn render_svg_and_png() {
    let svg = run(&["render", &f("deployable.bpmn")], 0);
    assert!(svg.starts_with("<svg"), "{svg}");
    let t = tempfile::tempdir().unwrap();
    let png = t.path().join("m.png");
    run(
        &[
            "render",
            &f("deployable.bpmn"),
            "-o",
            &png.display().to_string(),
        ],
        0,
    );
    assert_eq!(&fs::read(&png).unwrap()[..4], b"\x89PNG");
    let dark = run(&["render", &f("deployable.bpmn"), "--theme", "dark"], 0);
    assert_ne!(svg, dark);
}

#[test]
fn convert_writes_next_to_the_input_and_guards_overwrites() {
    let t = tempfile::tempdir().unwrap();
    let p = t.path().join("claim.bpmn");
    fs::copy(fixture("c7-claim.bpmn"), &p).unwrap();
    let ps = p.display().to_string();
    // Without the gate the conversion is written even when it would not deploy.
    run(&["convert", &ps, "--no-validate"], 0);
    let out = t.path().join("claim.c8.bpmn");
    assert!(fs::read_to_string(&out).unwrap().contains("zeebe:"));
    let again = run(&["convert", &ps, "--no-validate"], 1);
    assert!(again.contains("already exists"), "{again}");
    run(&["convert", &ps, "--no-validate", "--force"], 0);
}

#[test]
fn convert_check_json_reports_and_writes_nothing() {
    let t = tempfile::tempdir().unwrap();
    let p = t.path().join("claim.bpmn");
    fs::copy(fixture("c7-claim.bpmn"), &p).unwrap();
    let out = run(
        &[
            "convert",
            &p.display().to_string(),
            "--check",
            "--no-validate",
            "--format",
            "json",
        ],
        // manual findings make --check fail, like the legacy CLI
        1,
    );
    let json = out.split("--- stderr").next().unwrap();
    let v: serde_json::Value = serde_json::from_str(json).unwrap();
    assert!(v[0]["counts"]["convertible"].as_u64().unwrap() > 0);
    assert!(!t.path().join("claim.c8.bpmn").exists());
}

#[cfg(unix)]
mod fallback {
    use super::*;
    use std::os::unix::fs::PermissionsExt;

    fn fake_node(home: &std::path::Path) {
        let p = home.join("path/node");
        fs::create_dir_all(p.parent().unwrap()).unwrap();
        fs::write(&p, "#!/bin/sh\necho \"node:$@\"\n").unwrap();
        fs::set_permissions(&p, fs::Permissions::from_mode(0o755)).unwrap();
    }

    fn legacy(home: &std::path::Path, args: &[&str]) -> String {
        let out = Command::cargo_bin("bpmnkit")
            .unwrap()
            .env_clear()
            .env("HOME", home)
            .env("XDG_CONFIG_HOME", home.join("cfg"))
            .env("PATH", home.join("path"))
            .env("BPMNKIT_LEGACY_CLI", "/l.js")
            .args(args)
            .assert()
            .success()
            .get_output()
            .stdout
            .clone();
        String::from_utf8(out).unwrap().trim().to_owned()
    }

    #[test]
    fn flags_and_verbs_only_legacy_knows_fall_back() {
        let t = tempfile::tempdir().unwrap();
        fake_node(t.path());
        for args in [
            vec!["lint", "x.bpmn", "--fix"],
            vec!["lint", "improve", "x.bpmn"],
            vec!["lint", "x.bpmn", "--bpmnlintrc", "r"],
            vec!["diff", "bpmn", "a.bpmn", "b.bpmn", "--html", "o.html"],
            vec!["diff", "a.bpmn", "b.bpmn", "--png", "o.png"],
        ] {
            assert_eq!(
                legacy(t.path(), &args),
                format!("node:/l.js {}", args.join(" ")),
                "{args:?}"
            );
        }
    }

    #[test]
    fn a_project_bpmnlintrc_falls_back_unless_disabled() {
        let t = tempfile::tempdir().unwrap();
        fake_node(t.path());
        fs::write(t.path().join(".bpmnlintrc"), "{}").unwrap();
        fs::copy(fixture("deployable.bpmn"), t.path().join("m.bpmn")).unwrap();
        let m = t.path().join("m.bpmn").display().to_string();
        assert!(legacy(t.path(), &["lint", &m]).starts_with("node:/l.js lint"));
        let native = Command::cargo_bin("bpmnkit")
            .unwrap()
            .env("BPMNKIT_NO_LEGACY", "1")
            .args(["lint", &m, "--no-bpmnlintrc"])
            .assert()
            .success();
        assert!(String::from_utf8_lossy(&native.get_output().stdout).contains("findings"));
    }
}

#[test]
fn connector_gen_writes_one_file_per_operation_like_the_library() {
    let t = tempfile::tempdir().unwrap();
    let out = t.path().join("out");
    run(
        &[
            "connector",
            "gen",
            &f("petstore3.yaml"),
            "-o",
            &out.display().to_string(),
            "--id-prefix",
            "io.pets",
        ],
        0,
    );
    let spec = fs::read_to_string(fixture("petstore3.yaml")).unwrap();
    let expected =
        bpmnkit_connectors::generate(&spec, &bpmnkit_connectors::GeneratorOptions::new("io.pets"))
            .unwrap();
    // Byte-equal to the library output (itself byte-equal to the TS generator).
    let mut got: Vec<String> = fs::read_dir(&out)
        .unwrap()
        .map(|e| fs::read_to_string(e.unwrap().path()).unwrap())
        .collect();
    let mut want: Vec<String> = expected
        .iter()
        .map(|t| serde_json::to_string_pretty(t).unwrap())
        .collect();
    got.sort();
    want.sort();
    assert_eq!(got, want);
}

#[test]
fn connector_gen_dry_run_and_bad_auth() {
    let out = run(&["connector", "gen", &f("petstore3.yaml"), "--dry-run"], 0);
    assert!(out.contains("Would generate"), "{out}");
    let bad = run(
        &["connector", "gen", &f("petstore3.yaml"), "--auth", "nope"],
        1,
    );
    assert!(bad.contains("Unknown --auth"), "{bad}");
}

#[test]
fn connector_bind_applies_a_catalog_template() {
    let out = run(
        &[
            "connector",
            "bind",
            &f("deployable.bpmn"),
            "charge",
            "-t",
            "io.camunda.connectors.HttpJson.v2",
            "--set",
            "method=GET",
            "--set",
            "url=https://example.com",
            "--no-validate",
        ],
        0,
    );
    assert!(out.contains("io.camunda:http-json:1"), "{out}");
    assert!(
        out.contains("zeebe:modelerTemplate=\"io.camunda.connectors.HttpJson.v2\""),
        "{out}"
    );
}

#[test]
fn connector_bind_refuses_an_unknown_element_and_template() {
    let e = run(
        &[
            "connector",
            "bind",
            &f("deployable.bpmn"),
            "nope",
            "-t",
            "io.camunda.connectors.HttpJson.v2",
        ],
        1,
    );
    assert!(e.contains("No flow element"), "{e}");
    let e = run(
        &[
            "connector",
            "bind",
            &f("deployable.bpmn"),
            "charge",
            "-t",
            "no.such.template",
        ],
        1,
    );
    assert!(e.contains("neither a bundled template id"), "{e}");
}

#[cfg(unix)]
#[test]
fn legacy_connector_verbs_fall_back() {
    use std::os::unix::fs::PermissionsExt;
    let t = tempfile::tempdir().unwrap();
    let p = t.path().join("path/node");
    fs::create_dir_all(p.parent().unwrap()).unwrap();
    fs::write(&p, "#!/bin/sh\necho \"node:$@\"\n").unwrap();
    fs::set_permissions(&p, fs::Permissions::from_mode(0o755)).unwrap();
    let out = Command::cargo_bin("bpmnkit")
        .unwrap()
        .env_clear()
        .env("HOME", t.path())
        .env("PATH", t.path().join("path"))
        .env("BPMNKIT_LEGACY_CLI", "/l.js")
        .args(["connector", "generate", "--swagger", "x.yaml"])
        .output()
        .unwrap();
    assert_eq!(
        String::from_utf8_lossy(&out.stdout).trim(),
        "node:/l.js connector generate --swagger x.yaml"
    );
}
