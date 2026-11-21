//! Fallback to the legacy Node CLI (`@bpmnkit/cli-legacy`) for commands not ported yet.

use std::ffi::OsString;
use std::path::{Path, PathBuf};
use std::process::Command;

const ENTRY: &str = "dist/index.js";

/// Finds `@bpmnkit/cli-legacy`'s entry by walking up from `start` the way Node resolves a bare
/// package name: a `node_modules/@bpmnkit/cli-legacy` in any ancestor. A binary inside the
/// scope directory itself (`…/@bpmnkit/cli-<platform>/bin`) finds its sibling the same way.
fn find_from(start: &Path) -> Option<PathBuf> {
    start.ancestors().find_map(|dir| {
        let nested = dir.join("node_modules/@bpmnkit/cli-legacy").join(ENTRY);
        let sibling = dir.join("cli-legacy").join(ENTRY);
        let in_scope = dir.file_name().is_some_and(|n| n == "@bpmnkit");
        if nested.is_file() {
            Some(nested)
        } else if in_scope && sibling.is_file() {
            Some(sibling)
        } else {
            None
        }
    })
}

/// `BPMNKIT_LEGACY_CLI` (set by the npm launcher, which resolves the package properly), else a
/// `node_modules` lookup from the binary's real location.
fn script() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("BPMNKIT_LEGACY_CLI") {
        return Some(PathBuf::from(p));
    }
    let exe = std::env::current_exe().ok()?;
    find_from(exe.parent()?)
}

pub fn run(args: &[OsString]) -> i32 {
    let cmd = args
        .first()
        .map(|a| a.to_string_lossy().into_owned())
        .unwrap_or_default();
    if std::env::var_os("BPMNKIT_NO_LEGACY").is_some_and(|v| v == "1") {
        eprintln!(
            "bpmnkit: unknown command `{cmd}` (legacy fallback disabled by BPMNKIT_NO_LEGACY=1)"
        );
        return 2;
    }
    let Some(script) = script() else {
        eprintln!("bpmnkit: `{cmd}` is not ported to the native CLI yet and the legacy CLI (@bpmnkit/cli-legacy) was not found");
        return 127;
    };
    eprintln!("bpmnkit: `{cmd}` is not native yet; running the legacy CLI (BPMNKIT_NO_LEGACY=1 disables this)");
    let node = std::env::var_os("BPMNKIT_NODE").unwrap_or_else(|| "node".into());
    match Command::new(&node).arg(&script).args(args).status() {
        Ok(s) => crate::exit_code(s),
        Err(e) => {
            eprintln!("bpmnkit: cannot start {}: {e}", node.to_string_lossy());
            127
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn touch(p: &Path) {
        fs::create_dir_all(p.parent().unwrap()).unwrap();
        fs::write(p, "").unwrap();
    }

    #[test]
    fn finds_package_in_an_ancestor_node_modules() {
        let t = tempfile::tempdir().unwrap();
        let entry = t
            .path()
            .join("node_modules/@bpmnkit/cli-legacy")
            .join(ENTRY);
        touch(&entry);
        let bin = t.path().join("node_modules/@bpmnkit/cli-linux-x64/bin");
        fs::create_dir_all(&bin).unwrap();
        assert_eq!(find_from(&bin), Some(entry));
    }

    #[test]
    fn finds_sibling_when_the_scope_dir_is_not_under_node_modules() {
        let t = tempfile::tempdir().unwrap();
        let entry = t.path().join("@bpmnkit/cli-legacy").join(ENTRY);
        touch(&entry);
        let bin = t.path().join("@bpmnkit/cli-darwin-arm64/bin");
        fs::create_dir_all(&bin).unwrap();
        assert_eq!(find_from(&bin), Some(entry));
    }

    #[test]
    fn a_missing_package_is_not_guessed() {
        let t = tempfile::tempdir().unwrap();
        touch(&t.path().join("legacy/index.js"));
        assert_eq!(find_from(t.path()), None);
    }
}
