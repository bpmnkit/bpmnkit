//! An appliance: BPMN files plus the workers that serve their service tasks.

use std::collections::BTreeSet;

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_jobspec::extract;
use serde::{Deserialize, Serialize};

use crate::manifest::ValidManifest;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bundle {
    /// BPMN XML documents.
    pub bpmn: Vec<String>,
    pub workers: Vec<ValidManifest>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct BundleReport {
    /// Job types in the BPMN that no worker serves.
    pub missing: Vec<String>,
    /// Worker job types no BPMN uses.
    pub unused: Vec<String>,
    /// Job types served by more than one worker.
    pub duplicated: Vec<String>,
    /// `processId#elementId` whose job type is a FEEL expression; cannot be matched statically.
    pub dynamic: Vec<String>,
}
impl BundleReport {
    /// Dynamic types and unused workers are warnings; missing and duplicated block a deploy.
    pub fn is_ok(&self) -> bool {
        self.missing.is_empty() && self.duplicated.is_empty()
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BundleError {
    pub index: usize,
    pub message: String,
}
impl std::fmt::Display for BundleError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "bpmn[{}]: {}", self.index, self.message)
    }
}
impl std::error::Error for BundleError {}

pub fn check_bundle(b: &Bundle) -> Result<BundleReport, BundleError> {
    let mut defs = Vec::new();
    for (index, xml) in b.bpmn.iter().enumerate() {
        defs.push(parse_bpmn(xml).map_err(|e| BundleError {
            index,
            message: e.to_string(),
        })?);
    }
    let ex = extract("bundle", &defs);
    let used: BTreeSet<&str> = ex.project.jobs.keys().map(String::as_str).collect();
    let mut served = BTreeSet::new();
    let mut duplicated = BTreeSet::new();
    for t in b.workers.iter().flat_map(|w| &w.worker.job_types) {
        if !served.insert(t.as_str()) {
            duplicated.insert(t.clone());
        }
    }
    Ok(BundleReport {
        missing: used.difference(&served).map(|s| (*s).to_owned()).collect(),
        unused: served.difference(&used).map(|s| (*s).to_owned()).collect(),
        duplicated: duplicated.into_iter().collect(),
        dynamic: ex.dynamic,
    })
}
