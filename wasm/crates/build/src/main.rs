//! `bpmnkit-wasm`: init, check, build, test, inspect and run Wasm job workers.

use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};

use bpmnkit_wasm_build::{run_pipeline_until, BuildInput, LocalExecutor, Stage, Toolchain};
use bpmnkit_wasm_contract::{inspect, validate, BuildReport, Manifest};

const USAGE: &str = "\
bpmnkit-wasm <command> [options]

  init <name> [--dir D]       scaffold worker.toml, src/lib.rs, samples.json
  check [DIR]                 render + cargo check (fast fix loop)
  build [DIR] [--out D]       full pipeline, writes worker.wasm, worker.toml, metadata.json
  test [DIR]                  full pipeline, prints the sample results
  inspect <wasm>              imports and exports of a component
  run [ARGS…]                 exec bpmnkit-wasm-host run ARGS…

options: --format text|json   --sdk PATH (env BPMNKIT_WASM_SDK)   --target-dir PATH (env BPMNKIT_WASM_TARGET_DIR)";

const TEMPLATE: &str = r#"use bpmnkit_wasm_sdk::prelude::*;

struct Worker1;

impl Worker for Worker1 {
    fn handle(job: Job) -> Outcome {
        let vars: Value = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        let name = vars["name"].as_str().unwrap_or("world");
        Outcome::complete(json!({ "greeting": format!("hello {name}") }))
    }
}

bpmnkit_wasm_sdk::export!(Worker1);
"#;

#[derive(Default)]
struct Opts {
    pos: Vec<String>,
    json: bool,
    dir: Option<PathBuf>,
    out: Option<PathBuf>,
    sdk: Option<PathBuf>,
    target_dir: Option<PathBuf>,
}

fn parse(args: &[String]) -> Result<Opts, String> {
    let mut o = Opts::default();
    let mut it = args.iter();
    while let Some(a) = it.next() {
        let mut val = |f: &str| it.next().cloned().ok_or(format!("{f} needs a value"));
        match a.as_str() {
            "--format" => match val("--format")?.as_str() {
                "json" => o.json = true,
                "text" => o.json = false,
                f => return Err(format!("unknown format `{f}` (text or json)")),
            },
            "--dir" => o.dir = Some(val("--dir")?.into()),
            "--out" => o.out = Some(val("--out")?.into()),
            "--sdk" => o.sdk = Some(val("--sdk")?.into()),
            "--target-dir" => o.target_dir = Some(val("--target-dir")?.into()),
            f if f.starts_with("--") => return Err(format!("unknown option `{f}`")),
            _ => o.pos.push(a.clone()),
        }
    }
    Ok(o)
}

fn toolchain(o: &Opts) -> Result<Toolchain, String> {
    let sdk = o
        .sdk
        .clone()
        .or_else(|| std::env::var_os("BPMNKIT_WASM_SDK").map(Into::into))
        .or_else(Toolchain::in_repo_sdk)
        .ok_or("cannot find the SDK crate: pass --sdk or set BPMNKIT_WASM_SDK")?;
    let mut tc =
        Toolchain::local(fs::canonicalize(&sdk).map_err(|e| format!("{}: {e}", sdk.display()))?);
    tc.target_dir = o
        .target_dir
        .clone()
        .or_else(|| std::env::var_os("BPMNKIT_WASM_TARGET_DIR").map(Into::into))
        .or_else(|| {
            let base = std::env::var_os("XDG_CACHE_HOME")
                .map(PathBuf::from)
                .or_else(|| std::env::var_os("HOME").map(|h| Path::new(&h).join(".cache")))?;
            Some(base.join("bpmnkit-wasm/target"))
        });
    Ok(tc)
}

fn print_report(r: &BuildReport, json: bool) {
    if json {
        println!("{}", serde_json::to_string_pretty(r).expect("serializable"));
        return;
    }
    for d in &r.diagnostics {
        println!("{}:{}:{}: {}: {}", d.file, d.line, d.col, d.code, d.message);
        if let Some(s) = &d.suggestion {
            println!("    hint: {s}");
        }
    }
    for t in &r.tests {
        let m = t.message.as_deref().unwrap_or("");
        println!(
            "{} {} ({} ms) {m}",
            if t.passed { "ok  " } else { "FAIL" },
            t.name,
            t.duration_ms
        );
    }
    let times: Vec<_> = r
        .timings
        .iter()
        .map(|t| format!("{} {} ms", t.stage, t.ms))
        .collect();
    println!(
        "{} — {}",
        if r.ok { "ok" } else { "failed" },
        times.join(", ")
    );
}

fn pipeline(
    o: &Opts,
    last: Stage,
) -> Result<(BuildReport, Option<bpmnkit_wasm_build::Artifact>), String> {
    let dir = PathBuf::from(o.pos.first().map_or(".", String::as_str));
    let input = BuildInput::from_dir(&dir)?;
    let p = run_pipeline_until(&input, &toolchain(o)?, &LocalExecutor, last);
    Ok((p.report, p.artifact))
}

