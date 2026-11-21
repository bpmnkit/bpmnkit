//! Fallback to the legacy Node CLI (`@bpmnkit/cli-legacy`) for commands not ported yet.

use std::ffi::OsString;
use std::path::PathBuf;
use std::process::Command;

/// Where the legacy entry script lives: `BPMNKIT_LEGACY_CLI`, else next to the installed binary
/// (npm platform package layout, wired up in plan P8).
fn script() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("BPMNKIT_LEGACY_CLI") {
        return Some(PathBuf::from(p));
    }
    let exe = std::env::current_exe().ok()?;
    let dir = exe.parent()?;
    [
        dir.join("legacy/index.js"),
        dir.join("../node_modules/@bpmnkit/cli-legacy/dist/index.js"),
        dir.join("../../cli-legacy/dist/index.js"),
    ]
    .into_iter()
    .find(|p| p.is_file())
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
