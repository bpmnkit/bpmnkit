//! `compat/` cases (conformance/README.md, "Tooling").

use crate::tooling;
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_compat::compat::analyze_camunda_compat;
use bpmnkit_compat::Finding;
use serde_json::{json, Value as Json};
use std::path::Path;

/// Ids of every `compat/` run.
pub fn case_ids(dir: &Path) -> Vec<String> {
    tooling::runs(dir, "compat")
        .into_iter()
        .map(|r| r.id)
        .collect()
}

fn finding_json(f: &Finding) -> Json {
    let mut v = serde_json::to_value(&f.data).unwrap_or(Json::Null);
    if let Json::Object(m) = &mut v {
        m.insert("fixable".into(), Json::Bool(f.fixable()));
    }
    v
}

/// What the recorder writes for one run: `{"findings": analyzeCamundaCompat(defs, version)}`.
pub fn run_case(input: &str, options: &Json) -> Result<Json, String> {
    reset_id_counter();
    let defs = parse_bpmn(input).map_err(|e| format!("parse: {e}"))?;
    let version = options.get("version").and_then(Json::as_str);
    let findings: Vec<Json> = analyze_camunda_compat(&defs, version)
        .iter()
        .map(finding_json)
        .collect();
    Ok(json!({ "findings": findings }))
}

/// Checks one run; `Err` says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let run = tooling::runs(dir, "compat")
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let actual = run_case(&tooling::read(&run.input)?, &run.options)?;
    tooling::json_diff(&actual, &tooling::read_json(&run.expected)?)
}
