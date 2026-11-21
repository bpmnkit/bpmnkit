//! `bpmnkit worker …` (plan §9). `classify` (P1), `gen` (P4: Java); `run` arrives later.

mod generate;

use std::path::{Path, PathBuf};

use bpmnkit_jobspec::{analyze, ir_hash, ApiIndex, Catalog, Inputs, WorkerConfig};
use clap::{Subcommand, ValueEnum};

#[derive(Subcommand)]
pub enum WorkerCmd {
    /// Decide per job type: keep a connector, bind one, bind the REST connector, or write a worker
    Classify {
        /// BPMN files or directories (searched for *.bpmn)
        #[arg(required = true)]
        bpmn: Vec<PathBuf>,
        /// connector-gen API index JSON (an ApiService or an array of them); repeatable
        #[arg(long)]
        openapi: Vec<PathBuf>,
        /// Overrides and declared load per job type [default: ./bpmnkit.worker.toml if present]
        #[arg(long)]
        config: Option<PathBuf>,
        /// Project name (part of the IR hash)
        #[arg(long, default_value = "worker")]
        name: String,
        #[arg(long, value_enum, default_value_t = Format::Text)]
        format: Format,
    },
    /// Generate a job worker project from the job types classified as worker
    Gen(generate::GenArgs),
}

#[derive(Clone, Copy, ValueEnum)]
pub enum Format {
    Text,
    Json,
}

pub fn run(cmd: WorkerCmd) -> i32 {
    match cmd {
        WorkerCmd::Classify {
            bpmn,
            openapi,
            config,
            name,
            format,
        } => match classify(&bpmn, &openapi, config.as_deref(), &name, format) {
            Ok(out) => {
                print!("{out}");
                0
            }
            Err(e) => crate::fail(&e),
        },
        WorkerCmd::Gen(args) => match generate::run(&args) {
            Ok(code) => code,
            Err(e) => crate::fail(&e),
        },
    }
}

fn collect(path: &Path, into: &mut Vec<PathBuf>) -> Result<(), String> {
    if path.is_dir() {
        let entries = std::fs::read_dir(path).map_err(|e| format!("{}: {e}", path.display()))?;
        for entry in entries.flatten() {
            let p = entry.path();
            let hidden = p
                .file_name()
                .is_some_and(|n| n.to_string_lossy().starts_with('.'));
            if hidden || p.file_name().is_some_and(|n| n == "node_modules") {
                continue;
            }
            if p.is_dir() || p.extension().is_some_and(|e| e == "bpmn") {
                collect(&p, into)?;
            }
        }
        Ok(())
    } else if path.is_file() {
        into.push(path.to_path_buf());
        Ok(())
    } else {
        Err(format!("no such file or directory: {}", path.display()))
    }
}

fn read(path: &Path) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))
}

/// Read, bind and classify the inputs shared by `classify` and `gen`; also returns the file count.
fn load(
    bpmn: &[PathBuf],
    openapi: &[PathBuf],
    config: Option<&Path>,
    name: &str,
) -> Result<(bpmnkit_jobspec::Extracted, usize), String> {
    let mut files = Vec::new();
    for p in bpmn {
        collect(p, &mut files)?;
    }
    files.sort();
    files.dedup();
    if files.is_empty() {
        return Err("no .bpmn files found".into());
    }
    let definitions = files
        .iter()
        .map(|f| {
            bpmnkit_bpmn::parse_bpmn(&read(f)?)
                .map_err(|e| format!("cannot parse {}: {e}", f.display()))
        })
        .collect::<Result<Vec<_>, _>>()?;

    let mut apis = ApiIndex::default();
    for f in openapi {
        apis.add_json(&read(f)?)
            .map_err(|e| format!("{}: not a connector-gen API index: {e}", f.display()))?;
    }
    let default_config = Path::new("bpmnkit.worker.toml");
    let config = match config {
        Some(p) => Some(p),
        None => default_config.is_file().then_some(default_config),
    };
    let config = match config {
        Some(p) => {
            WorkerConfig::from_toml(&read(p)?).map_err(|e| format!("{}: {e}", p.display()))?
        }
        None => WorkerConfig::default(),
    };
    let catalog = Catalog::builtin();
    let out = analyze(Inputs {
        name,
        definitions: &definitions,
        apis: &apis,
        catalog: &catalog,
        config: &config,
    });
    Ok((out, files.len()))
}

fn classify(
    bpmn: &[PathBuf],
    openapi: &[PathBuf],
    config: Option<&Path>,
    name: &str,
    format: Format,
) -> Result<String, String> {
    let (out, file_count) = load(bpmn, openapi, config, name)?;
    let hash = ir_hash(&out.project);
    Ok(match format {
        Format::Json => {
            let value = serde_json::json!({
                "irHash": hash,
                "project": out.project,
                "dynamicJobTypes": out.dynamic,
            });
            format!("{}\n", bpmnkit_jobspec::canonical_json(&value))
        }
        Format::Text => {
            let mut s = String::new();
            for job in out.project.jobs.values() {
                let c = job.classified.as_ref().expect("classified");
                s.push_str(&format!(
                    "{}\t{}\t{:?}\t{}\n",
                    job.job_type,
                    c.decision.label(),
                    c.rule,
                    c.reason
                ));
            }
            for el in &out.dynamic {
                s.push_str(&format!("# {el}: FEEL job type, resolved at runtime\n"));
            }
            s.push_str(&format!(
                "# {} job type(s) from {} file(s), sha256:{hash}\n",
                out.project.jobs.len(),
                file_count
            ));
            s
        }
    })
}
