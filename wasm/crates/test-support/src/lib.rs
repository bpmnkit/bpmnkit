//! Builds the guest fixtures in `wasm/fixtures/` for `wasm32-wasip2`, once per test process, into
//! `wasm/target/fixtures/`. Tests that call this need the target
//! (`rustup target add wasm32-wasip2`) and are `#[ignore = "needs wasm32-wasip2"]`.
//!
//! ```ignore
//! let dir = bpmnkit_wasm_test_support::fixture_dir("echo"); // worker.toml + worker.wasm
//! let wasm = bpmnkit_wasm_test_support::build_fixture("spin");
//! ```

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::OnceLock;
use std::{env, fs};

/// Every fixture: `echo` completes with its input (+ `job_key`), `throw` throws `ECHO_ERROR`,
/// `panic` panics, `spin` never returns (`timeout_ms = 1000`), `http-get` GETs variable `url`
/// (allow-list `api.example.com:443`), `secret` reads declared `API_KEY` and undeclared `OTHER`.
pub const FIXTURES: [&str; 6] = ["echo", "throw", "panic", "spin", "http-get", "secret"];

pub const TARGET: &str = "wasm32-wasip2";

/// `wasm/` (the workspace root).
pub fn wasm_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../..")
}

/// `wasm/fixtures/<name>/` (sources and `worker.toml`).
pub fn fixture_src(name: &str) -> PathBuf {
    assert!(FIXTURES.contains(&name), "unknown fixture `{name}`");
    wasm_root().join("fixtures").join(name)
}

/// The fixture's `worker.toml` text.
pub fn fixture_manifest(name: &str) -> String {
    let p = fixture_src(name).join("worker.toml");
    fs::read_to_string(&p).unwrap_or_else(|e| panic!("{}: {e}", p.display()))
}

fn target_dir() -> PathBuf {
    wasm_root().join("target/fixtures")
}

/// Builds all fixtures (one cargo call, once per process) and returns this one's `.wasm`.
pub fn build_fixture(name: &str) -> PathBuf {
    fixture_src(name);
    static BUILT: OnceLock<()> = OnceLock::new();
    BUILT.get_or_init(build_all);
    let wasm = target_dir()
        .join(TARGET)
        .join("release")
        .join(format!("fixture_{}.wasm", name.replace('-', "_")));
    assert!(wasm.is_file(), "missing {}", wasm.display());
    wasm
}

/// A loadable worker directory, `wasm/target/fixtures/dirs/<name>/` with `worker.toml` and
/// `worker.wasm`: the layout the host loads.
pub fn fixture_dir(name: &str) -> PathBuf {
    let wasm = build_fixture(name);
    let dir = target_dir().join("dirs").join(name);
    fs::create_dir_all(&dir).expect("create fixture dir");
    // Several test binaries may run at once: write to a private file, then rename into place.
    let place = |file: &str, bytes: &[u8]| {
        let tmp = dir.join(format!("{file}.{}", std::process::id()));
        fs::write(&tmp, bytes).expect("write fixture file");
        fs::rename(&tmp, dir.join(file)).expect("rename fixture file");
    };
    place("worker.toml", fixture_manifest(name).as_bytes());
    place("worker.wasm", &fs::read(&wasm).expect("read fixture wasm"));
    dir
}

fn build_all() {
    let cargo = env::var_os("CARGO").unwrap_or_else(|| "cargo".into());
    let status = Command::new(cargo)
        .args([
            "build",
            "--release",
            "--locked",
            "--workspace",
            "--target",
            TARGET,
        ])
        .arg("--manifest-path")
        .arg(wasm_root().join("fixtures/Cargo.toml"))
        .arg("--target-dir")
        .arg(target_dir())
        // Cargo locks the target dir, so concurrent test binaries wait instead of clobbering.
        .status()
        .expect("run cargo");
    assert!(
        status.success(),
        "building wasm/fixtures failed (is the target installed? `rustup target add {TARGET}`)"
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_fixture_has_sources_and_a_manifest() {
        for f in FIXTURES {
            assert!(fixture_src(f).join("src/lib.rs").is_file(), "{f}");
            assert!(
                fixture_manifest(f).contains(&format!("name = \"{f}\"")),
                "{f}"
            );
        }
    }

    #[test]
    #[should_panic(expected = "unknown fixture")]
    fn unknown_fixture_panics() {
        fixture_src("nope");
    }
}