fn init(o: &Opts) -> Result<(), String> {
    let name = o.pos.first().ok_or("init needs a worker name")?;
    let manifest = Manifest {
        worker: bpmnkit_wasm_contract::WorkerSection {
            name: name.clone(),
            version: "0.1.0".into(),
            job_types: vec![name.clone()],
        },
        limits: Default::default(),
        network: Default::default(),
        secrets: Default::default(),
    };
    let valid = validate(manifest).map_err(|es| {
        es.iter()
            .map(ToString::to_string)
            .collect::<Vec<_>>()
            .join("; ")
    })?;
    let dir = o.dir.clone().unwrap_or_else(|| PathBuf::from(name));
    if dir.join("worker.toml").exists() {
        return Err(format!("{} already has a worker.toml", dir.display()));
    }
    fs::create_dir_all(dir.join("src")).map_err(|e| e.to_string())?;
    let samples = format!(
        "[{{\"name\":\"greets\",\"job_type\":\"{name}\",\"variables\":{{\"name\":\"Ada\"}},\"expect\":\"complete\"}}]\n"
    );
    for (p, c) in [
        ("worker.toml", valid.to_toml()),
        ("src/lib.rs", TEMPLATE.to_owned()),
        ("samples.json", samples),
    ] {
        fs::write(dir.join(p), c).map_err(|e| format!("{p}: {e}"))?;
    }
    println!("created {}", dir.display());
    Ok(())
}

fn inspect_cmd(o: &Opts) -> Result<(), String> {
    let p = o.pos.first().ok_or("inspect needs a .wasm path")?;
    let info =
        inspect(&fs::read(p).map_err(|e| format!("{p}: {e}"))?).map_err(|e| e.to_string())?;
    if o.json {
        println!(
            "{}",
            serde_json::json!({ "imports": info.imports, "exports": info.exports })
        );
    } else {
        for i in &info.imports {
            println!("import {i}");
        }
        for e in &info.exports {
            println!("export {e}");
        }
    }
    Ok(())
}

/// Host binary next to this one (same install), else on `PATH`.
fn run_host(args: &[String]) -> Result<u8, String> {
    let name = format!("bpmnkit-wasm-host{}", std::env::consts::EXE_SUFFIX);
    let sibling = std::env::current_exe()
        .ok()
        .and_then(|e| e.parent().map(|d| d.join(&name)))
        .filter(|p| p.is_file());
    let status = Command::new(sibling.unwrap_or_else(|| name.clone().into()))
        .arg("run")
        .args(args)
        .status()
        .map_err(|e| format!("cannot run bpmnkit-wasm-host: {e}"))?;
    Ok(status.code().map_or(1, |c| c as u8))
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let Some((cmd, rest)) = args.split_first() else {
        println!("{USAGE}");
        return ExitCode::from(2);
    };
    if matches!(cmd.as_str(), "-h" | "--help" | "help") {
        println!("{USAGE}");
        return ExitCode::SUCCESS;
    }
    if cmd == "run" {
        return run_host(rest).map_or_else(
            |e| {
                eprintln!("bpmnkit-wasm: {e}");
                ExitCode::FAILURE
            },
            ExitCode::from,
        );
    }
    let result = parse(rest).and_then(|o| match cmd.as_str() {
        "init" => init(&o).map(|()| true),
        "inspect" => inspect_cmd(&o).map(|()| true),
        "check" => pipeline(&o, Stage::Check).map(|(r, _)| {
            print_report(&r, o.json);
            r.ok
        }),
        "test" => pipeline(&o, Stage::Package).map(|(r, _)| {
            print_report(&r, o.json);
            r.ok
        }),
        "build" => pipeline(&o, Stage::Package).and_then(|(r, a)| {
            if let Some(a) = a {
                let dir = o.out.clone().unwrap_or_else(|| {
                    PathBuf::from(o.pos.first().map_or(".", String::as_str)).join("dist")
                });
                fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
                let w =
                    |f: &str, b: &[u8]| fs::write(dir.join(f), b).map_err(|e| format!("{f}: {e}"));
                w("worker.wasm", &a.component)?;
                w("worker.toml", a.metadata.manifest.to_toml().as_bytes())?;
                w(
                    "metadata.json",
                    serde_json::to_string_pretty(&a.metadata)
                        .expect("serializable")
                        .as_bytes(),
                )?;
            }
            print_report(&r, o.json);
            Ok(r.ok)
        }),
        c => Err(format!("unknown command `{c}`\n\n{USAGE}")),
    });
    match result {
        Ok(true) => ExitCode::SUCCESS,
        Ok(false) => ExitCode::FAILURE,
        Err(e) => {
            eprintln!("bpmnkit-wasm: {e}");
            ExitCode::from(2)
        }
    }
}
