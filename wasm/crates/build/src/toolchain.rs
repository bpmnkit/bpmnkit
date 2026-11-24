use std::path::PathBuf;
use std::time::Duration;

/// Where and how builds run. Dependencies are never taken from agent input: they come from the
/// fixed allow-list in `render`, resolved against `sdk_path` (and `lockfile` when given).
#[derive(Debug, Clone)]
pub struct Toolchain {
    pub cargo: String,
    /// `rustc --version`, recorded in the artifact metadata.
    pub rustc: String,
    /// Directory of the `bpmnkit-wasm-sdk` crate (path dependency; `=0.x` from a registry later).
    pub sdk_path: PathBuf,
    /// Shared cargo target dir (the pre-warmed dependency snapshot). `None`: inside the project.
    pub target_dir: Option<PathBuf>,
    /// A curated `Cargo.lock` copied into every project. With it, builds run `--locked`.
    pub lockfile: Option<PathBuf>,
    /// Pass `--offline` (set together with `lockfile` and a vendored/warm cargo home).
    pub offline: bool,
    /// Projects are rendered under here.
    pub work_root: PathBuf,
    pub stage_timeout: Duration,
    /// Keep the rendered project directory after the run (debugging).
    pub keep_work: bool,
}

impl Toolchain {
    /// Local dev toolchain: `cargo` and `rustc` from `PATH`.
    pub fn local(sdk_path: impl Into<PathBuf>) -> Self {
        let rustc = std::process::Command::new("rustc")
            .arg("--version")
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map_or_else(|| "unknown".into(), |s| s.trim().to_owned());
        Self {
            cargo: "cargo".into(),
            rustc,
            sdk_path: sdk_path.into(),
            target_dir: None,
            lockfile: None,
            offline: false,
            work_root: std::env::temp_dir().join("bpmnkit-wasm-build"),
            stage_timeout: Duration::from_secs(300),
            keep_work: false,
        }
    }

    /// The SDK crate of this checkout, when the binary runs from one.
    pub fn in_repo_sdk() -> Option<PathBuf> {
        let p = PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/../sdk"));
        p.join("Cargo.toml").is_file().then_some(p)
    }
}
