//! `bpmnkit-wasm-host run --dir <dir>… [--secrets-dir <dir>]`: serves every worker found until
//! SIGINT/SIGTERM, then drains. A `--dir` is a worker (`worker.toml` + `worker.wasm`) or a
//! directory of workers.

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Arc;

use bpmnkit_wasm_host::config::client_config;
use bpmnkit_wasm_host::{
    load, Engine, EngineOptions, EnvSecrets, FileSecrets, SecretSource, WasmHandler,
};
use bpmnkit_worker::{RestClient, Runtime, WorkerConfig};

const USAGE: &str = "usage: bpmnkit-wasm-host run --dir <worker-dir>... [--secrets-dir <dir>]";

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match run(&args) {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("bpmnkit-wasm-host: {e}");
            ExitCode::FAILURE
        }
    }
}

struct Args {
    dirs: Vec<PathBuf>,
    secrets_dir: Option<PathBuf>,
}

fn parse(args: &[String]) -> Result<Args, String> {
    let mut it = args.iter().peekable();
    if it.next().map(String::as_str) != Some("run") {
        return Err(USAGE.into());
    }
    let mut a = Args {
        dirs: Vec::new(),
        secrets_dir: None,
    };
    while let Some(arg) = it.next() {
        match arg.as_str() {
            "--dir" => {
                while let Some(d) = it.next_if(|s| !s.starts_with("--")) {
                    a.dirs.push(d.into());
                }
            }
            "--secrets-dir" => a.secrets_dir = Some(it.next().ok_or(USAGE)?.into()),
            "-h" | "--help" => return Err(USAGE.into()),
            other => return Err(format!("unknown argument `{other}`\n{USAGE}")),
        }
    }
    if a.dirs.is_empty() {
        return Err(USAGE.into());
    }
    Ok(a)
}

/// `dir` itself when it holds a manifest, else its subdirectories that do.
fn worker_dirs(dir: &Path) -> Result<Vec<PathBuf>, String> {
    if dir.join("worker.toml").is_file() {
        return Ok(vec![dir.into()]);
    }
    let mut v: Vec<PathBuf> = std::fs::read_dir(dir)
        .map_err(|e| format!("{}: {e}", dir.display()))?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.join("worker.toml").is_file())
        .collect();
    v.sort();
    if v.is_empty() {
        return Err(format!("{}: no worker.toml found", dir.display()));
    }
    Ok(v)
}

fn run(args: &[String]) -> Result<(), String> {
    let a = parse(args)?;
    tracing_init();
    let engine = Engine::new(EngineOptions::default()).map_err(|e| format!("{e:#}"))?;
    let secrets: Arc<dyn SecretSource> = match a.secrets_dir {
        Some(d) => Arc::new(FileSecrets(d)),
        None => Arc::new(EnvSecrets),
    };
    let mut handlers = Vec::new();
    for d in &a.dirs {
        for w in worker_dirs(d)? {
            let loaded = load(&engine, &w).map_err(|e| e.to_string())?;
            eprintln!(
                "loaded {} {} ({:?}, {})",
                loaded.manifest.worker.name,
                loaded.manifest.worker.version,
                loaded.world,
                loaded.digest.as_hex()
            );
            handlers.push(WasmHandler::new(loaded, Arc::clone(&secrets)));
        }
    }
    let cfg = client_config(|k| std::env::var(k).ok().filter(|v| !v.is_empty()))
        .map_err(|e| e.to_string())?;
    let client = RestClient::new(cfg).map_err(|e| e.to_string())?;
    let tenants = client.tenant_ids().to_vec();
    let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;
    rt.block_on(async move {
        let mut runtime = Runtime::new(Arc::new(client)).default_tenant_ids(tenants);
        for h in handlers {
            let m = &h.loaded().manifest;
            let name = format!("bpmnkit-wasm-host:{}", m.worker.name);
            let n = m.limits.max_concurrent as usize;
            for jt in m.worker.job_types.clone() {
                let cfg = WorkerConfig::new(jt).worker_name(&name).max_jobs_active(n);
                runtime = runtime.register(cfg, h.clone());
            }
        }
        for r in runtime.run().await {
            if !r.abandoned.is_empty() {
                eprintln!(
                    "{}: {} job(s) abandoned at shutdown",
                    r.job_type,
                    r.abandoned.len()
                );
            }
        }
    });
    Ok(())
}

fn tracing_init() {
    // No subscriber dependency: guest `log` lines and host warnings go through `tracing`, which
    // an embedding binary can route; the CLI keeps stderr for its own messages.
}

#[cfg(test)]
mod tests {
    use super::*;

    fn s(v: &[&str]) -> Vec<String> {
        v.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn parses_dirs_and_secrets() {
        let a = parse(&s(&[
            "run",
            "--dir",
            "a",
            "b",
            "--secrets-dir",
            "s",
            "--dir",
            "c",
        ]))
        .unwrap();
        assert_eq!(a.dirs, [PathBuf::from("a"), "b".into(), "c".into()]);
        assert_eq!(a.secrets_dir, Some("s".into()));
        assert!(parse(&s(&["run"])).is_err());
        assert!(parse(&s(&["serve", "--dir", "a"])).is_err());
        assert!(parse(&s(&["run", "--dir", "a", "--bogus"])).is_err());
    }
}
