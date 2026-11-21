//! Subprocess plugins: `bpmnkit foo` runs `bpmnkit-foo` (then `casen-foo`).
//!
//! Contract (`BPMNKIT_PLUGIN_API=1`): argv is the arguments after the plugin name; env gets
//! `BPMNKIT_PLUGIN_API`, and, when a profile is active, `BPMNKIT_PROFILE_JSON` (`{name, apiType,
//! config}`) and `BPMNKIT_API_BASE` (the profile's `baseUrl`). The exit code is passed through.

use std::ffi::OsString;
use std::path::{Path, PathBuf};
use std::process::Command;

use bpmnkit_profiles::Roots;

pub const API_VERSION: &str = "1";
const PREFIXES: [&str; 2] = ["bpmnkit-", "casen-"];

fn plugin_bins(roots: &Roots) -> Vec<PathBuf> {
    // `~/.bpmnkit/plugins` first, then the legacy `~/.casen/plugins`; PATH comes first overall.
    let mut dirs: Vec<PathBuf> = std::env::var_os("PATH")
        // Empty or relative entries resolve against the cwd, so an untrusted checkout could
        // plant `bpmnkit-<typo>` and receive the active profile (secrets included) in its env.
        .map(|p| {
            std::env::split_paths(&p)
                .filter(|d| d.is_absolute())
                .collect()
        })
        .unwrap_or_default();
    dirs.push(roots.home.join(".bpmnkit/plugins/bin"));
    dirs.push(roots.home.join(".casen/plugins/bin"));
    dirs
}

fn is_executable(p: &Path) -> bool {
    let Ok(meta) = p.metadata() else { return false };
    if !meta.is_file() {
        return false;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        meta.permissions().mode() & 0o111 != 0
    }
    #[cfg(not(unix))]
    true
}

fn candidates(base: &str) -> Vec<String> {
    if cfg!(windows) {
        ["", ".exe", ".cmd", ".bat"]
            .iter()
            .map(|e| format!("{base}{e}"))
            .collect()
    } else {
        vec![base.to_owned()]
    }
}

fn find(roots: &Roots, name: &str) -> Option<PathBuf> {
    let dirs = plugin_bins(roots);
    PREFIXES.iter().find_map(|prefix| {
        dirs.iter().find_map(|d| {
            candidates(&format!("{prefix}{name}"))
                .into_iter()
                .map(|c| d.join(c))
                .find(|p| is_executable(p))
        })
    })
}

/// Installed plugins as `(command name, path)`, sorted; the first match per name wins.
pub fn list(roots: &Roots) -> Vec<(String, PathBuf)> {
    let mut found: Vec<(String, PathBuf)> = Vec::new();
    for prefix in PREFIXES {
        for dir in plugin_bins(roots) {
            let Ok(rd) = std::fs::read_dir(dir) else {
                continue;
            };
            for e in rd.flatten() {
                let file = e.file_name().to_string_lossy().into_owned();
                let stem = file.split('.').next().unwrap_or(&file);
                let Some(n) = stem.strip_prefix(prefix).filter(|n| !n.is_empty()) else {
                    continue;
                };
                if is_executable(&e.path()) && !found.iter().any(|(f, _)| f == n) {
                    found.push((n.to_owned(), e.path()));
                }
            }
        }
    }
    found.sort();
    found
}

/// Runs the plugin for `args[0]`; `None` when there is none (caller falls back to legacy).
pub fn dispatch(roots: &Roots, args: &[OsString]) -> Option<i32> {
    let name = args.first()?.to_string_lossy().into_owned();
    // Path separators and dots would let `bpmnkit ../x` escape the plugin dirs.
    if name.is_empty() || name.contains(['/', '\\', '.']) {
        return None;
    }
    let path = find(roots, &name)?;
    let mut cmd = Command::new(&path);
    cmd.args(&args[1..]).env("BPMNKIT_PLUGIN_API", API_VERSION);
    if let Some(profile) = bpmnkit_profiles::active_profile(roots) {
        if let Some(base) = profile["config"]["baseUrl"].as_str() {
            cmd.env("BPMNKIT_API_BASE", base);
        }
        cmd.env("BPMNKIT_PROFILE_JSON", profile.to_string());
    } else {
        cmd.env_remove("BPMNKIT_PROFILE_JSON")
            .env_remove("BPMNKIT_API_BASE");
    }
    match cmd.status() {
        Ok(s) => Some(crate::exit_code(s)),
        Err(e) => {
            eprintln!("bpmnkit: cannot run plugin {}: {e}", path.display());
            Some(126)
        }
    }
}
