//! `cargo check` and `cargo build` through an [`Executor`], with rustc's JSON messages mapped to
//! [`Diagnostic`]s the agent can act on.

use std::fs;

use bpmnkit_wasm_contract::{inspect, verify, Diagnostic, Digest, ValidManifest};
use serde_json::Value;

use crate::exec::{Cmd, ExecLimits, ExecOutput, Executor};
use crate::render::Project;
use crate::toolchain::Toolchain;

pub const TARGET: &str = "wasm32-wasip2";

#[derive(Debug, Clone, PartialEq)]
pub struct CheckReport {
    pub ok: bool,
    pub diagnostics: Vec<Diagnostic>,
}

/// A compiled and verified-by-construction component, before smoke tests.
#[derive(Debug, Clone)]
pub struct Built {
    pub wasm: Vec<u8>,
    pub manifest: ValidManifest,
    pub source_digest: Digest,
    pub lock_digest: Digest,
    pub toolchain: String,
}

#[derive(Debug, Clone, PartialEq)]
pub struct BuildFailure {
    pub diagnostics: Vec<Diagnostic>,
}

fn cmd(p: &Project, tc: &Toolchain, sub: &[&str]) -> Cmd {
    let mut args: Vec<String> = sub.iter().map(|s| (*s).to_owned()).collect();
    args.extend(["--target", TARGET, "--message-format=json"].map(String::from));
    if tc.lockfile.is_some() {
        args.push("--locked".into());
    }
    if tc.offline {
        args.push("--offline".into());
    }
    let mut env = vec![("CARGO_TERM_COLOR".to_owned(), "never".to_owned())];
    if let Some(t) = &tc.target_dir {
        env.push(("CARGO_TARGET_DIR".into(), t.display().to_string()));
    }
    Cmd {
        program: tc.cargo.clone(),
        args,
        cwd: p.dir.clone(),
        env,
    }
}

fn limits(tc: &Toolchain) -> ExecLimits {
    ExecLimits {
        wall_time: tc.stage_timeout,
        ..Default::default()
    }
}

fn exec_diag(message: String) -> Diagnostic {
    Diagnostic {
        file: String::new(),
        line: 0,
        col: 0,
        code: "exec".into(),
        message,
        suggestion: None,
    }
}

/// Maps cargo's JSON stdout to diagnostics in `src/`. Warnings in dependencies (the SDK is a
/// path dependency) are dropped; the agent can only act on its own files.
pub fn parse_messages(stdout: &str) -> Vec<Diagnostic> {
    parse_levels(stdout).into_iter().map(|(_, d)| d).collect()
}

/// `(is_error, diagnostic)`.
fn parse_levels(stdout: &str) -> Vec<(bool, Diagnostic)> {
    let mut out = Vec::new();
    for line in stdout.lines() {
        let Ok(v) = serde_json::from_str::<Value>(line) else {
            continue;
        };
        if v["reason"] != "compiler-message" {
            continue;
        }
        let m = &v["message"];
        let level = m["level"].as_str().unwrap_or_default();
        if !matches!(level, "error" | "warning") {
            continue;
        }
        let message = m["message"].as_str().unwrap_or_default();
        if message.starts_with("aborting due to") || message.contains("warning emitted") {
            continue;
        }
        let spans = m["spans"].as_array().cloned().unwrap_or_default();
        let primary = spans.iter().find(|s| s["is_primary"] == true);
        let file = primary
            .and_then(|s| s["file_name"].as_str())
            .unwrap_or_default();
        if !file.is_empty() && !file.starts_with("src/") {
            continue;
        }
        let suggestion = primary
            .and_then(|s| s["suggested_replacement"].as_str())
            .map(|r| format!("replace with `{r}`"))
            .or_else(|| {
                m["children"].as_array()?.iter().find_map(|c| {
                    (c["level"] == "help").then(|| c["message"].as_str().map(String::from))?
                })
            });
        let code = m["code"]["code"]
            .as_str()
            .map_or_else(|| level.to_owned(), ToOwned::to_owned);
        out.push((
            level == "error",
            Diagnostic {
                file: file.into(),
                line: primary.and_then(|s| s["line_start"].as_u64()).unwrap_or(0) as u32,
                col: primary
                    .and_then(|s| s["column_start"].as_u64())
                    .unwrap_or(0) as u32,
                code,
                message: message.into(),
                suggestion,
            },
        ));
    }
    out
}

fn run(
    p: &Project,
    tc: &Toolchain,
    ex: &dyn Executor,
    sub: &[&str],
) -> Result<(ExecOutput, bool, Vec<Diagnostic>), Vec<Diagnostic>> {
    let o = ex
        .run(&cmd(p, tc, sub), &limits(tc))
        .map_err(|e| vec![exec_diag(e.to_string())])?;
    let levels = parse_levels(&o.stdout);
    let has_error = levels.iter().any(|(e, _)| *e);
    Ok((o, has_error, levels.into_iter().map(|(_, d)| d).collect()))
}

