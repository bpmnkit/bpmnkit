//! Writes the project the agent never sees: a fixed `Cargo.toml` from the allow-list, the
//! agent's `src/**.rs` after the source checks, and the manifest.

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};

use bpmnkit_wasm_contract::{
    validate, BuildRequest, Diagnostic, Manifest, SampleJob, ValidManifest,
};

use crate::source::{check_source, MAX_FILES, MAX_FILE_BYTES, MAX_TOTAL_BYTES};
use crate::toolchain::Toolchain;

/// What the agent submits, with the sources keyed by path (`src/lib.rs`, `src/util.rs`, …).
#[derive(Debug, Clone, PartialEq)]
pub struct BuildInput {
    pub manifest: Manifest,
    pub sources: BTreeMap<String, String>,
    pub samples: Vec<SampleJob>,
}

impl From<BuildRequest> for BuildInput {
    fn from(r: BuildRequest) -> Self {
        Self {
            manifest: r.manifest,
            sources: BTreeMap::from([("src/lib.rs".to_owned(), r.source)]),
            samples: r.samples,
        }
    }
}

impl BuildInput {
    /// Reads a worker directory: `worker.toml`, `src/**.rs`, optional `samples.json`.
    pub fn from_dir(dir: &Path) -> Result<Self, String> {
        let read = |p: &Path| fs::read_to_string(p).map_err(|e| format!("{}: {e}", p.display()));
        let manifest = toml::from_str(&read(&dir.join("worker.toml"))?)
            .map_err(|e| format!("worker.toml: {e}"))?;
        let mut sources = BTreeMap::new();
        fn walk(root: &Path, dir: &Path, out: &mut BTreeMap<String, String>) -> Result<(), String> {
            let rd = fs::read_dir(dir).map_err(|e| format!("{}: {e}", dir.display()))?;
            for e in rd.flatten() {
                let p = e.path();
                if p.is_dir() {
                    walk(root, &p, out)?;
                } else if p.extension().is_some_and(|x| x == "rs") {
                    let rel = p.strip_prefix(root).expect("under root");
                    let rel = rel.to_string_lossy().replace('\\', "/");
                    let text = fs::read_to_string(&p).map_err(|e| format!("{rel}: {e}"))?;
                    out.insert(rel, text);
                }
            }
            Ok(())
        }
        walk(dir, &dir.join("src"), &mut sources)?;
        let samples = match fs::read_to_string(dir.join("samples.json")) {
            Ok(t) => serde_json::from_str(&t).map_err(|e| format!("samples.json: {e}"))?,
            Err(_) => Vec::new(),
        };
        Ok(Self {
            manifest,
            sources,
            samples,
        })
    }
}

/// A rendered project on disk. Removed on drop unless `Toolchain::keep_work`.
#[derive(Debug)]
pub struct Project {
    pub dir: PathBuf,
    pub manifest: ValidManifest,
    /// Everything written, relative path → content.
    pub files: BTreeMap<String, String>,
    pub samples: Vec<SampleJob>,
    keep: bool,
}

impl Drop for Project {
    fn drop(&mut self) {
        if !self.keep {
            let _ = fs::remove_dir_all(&self.dir);
        }
    }
}

/// Crates a worker may use besides the SDK. Never from agent input; versions are pinned further
/// by the toolchain's `Cargo.lock`.
const ALLOWED_DEPS: &str = r#"serde = { version = "1", features = ["derive"] }
serde_json = "1""#;

/// The generated `Cargo.toml`.
pub fn cargo_toml(sdk_path: &Path) -> String {
    let sdk = format!("{:?}", sdk_path.display().to_string());
    format!(
        r#"[package]
name = "worker"
version = "0.0.0"
edition = "2024"
publish = false

[lib]
crate-type = ["cdylib"]

[dependencies]
bpmnkit-wasm-sdk = {{ path = {sdk} }}
{ALLOWED_DEPS}

[lints.rust]
unsafe_code = "forbid"

[profile.release]
opt-level = 2
lto = false
codegen-units = 16
incremental = false
debug = false
strip = true

# Stops cargo from adopting an enclosing workspace.
[workspace]
"#
    )
}

fn d(file: &str, code: &str, message: String, hint: Option<&str>) -> Diagnostic {
    Diagnostic {
        file: file.into(),
        line: 0,
        col: 0,
        code: code.into(),
        message,
        suggestion: hint.map(Into::into),
    }
}

fn valid_rel(p: &str) -> bool {
    p.starts_with("src/")
        && p.ends_with(".rs")
        && !p.contains("..")
        && !p.contains("//")
        && p.bytes()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, b'/' | b'_' | b'-' | b'.'))
}

