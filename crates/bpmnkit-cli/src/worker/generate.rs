//! `bpmnkit worker gen` (plan §9): classify, then emit a worker project for the jobs the rules
//! sent to WORKER. Only this module knows about codegen; the IR comes from `super::load`.

use std::path::PathBuf;

use bpmnkit_codegen::java::JavaEmitter;
use bpmnkit_codegen::lock::lock_file;
use bpmnkit_codegen::rust::RustEmitter;
use bpmnkit_codegen::template::TemplateEmitter;
use bpmnkit_codegen::write::{check, write};
use bpmnkit_codegen::{select_jobs, Emitter, GenFile, Kind};
use bpmnkit_jobspec::ir_hash;
use clap::{Args, ValueEnum};

#[derive(Clone, Copy, ValueEnum)]
pub enum Lang {
    Java,
    Rust,
    /// REST binding: element templates + BPMN patches for the jobs classified REST (no code)
    Template,
}

#[derive(Args)]
pub struct GenArgs {
    /// BPMN files or directories (searched for *.bpmn)
    #[arg(required = true)]
    bpmn: Vec<PathBuf>,
    /// Target
    #[arg(long, value_enum)]
    lang: Lang,
    /// Java: use the Spring Boot starter (@JobWorker) instead of the plain client
    #[arg(long)]
    spring: bool,
    /// Java: open workers with streamEnabled(true) (gRPC job streaming next to polling)
    #[arg(long)]
    stream: bool,
    /// Java package [default: com.example.<name>]
    #[arg(long, default_value = "")]
    package: String,
    /// Output directory [default: ./<name>]
    #[arg(long)]
    out: Option<PathBuf>,
    /// Exit 1 when generated files differ from what would be written; writes nothing
    #[arg(long)]
    check: bool,
    /// Print the decision, rule and reason per job type and the files; writes nothing
    #[arg(long)]
    explain: bool,
    /// Generate for every job type, not only those classified as worker
    #[arg(long)]
    all: bool,
    /// connector-gen API index JSON (an ApiService or an array of them); repeatable
    #[arg(long)]
    openapi: Vec<PathBuf>,
    /// Overrides and declared load per job type [default: ./bpmnkit.worker.toml if present]
    #[arg(long)]
    config: Option<PathBuf>,
    /// Rust: depend on bpmnkit-worker by this path instead of crates.io (repo tests; the path ends up in Cargo.toml)
    #[arg(long)]
    worker_path: Option<String>,
    /// Type the fetched variables of a job type from a JSON Schema file: `<job-type>=<file>`; repeatable
    #[arg(long, value_name = "TYPE=FILE")]
    input_schema: Vec<String>,
    /// Type the returned variables of a job type from a JSON Schema file: `<job-type>=<file>`; repeatable
    #[arg(long, value_name = "TYPE=FILE")]
    output_schema: Vec<String>,
    /// Project name (part of the IR hash)
    #[arg(long, default_value = "worker")]
    name: String,
}

pub fn run(a: &GenArgs) -> Result<i32, String> {
    let (extracted, _) = super::load(&a.bpmn, &a.openapi, a.config.as_deref(), &a.name)?;
    let mut project = extracted.project;
    apply_schemas(&mut project, &a.input_schema, false)?;
    apply_schemas(&mut project, &a.output_schema, true)?;
    let (emitter, target): (Box<dyn Emitter>, &str) = match a.lang {
        Lang::Java => (
            Box::new(JavaEmitter {
                package: a.package.clone(),
                spring: a.spring,
                stream: a.stream,
                all: a.all,
            }),
            "java",
        ),
        Lang::Rust => (
            Box::new(RustEmitter {
                worker_path: a.worker_path.clone(),
                all: a.all,
            }),
            "rust",
        ),
        Lang::Template => (Box::new(TemplateEmitter { all: a.all }), "template"),
    };
    let emit = || -> Result<Vec<GenFile>, String> {
        let mut files = emitter.emit(&project).map_err(|e| e.to_string())?;
        // Templates are data the user edits and commits; only code targets carry a lock.
        if target != "template" {
            files.push(lock_file(&project, target));
            files.sort_by(|a, b| a.path.cmp(&b.path));
        }
        Ok(files)
    };
    let out = a.out.clone().unwrap_or_else(|| PathBuf::from(&a.name));

    if a.explain {
        explain(&project, a.all);
        let files = emit()?;
        println!("# files (sha256:{}):", ir_hash(&project));
        for f in &files {
            let kind = match f.kind {
                Kind::Generated => "overwritten",
                Kind::Once => "once",
            };
            println!("{}\t{kind}", f.path);
        }
        return Ok(0);
    }
    let files = emit()?;
    if a.check {
        let drift = check(&out, &files);
        for d in &drift {
            eprintln!("{d}");
        }
        if drift.is_empty() {
            println!("{}: up to date", out.display());
            return Ok(0);
        }
        eprintln!(
            "bpmnkit: {} file(s) drifted; run `bpmnkit worker gen` again",
            drift.len()
        );
        return Ok(1);
    }
    let done = write(&out, &files).map_err(|e| format!("{}: {e}", out.display()))?;
    println!(
        "{}: {} created, {} updated, {} unchanged, {} kept (yours)",
        out.display(),
        done.created.len(),
        done.updated.len(),
        done.unchanged.len(),
        done.kept.len()
    );
    Ok(0)
}

fn explain(project: &bpmnkit_jobspec::WorkerProject, all: bool) {
    let chosen: Vec<&str> = select_jobs(project, all)
        .iter()
        .map(|j| j.job_type.as_str())
        .collect();
    for job in project.jobs.values() {
        let c = job.classified.as_ref().expect("classified");
        let gen = if chosen.contains(&job.job_type.as_str()) {
            "generate"
        } else {
            "skip"
        };
        println!(
            "{}\t{}\t{:?}\t{}\t{gen}",
            job.job_type,
            c.decision.label(),
            c.rule,
            c.reason
        );
    }
}

/// `<job-type>=<file>` → the object schema on the job type; unknown job types are an error.
fn apply_schemas(
    project: &mut bpmnkit_jobspec::WorkerProject,
    specs: &[String],
    output: bool,
) -> Result<(), String> {
    for spec in specs {
        let (ty, file) = spec
            .split_once('=')
            .ok_or_else(|| format!("{spec}: expected <job-type>=<file>"))?;
        let text = std::fs::read_to_string(file).map_err(|e| format!("{file}: {e}"))?;
        let json: serde_json::Value =
            serde_json::from_str(&text).map_err(|e| format!("{file}: {e}"))?;
        let schema =
            bpmnkit_jobspec::schema::from_json(&json).map_err(|e| format!("{file}: {e}"))?;
        let job = project
            .jobs
            .get_mut(ty)
            .ok_or_else(|| format!("{spec}: no job type {ty} in the BPMN"))?;
        if output {
            job.output_schema = Some(schema);
        } else {
            job.input_schema = Some(schema);
        }
    }
    Ok(())
}