/// A failed process with no parsable diagnostic still has to tell the agent something.
fn fallback(o: &ExecOutput) -> Diagnostic {
    let tail: Vec<&str> = o.stderr.lines().rev().take(8).collect();
    exec_diag(format!(
        "cargo exited with {:?}: {}",
        o.code,
        tail.into_iter().rev().collect::<Vec<_>>().join(" | ")
    ))
}

pub fn check(p: &Project, tc: &Toolchain, ex: &dyn Executor) -> CheckReport {
    match run(p, tc, ex, &["check"]) {
        Err(diagnostics) => CheckReport {
            ok: false,
            diagnostics,
        },
        Ok((o, has_error, mut diagnostics)) => {
            let ok = o.code == Some(0);
            if !ok && !has_error {
                diagnostics.push(fallback(&o));
            }
            CheckReport { ok, diagnostics }
        }
    }
}

pub fn build(p: &Project, tc: &Toolchain, ex: &dyn Executor) -> Result<Built, BuildFailure> {
    let (o, has_error, mut diagnostics) = run(p, tc, ex, &["build", "--release"])
        .map_err(|diagnostics| BuildFailure { diagnostics })?;
    if o.code != Some(0) {
        if !has_error {
            diagnostics.push(fallback(&o));
        }
        return Err(BuildFailure { diagnostics });
    }
    let target = tc
        .target_dir
        .clone()
        .unwrap_or_else(|| p.dir.join("target"));
    let path = target.join(TARGET).join("release").join("worker.wasm");
    let wasm = fs::read(&path).map_err(|e| BuildFailure {
        diagnostics: vec![exec_diag(format!("{}: {e}", path.display()))],
    })?;
    let mut src = String::new();
    for (rel, text) in &p.files {
        if rel.starts_with("src/") || rel == "worker.toml" {
            src.push_str(&format!("{rel}\0{text}\0"));
        }
    }
    let lock = fs::read(p.dir.join("Cargo.lock")).unwrap_or_default();
    Ok(Built {
        wasm,
        manifest: p.manifest.clone(),
        source_digest: Digest::of(src.as_bytes()),
        lock_digest: Digest::of(&lock),
        toolchain: tc.rustc.clone(),
    })
}

/// The component's imports and exports against the manifest.
pub fn verify_built(b: &Built) -> Vec<Diagnostic> {
    let d = |message: String, hint: Option<&str>| Diagnostic {
        file: "worker.wasm".into(),
        line: 0,
        col: 0,
        code: "verify".into(),
        message,
        suggestion: hint.map(Into::into),
    };
    match inspect(&b.wasm) {
        Err(e) => vec![d(e.to_string(), None)],
        Ok(info) => match verify(&info, &b.manifest) {
            Ok(()) => vec![],
            Err(vs) => vs
                .into_iter()
                .map(|v| {
                    let hint =
                        matches!(v, bpmnkit_wasm_contract::Violation::HttpWithoutAllowList(_))
                            .then_some(
                            "add the host to [network] allow in worker.toml, or drop the http call",
                        );
                    d(v.to_string(), hint)
                })
                .collect(),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const ERR: &str = r#"{"reason":"compiler-message","message":{"level":"error","message":"cannot find value `x` in this scope","code":{"code":"E0425"},"spans":[{"file_name":"src/lib.rs","line_start":4,"column_start":9,"is_primary":true,"suggested_replacement":null}],"children":[{"level":"help","message":"a local variable with a similar name exists: `y`","spans":[]}]}}"#;
    const DEP_WARN: &str = r#"{"reason":"compiler-message","message":{"level":"warning","message":"unused","code":null,"spans":[{"file_name":"../sdk/src/lib.rs","line_start":1,"column_start":1,"is_primary":true}],"children":[]}}"#;
    const ABORT: &str = r#"{"reason":"compiler-message","message":{"level":"error","message":"aborting due to 1 previous error","code":null,"spans":[],"children":[]}}"#;

    #[test]
    fn maps_rustc_errors_with_help_as_suggestion() {
        let d = parse_messages(&format!(
            "{ERR}\nnot json\n{DEP_WARN}\n{ABORT}\n{{\"reason\":\"build-finished\"}}"
        ));
        assert_eq!(d.len(), 1);
        assert_eq!(
            (d[0].file.as_str(), d[0].line, d[0].col, d[0].code.as_str()),
            ("src/lib.rs", 4, 9, "E0425")
        );
        assert!(d[0].suggestion.as_deref().unwrap().contains("similar name"));
    }
}
