//! Black-box tests: the binary runs with a fake home, a fake plugin dir and a fake legacy script.

use assert_cmd::Command;
use std::fs;
use std::path::Path;

fn bin() -> Command {
    Command::cargo_bin("bpmnkit").unwrap()
}

/// A command with every config/plugin root pointed into `home`.
fn sandboxed(home: &Path) -> Command {
    let mut c = bin();
    c.env_clear()
        .env("HOME", home)
        .env("XDG_CONFIG_HOME", home.join("cfg"))
        .env("PATH", home.join("path"))
        .env_remove("BPMNKIT_NO_LEGACY");
    c
}

#[test]
fn help_snapshot() {
    let out = bin()
        .arg("--help")
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    insta::assert_snapshot!(String::from_utf8(out).unwrap());
}

#[test]
fn completion_emits_script_for_each_shell() {
    for shell in ["bash", "zsh", "fish", "powershell", "elvish"] {
        let out = bin()
            .args(["completion", shell])
            .assert()
            .success()
            .get_output()
            .stdout
            .clone();
        assert!(String::from_utf8_lossy(&out).contains("bpmnkit"), "{shell}");
    }
}

#[cfg(unix)]
mod unix {
    use super::*;
    use std::os::unix::fs::{symlink, PermissionsExt};

