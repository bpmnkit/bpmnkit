//! `bpmnkit self update`: cargo-dist installs carry an install receipt that axoupdater reads.
//! npm and Homebrew installs are managed by their package managers, so the updater stays off.

use std::path::Path;

/// How this binary was installed; decides who may update it.
#[derive(Debug, PartialEq, Eq)]
pub enum Install {
    /// The npm launcher sets `BPMNKIT_INSTALLED_VIA=npm`.
    Npm,
    Brew,
    /// Anything else: a cargo-dist installer leaves a receipt, a bare binary does not.
    Other,
}

pub fn detect(exe: &Path, via: Option<&str>) -> Install {
    if via == Some("npm") {
        return Install::Npm;
    }
    let p = exe.to_string_lossy().replace('\\', "/");
    if p.contains("/Cellar/") || p.contains("/homebrew/") || p.contains("/linuxbrew/") {
        return Install::Brew;
    }
    // Platform package inside node_modules, run without the launcher.
    if p.contains("/node_modules/@bpmnkit/cli-") {
        return Install::Npm;
    }
    Install::Other
}

pub fn run() -> i32 {
    let exe = std::env::current_exe().unwrap_or_default();
    match detect(&exe, std::env::var("BPMNKIT_INSTALLED_VIA").ok().as_deref()) {
        Install::Npm => {
            eprintln!(
                "bpmnkit: installed through npm; update with `npm install -g @bpmnkit/cli@latest`"
            );
            1
        }
        Install::Brew => {
            eprintln!(
                "bpmnkit: installed through Homebrew; update with `brew upgrade bpmnkit-cli`"
            );
            1
        }
        Install::Other => update(),
    }
}

fn update() -> i32 {
    let mut updater = axoupdater::AxoUpdater::new_for("bpmnkit-cli");
    if updater.load_receipt().is_err() {
        eprintln!(
            "bpmnkit: no installer receipt found, so this install cannot update itself.\n\
             Reinstall with the shell/PowerShell installer from https://github.com/bpmnkit/bpmnkit/releases"
        );
        return 1;
    }
    match updater.run_sync() {
        Ok(Some(res)) => {
            eprintln!("bpmnkit: updated to {}", res.new_version);
            0
        }
        Ok(None) => {
            eprintln!("bpmnkit: already up to date");
            0
        }
        Err(e) => {
            eprintln!("bpmnkit: update failed: {e}");
            1
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn npm_env_wins() {
        assert_eq!(
            detect(&PathBuf::from("/usr/bin/bpmnkit"), Some("npm")),
            Install::Npm
        );
    }

    #[test]
    fn npm_platform_package_path() {
        let p = PathBuf::from("/h/node_modules/@bpmnkit/cli-linux-x64/bin/bpmnkit");
        assert_eq!(detect(&p, None), Install::Npm);
    }

    #[test]
    fn brew_paths() {
        for p in [
            "/opt/homebrew/bin/bpmnkit",
            "/usr/local/Cellar/bpmnkit/2.0.0/bin/bpmnkit",
            "/home/linuxbrew/.linuxbrew/bin/bpmnkit",
        ] {
            assert_eq!(detect(&PathBuf::from(p), None), Install::Brew, "{p}");
        }
    }

    #[test]
    fn installer_and_bare_binary_may_update() {
        assert_eq!(
            detect(&PathBuf::from("/home/u/.cargo/bin/bpmnkit"), None),
            Install::Other
        );
        assert_eq!(
            detect(
                &PathBuf::from("C:\\Users\\u\\.cargo\\bin\\bpmnkit.exe"),
                None
            ),
            Install::Other
        );
    }
}
