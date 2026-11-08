//! `lint/` cases (conformance/README.md, "Tooling").

use crate::tooling;
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_lint::{
    lint_diagram, lint_dmn, lint_form, parse_bpmnlint_config, resolve_bpmnlint_config, LintOptions,
};
use serde_json::{json, Value as Json};
use std::path::Path;

/// Ids of every `lint/` run.
pub fn case_ids(dir: &Path) -> Vec<String> {
    tooling::runs(dir, "lint")
        .into_iter()
        .map(|r| r.id)
        .collect()
}

/// A run's raw `bpmnlintrc`, with its key order: `serde_json::Value` sorts keys, and rule
/// order decides the order native rules run and unsupported rules are listed in.
fn raw_bpmnlintrc(case_json: &Path, run: &str) -> Result<Option<String>, String> {
    let Ok(text) = std::fs::read_to_string(case_json) else {
        return Ok(None);
    };
    let spec: bpmnkit_form::Json =
        serde_json::from_str(&text).map_err(|e| format!("{}: {e}", case_json.display()))?;
    let rc = match &spec {
        bpmnkit_form::Json::Obj(o) => match o.get("runs") {
            Some(bpmnkit_form::Json::Obj(runs)) => match runs.get(run) {
                Some(bpmnkit_form::Json::Obj(opts)) => opts.get("bpmnlintrc"),
                _ => None,
            },
            _ => None,
        },
        _ => None,
    };
    rc.map(|v| serde_json::to_string(v).map_err(|e| e.to_string()))
        .transpose()
}

/// What the recorder writes for a `.bpmn` run, or `{"error"}` when TS throws.
pub fn run_bpmn(input: &str, opts: &Json, bpmnlintrc: Option<&str>) -> Json {
    run_bpmn_unsafe(input, opts, bpmnlintrc).unwrap_or_else(|e| json!({ "error": e }))
}

fn run_bpmn_unsafe(input: &str, opts: &Json, bpmnlintrc: Option<&str>) -> Result<Json, String> {
    reset_id_counter();
    let defs = parse_bpmn(input).map_err(|e| e.to_string())?;
    let mut options = LintOptions {
        optimize: crate::optimize::options(opts)?,
        force_engine_rules: opts["forceEngineRules"].as_bool() == Some(true),
        bpmnlint: None,
        bpmnlint_delegated: opts["bpmnlintDelegated"].as_bool() == Some(true),
    };
    if let Some(rc) = bpmnlintrc {
        let config = parse_bpmnlint_config(rc).map_err(|e| e.to_string())?;
        options.bpmnlint = Some(resolve_bpmnlint_config(&config).map_err(|e| e.to_string())?);
    }
    reset_id_counter();
    serde_json::to_value(lint_diagram(&defs, options)).map_err(|e| e.to_string())
}

/// Checks one run; `Err` says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let run = tooling::runs(dir, "lint")
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let input = tooling::read(&run.input)?;
    let expected = tooling::read_json(&run.expected)?;
    let ext = run.input.extension().and_then(|e| e.to_str()).unwrap_or("");
    let actual = match ext {
        "dmn" => json!({ "findings": lint_dmn(&input) }),
        "form" => json!({ "findings": lint_form(&input) }),
        _ => {
            let case_json = run
                .expected
                .parent()
                .and_then(Path::parent)
                .map(|c| c.join("case.json"));
            let run_name = id.rsplit('/').next().unwrap_or("default");
            let rc = match case_json {
                Some(p) => raw_bpmnlintrc(&p, run_name)?,
                None => None,
            };
            run_bpmn(&input, &run.options, rc.as_deref())
        }
    };
    tooling::json_diff(&actual, &expected)
}
