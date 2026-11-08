//! `gate/` cases: `assertDeployable` on a parsed input (conformance/README.md, "Gate").

use crate::tooling;
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_compat::zeebe::{assert_deployable, AssertOptions};
use bpmnkit_compat::FindingData;
use serde_json::{json, Value as Json};
use std::path::Path;

/// Ids of every `gate/` run.
pub fn case_ids(dir: &Path) -> Vec<String> {
    tooling::runs(dir, "gate")
        .into_iter()
        .map(|r| r.id)
        .collect()
}

fn ids(findings: &[FindingData]) -> Vec<String> {
    findings
        .iter()
        .map(|f| format!("{} {}", f.id, f.element_ids.join(",")))
        .collect()
}

/// What the recorder writes for one run: `<run>.json`, and `<run>.bpmn` when placeholders
/// were filled.
pub fn run_case(input: &str, options: &Json) -> Result<(Json, Option<String>), String> {
    reset_id_counter();
    let defs = parse_bpmn(input).map_err(|e| e.to_string())?;
    let opts = AssertOptions {
        camunda_version: options
            .get("camundaVersion")
            .and_then(Json::as_str)
            .map(str::to_string),
        placeholders: options
            .get("placeholders")
            .and_then(Json::as_bool)
            .unwrap_or(false),
        ..AssertOptions::default()
    };
    Ok(match assert_deployable(&defs, &opts) {
        Ok(r) => {
            let bpmn = (!r.placeholders.is_empty()).then(|| serialize_bpmn(&r.definitions));
            let placeholders = serde_json::to_value(&r.placeholders).map_err(|e| e.to_string())?;
            (
                json!({ "placeholders": placeholders, "warnings": ids(&r.warnings) }),
                bpmn,
            )
        }
        Err(e) => (
            json!({
                "error": e.message(),
                "camundaVersion": e.camunda_version,
                "findings": ids(&e.findings),
            }),
            None,
        ),
    })
}

/// Checks one run; `Err` says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let run = tooling::runs(dir, "gate")
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let (actual, bpmn) = run_case(&tooling::read(&run.input)?, &run.options)?;
    tooling::json_diff(&actual, &tooling::read_json(&run.expected)?)?;
    let bpmn_path = run.expected.with_extension("bpmn");
    let want = bpmn_path
        .exists()
        .then(|| tooling::read(&bpmn_path))
        .transpose()?;
    if bpmn != want {
        return Err(format!("{}: filled BPMN differs", bpmn_path.display()));
    }
    Ok(())
}
