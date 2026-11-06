//! `lint/` cases (conformance/README.md, "Tooling").

use crate::tooling;
use std::path::Path;

/// Ids of every `lint/` run.
pub fn case_ids(dir: &Path) -> Vec<String> {
    tooling::runs(dir, "lint")
        .into_iter()
        .map(|r| r.id)
        .collect()
}

/// Checks one run; `Err` says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let _run = tooling::runs(dir, "lint")
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    Err("not ported yet".into())
}