pub fn render(input: &BuildInput, tc: &Toolchain) -> Result<Project, Vec<Diagnostic>> {
    let mut diags = Vec::new();
    let manifest = match validate(input.manifest.clone()) {
        Ok(m) => Some(m),
        Err(es) => {
            diags.extend(
                es.iter()
                    .map(|e| d("worker.toml", "manifest", e.to_string(), None)),
            );
            None
        }
    };
    if !input.sources.contains_key("src/lib.rs") {
        diags.push(d(
            "src/lib.rs",
            "missing-source",
            "src/lib.rs is required".into(),
            None,
        ));
    }
    if input.sources.len() > MAX_FILES {
        diags.push(d(
            "src",
            "too-many-files",
            format!("{} source files, at most {MAX_FILES}", input.sources.len()),
            Some("merge modules"),
        ));
    }
    let total: usize = input.sources.values().map(String::len).sum();
    if total > MAX_TOTAL_BYTES {
        diags.push(d(
            "src",
            "too-large",
            format!("sources are {total} bytes, at most {MAX_TOTAL_BYTES}"),
            None,
        ));
    }
    for (path, text) in &input.sources {
        if !valid_rel(path) {
            diags.push(d(
                path,
                "bad-path",
                format!("`{path}` is not a valid source path"),
                Some("use src/<name>.rs"),
            ));
        } else if text.len() > MAX_FILE_BYTES {
            diags.push(d(
                path,
                "too-large",
                format!("{} bytes, at most {MAX_FILE_BYTES} per file", text.len()),
                None,
            ));
        } else {
            diags.extend(check_source(path, text));
        }
    }
    let Some(manifest) = manifest.filter(|_| diags.is_empty()) else {
        return Err(diags);
    };

    let mut files: BTreeMap<String, String> = input.sources.clone();
    files.insert("Cargo.toml".into(), cargo_toml(&tc.sdk_path));
    files.insert("worker.toml".into(), manifest.to_toml());
    if let Some(lock) = &tc.lockfile {
        let text = fs::read_to_string(lock).map_err(|e| {
            vec![d(
                "Cargo.lock",
                "toolchain",
                format!("{}: {e}", lock.display()),
                None,
            )]
        })?;
        files.insert("Cargo.lock".into(), text);
    }

    static SEQ: AtomicU32 = AtomicU32::new(0);
    let dir = tc.work_root.join(format!(
        "{}-{}-{}",
        manifest.worker.name,
        std::process::id(),
        SEQ.fetch_add(1, Ordering::Relaxed)
    ));
    let write = || -> std::io::Result<()> {
        for (rel, text) in &files {
            let p = dir.join(rel);
            fs::create_dir_all(p.parent().expect("has parent"))?;
            fs::write(p, text)?;
        }
        Ok(())
    };
    write().map_err(|e| {
        vec![d(
            "",
            "io",
            format!("cannot write {}: {e}", dir.display()),
            None,
        )]
    })?;
    Ok(Project {
        dir,
        manifest,
        files,
        samples: input.samples.clone(),
        keep: tc.keep_work,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    pub fn input(src: &str) -> BuildInput {
        BuildInput {
            manifest: toml::from_str(
                "[worker]\nname = \"t\"\nversion = \"0.1.0\"\njob_types = [\"t\"]\n",
            )
            .unwrap(),
            sources: BTreeMap::from([("src/lib.rs".into(), src.into())]),
            samples: vec![],
        }
    }

    fn tc() -> Toolchain {
        let mut tc = Toolchain::local("/sdk");
        tc.work_root = std::env::temp_dir().join("bpmnkit-wasm-render-test");
        tc
    }

    #[test]
    fn rendered_cargo_toml_is_golden() {
        assert_eq!(
            cargo_toml(Path::new("/sdk")),
            include_str!("../tests/golden/Cargo.toml")
        );
    }

    #[test]
    fn writes_the_project_and_removes_it_on_drop() {
        let p = render(&input("fn f() {}"), &tc()).unwrap();
        let dir = p.dir.clone();
        assert!(dir.join("Cargo.toml").is_file() && dir.join("src/lib.rs").is_file());
        assert!(dir.join("worker.toml").is_file());
        drop(p);
        assert!(!dir.exists());
    }

    #[test]
    fn manifest_errors_become_diagnostics() {
        let mut i = input("");
        i.manifest.worker.name = "Bad Name".into();
        let e = render(&i, &tc()).unwrap_err();
        assert_eq!(
            (e[0].file.as_str(), e[0].code.as_str()),
            ("worker.toml", "manifest")
        );
    }

    #[test]
    fn source_problems_are_reported_with_their_file() {
        let e = render(&input("extern crate libc;"), &tc()).unwrap_err();
        assert_eq!(
            (e[0].file.as_str(), e[0].code.as_str()),
            ("src/lib.rs", "extern-crate")
        );
    }

    #[test]
    fn path_and_size_rules() {
        let mut i = input("");
        i.sources.insert("src/../evil.rs".into(), String::new());
        i.sources.insert("build.rs".into(), String::new());
        i.sources
            .insert("src/big.rs".into(), "/".repeat(MAX_FILE_BYTES + 1));
        let codes: Vec<_> = render(&i, &tc())
            .unwrap_err()
            .into_iter()
            .map(|d| d.code)
            .collect();
        assert_eq!(
            codes.iter().filter(|c| *c == "bad-path").count(),
            2,
            "{codes:?}"
        );
        assert!(codes.contains(&"too-large".to_string()));
        let mut none = input("");
        none.sources.clear();
        assert_eq!(render(&none, &tc()).unwrap_err()[0].code, "missing-source");
    }
}