    fn script(path: &Path, body: &str) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, format!("#!/bin/sh\n{body}\n")).unwrap();
        fs::set_permissions(path, fs::Permissions::from_mode(0o755)).unwrap();
    }

    /// `node` stand-in: prints argv and exits with a code given by the first test argument.
    fn fake_node(home: &Path) {
        script(
            &home.join("path/node"),
            "echo \"node:$@\"; case \"$*\" in *fail*) exit 7;; esac",
        );
    }

    #[test]
    fn casen_lint_falls_back_to_legacy_node() {
        let t = tempfile::tempdir().unwrap();
        fake_node(t.path());
        // argv0 = casen via a symlink to the real binary
        let casen = t.path().join("casen");
        symlink(assert_cmd::cargo::cargo_bin("bpmnkit"), &casen).unwrap();
        let out = std::process::Command::new(&casen)
            .args(["lint", "x.bpmn"])
            .env_clear()
            .env("HOME", t.path())
            .env("XDG_CONFIG_HOME", t.path().join("cfg"))
            .env("PATH", t.path().join("path"))
            .env("BPMNKIT_LEGACY_CLI", "/fake/legacy.js")
            .output()
            .unwrap();
        assert!(out.status.success());
        assert_eq!(
            String::from_utf8_lossy(&out.stdout).trim(),
            "node:/fake/legacy.js lint x.bpmn"
        );
        let err = String::from_utf8_lossy(&out.stderr);
        assert!(err.contains("legacy CLI"), "{err}");
        assert!(err.contains("`casen` is now `bpmnkit`"), "{err}");
        // second call the same day: no deprecation note again
        let again = std::process::Command::new(&casen)
            .args(["lint", "x.bpmn"])
            .env_clear()
            .env("HOME", t.path())
            .env("XDG_CONFIG_HOME", t.path().join("cfg"))
            .env("PATH", t.path().join("path"))
            .env("BPMNKIT_LEGACY_CLI", "/fake/legacy.js")
            .output()
            .unwrap();
        assert!(!String::from_utf8_lossy(&again.stderr).contains("is now `bpmnkit`"));
    }

    #[test]
    fn legacy_exit_code_passes_through() {
        let t = tempfile::tempdir().unwrap();
        fake_node(t.path());
        sandboxed(t.path())
            .env("BPMNKIT_LEGACY_CLI", "/fake/legacy.js")
            .args(["lint", "fail"])
            .assert()
            .code(7);
    }

    #[test]
    fn no_legacy_disables_fallback() {
        let t = tempfile::tempdir().unwrap();
        fake_node(t.path());
        sandboxed(t.path())
            .env("BPMNKIT_LEGACY_CLI", "/fake/legacy.js")
            .env("BPMNKIT_NO_LEGACY", "1")
            .arg("lint")
            .assert()
            .code(2)
            .stdout("");
    }

    #[test]
    fn flags_before_the_command_go_to_legacy_not_plugins() {
        let t = tempfile::tempdir().unwrap();
        fake_node(t.path());
        script(&t.path().join("path/bpmnkit-lint"), "echo plugin");
        sandboxed(t.path())
            .env("BPMNKIT_LEGACY_CLI", "/f.js")
            .args(["--json", "lint"])
            .assert()
            .stdout("node:/f.js --json lint\n");
    }

    #[test]
    fn hello_plugin_env_contract() {
        let t = tempfile::tempdir().unwrap();
        script(
            &t.path().join("path/bpmnkit-hello"),
            "echo \"api=$BPMNKIT_PLUGIN_API base=$BPMNKIT_API_BASE args=$*\"; echo \"$BPMNKIT_PROFILE_JSON\"; exit 3",
        );
        let cfg = t.path().join("cfg/bpmnkit");
        fs::create_dir_all(&cfg).unwrap();
        fs::write(
            cfg.join("config.json"),
            r#"{"profiles":{"dev":{"baseUrl":"http://localhost:8080/v2","auth":{"type":"none"}}},"active":"dev","meta":{"dev":{"apiType":"c8"}}}"#,
        )
        .unwrap();
        let out = sandboxed(t.path())
            .args(["hello", "a", "--b"])
            .assert()
            .code(3)
            .get_output()
            .stdout
            .clone();
        let text = String::from_utf8(out).unwrap();
        let mut lines = text.lines();
        assert_eq!(
            lines.next().unwrap(),
            "api=1 base=http://localhost:8080/v2 args=a --b"
        );
        let p: serde_json::Value = serde_json::from_str(lines.next().unwrap()).unwrap();
        assert_eq!(p["name"], "dev");
        assert_eq!(p["apiType"], "c8");
        assert_eq!(p["config"]["baseUrl"], "http://localhost:8080/v2");
    }

    #[test]
    fn plugin_without_profile_gets_api_version_only() {
        let t = tempfile::tempdir().unwrap();
        script(
            &t.path().join("path/bpmnkit-hello"),
            "echo \"api=$BPMNKIT_PLUGIN_API p=[$BPMNKIT_PROFILE_JSON]\"",
        );
        sandboxed(t.path())
            .arg("hello")
            .assert()
            .stdout("api=1 p=[]\n");
    }

    #[test]
    fn plugin_found_in_plugins_dir_and_listed_and_casen_prefix() {
        let t = tempfile::tempdir().unwrap();
        script(
            &t.path().join(".bpmnkit/plugins/bin/bpmnkit-one"),
            "echo one",
        );
        script(&t.path().join(".casen/plugins/bin/casen-two"), "echo two");
        sandboxed(t.path()).arg("two").assert().stdout("two\n");
        let out = sandboxed(t.path())
            .args(["plugin", "list"])
            .assert()
            .success()
            .get_output()
            .stdout
            .clone();
        let text = String::from_utf8(out).unwrap();
        assert!(text.contains("one\t") && text.contains("two\t"), "{text}");
    }

    #[test]
    fn profile_list_migrates_casen_store() {
        let t = tempfile::tempdir().unwrap();
        let old = t.path().join("cfg/casen");
        fs::create_dir_all(&old).unwrap();
        fs::write(
            old.join("config.json"),
            r#"{"profiles":{"a":{},"b":{}},"active":"b","meta":{}}"#,
        )
        .unwrap();
        sandboxed(t.path())
            .args(["profile", "list"])
            .assert()
            .stdout("  a\n* b\n");
        assert!(t.path().join("cfg/bpmnkit/config.json").exists());
        assert!(old.join("config.json").exists());
    }

    #[test]
    fn non_native_profile_subcommand_goes_to_legacy() {
        let t = tempfile::tempdir().unwrap();
        fake_node(t.path());
        sandboxed(t.path())
            .env("BPMNKIT_LEGACY_CLI", "/f.js")
            .args(["profile", "create", "x"])
            .assert()
            .stdout("node:/f.js profile create x\n");
    }
}
