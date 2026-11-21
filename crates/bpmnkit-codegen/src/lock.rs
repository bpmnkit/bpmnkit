//! `bpmnkit.lock.json`: IR hash, generator version and the rule per job, so `worker gen --check`
//! can run in CI. The same for every target.

use bpmnkit_jobspec::{ir_hash, WorkerProject};
use serde_json::{json, Map, Value};

use crate::GenFile;

pub const LOCK_FILE: &str = "bpmnkit.lock.json";

pub fn lock_file(project: &WorkerProject, target: &str) -> GenFile {
    let mut jobs = Map::new();
    for (ty, j) in &project.jobs {
        jobs.insert(
            ty.clone(),
            match &j.classified {
                Some(c) => json!({"decision": c.decision.label(), "rule": c.rule}),
                None => Value::Null,
            },
        );
    }
    let v = json!({
        "generator": format!("bpmnkit {}", env!("CARGO_PKG_VERSION")),
        "target": target,
        "irHash": ir_hash(project),
        "jobs": Value::Object(jobs),
    });
    GenFile::generated(LOCK_FILE, crate::pretty_json(&v))
}
