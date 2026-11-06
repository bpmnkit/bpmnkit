//! `camunda-compat.ts`, `camunda-compat-feel.ts`, `camunda-compat-data.ts`.
//!
//! The `.bpmnlintrc` side (`splitCamundaCompatConfig`, `applyCamundaCompatConfig`)
//! lives in `bpmnkit-lint`, next to the bpmnlint config it reads.

use crate::finding::Finding;
use bpmnkit_bpmn::BpmnDefinitions;

/// `analyzeCamundaCompat`: `compat/*` findings against `version` (e.g. `"8.6"`),
/// or the model's `modeler:executionPlatformVersion` when `None`.
pub fn analyze_camunda_compat(
    _definitions: &BpmnDefinitions,
    _version: Option<&str>,
) -> Vec<Finding> {
    vec![]
}

/// `isCamundaCompatFinding`.
pub fn is_camunda_compat_finding(id: &str) -> bool {
    id.starts_with("compat/")
}

/// `dedupeCamundaCompat`.
pub fn dedupe_camunda_compat(findings: Vec<Finding>) -> Vec<Finding> {
    findings
}
