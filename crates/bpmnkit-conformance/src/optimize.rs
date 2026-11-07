//! `optimize/` cases (conformance/README.md, "Tooling").

use crate::tooling;
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_lint::optimize::{optimize, OptimizeOptions, UserTaskForms};
use bpmnkit_lint::{Category, Finding};
use serde_json::{json, Map, Value as Json};
use std::path::Path;

/// Ids of every `optimize/` run.
pub fn case_ids(dir: &Path) -> Vec<String> {
    tooling::runs(dir, "optimize")
        .into_iter()
        .map(|r| r.id)
        .collect()
}

/// `OptimizeOptions` from a run's JSON options. Functions are never recorded:
/// `connectorRequirements` (template id → required keys) stands in for the resolver.
pub fn options(o: &Json) -> Result<OptimizeOptions, String> {
    let n = |k: &str| o.get(k).and_then(Json::as_u64).map(|v| v as usize);
    let categories = match o.get("categories") {
        Some(c) => Some(
            serde_json::from_value::<Vec<Category>>(c.clone())
                .map_err(|e| format!("categories: {e}"))?,
        ),
        None => None,
    };
    Ok(OptimizeOptions {
        feel_length_threshold: n("feelLengthThreshold"),
        feel_nesting_threshold: n("feelNestingThreshold"),
        feel_operator_threshold: n("feelOperatorThreshold"),
        feel_variable_threshold: n("feelVariableThreshold"),
        reuse_threshold: n("reuseThreshold"),
        categories,
        resolve_connector_requirements: o
            .get("connectorRequirements")
            .and_then(Json::as_object)
            .map(|table| -> bpmnkit_lint::optimize::ConnectorRequirements {
                let table = table.clone();
                Box::new(move |id: &str, bound: &[String]| {
                    table
                        .get(id)
                        .and_then(Json::as_array)
                        .into_iter()
                        .flatten()
                        .filter_map(Json::as_str)
                        .filter(|k| !bound.iter().any(|b| b == k))
                        .map(str::to_owned)
                        .collect()
                })
            }),
        camunda_version: o
            .get("camundaVersion")
            .and_then(Json::as_str)
            .map(str::to_owned),
        user_task_forms: match o.get("userTaskForms").and_then(Json::as_str) {
            Some("off") => UserTaskForms::Off,
            _ => UserTaskForms::Require,
        },
    })
}

/// A finding as the recorder writes it: its data plus `fixable`.
pub fn finding_json(f: &Finding) -> Json {
    let mut v = serde_json::to_value(&f.data).unwrap_or(Json::Null);
    if let Json::Object(m) = &mut v {
        m.insert("fixable".into(), Json::Bool(f.fixable()));
    }
    v
}

/// What the recorder writes for one run: `{findings, summary, fixes}`.
pub fn run_case(input: &str, opts: &Json) -> Result<Json, String> {
    let parse = || {
        reset_id_counter();
        parse_bpmn(input).map_err(|e| format!("parse: {e}"))
    };
    let defs = parse()?;
    let report = optimize(&defs, &options(opts)?);

    let mut fixes = vec![];
    for (index, f) in report.findings.iter().enumerate() {
        if !f.fixable() {
            continue;
        }
        let mut fresh = parse()?;
        let mut again = optimize(&fresh, &options(opts)?);
        let fix = again
            .findings
            .get_mut(index)
            .and_then(|f| f.apply_fix.take())
            .ok_or_else(|| format!("finding {index} not fixable on a fresh parse"))?;
        let result = fix(&mut fresh);
        let mut entry = Map::new();
        entry.insert("index".into(), json!(index));
        entry.insert("id".into(), json!(f.data.id));
        entry.insert("description".into(), json!(result.description));
        entry.insert("xml".into(), json!(serialize_bpmn(&fresh)));
        if let Some(g) = &result.generated {
            entry.insert("generated".into(), json!(serialize_bpmn(g)));
        }
        fixes.push(Json::Object(entry));
    }

    Ok(json!({
        "findings": report.findings.iter().map(finding_json).collect::<Vec<_>>(),
        "summary": serde_json::to_value(&report.summary).map_err(|e| e.to_string())?,
        "fixes": fixes,
    }))
}

/// Checks one run; `Err` says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let run = tooling::runs(dir, "optimize")
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let input = tooling::read(&run.input)?;
    let expected = tooling::read_json(&run.expected)?;
    let actual = run_case(&input, &run.options)?;
    // Name the first differing fix by its line, not as one giant string.
    if let (Some(a), Some(e)) = (actual["fixes"].as_array(), expected["fixes"].as_array()) {
        for (x, y) in a.iter().zip(e) {
            for key in ["xml", "generated"] {
                if let (Some(xs), Some(ys)) = (x[key].as_str(), y[key].as_str()) {
                    if xs != ys {
                        let line = xs
                            .lines()
                            .zip(ys.lines())
                            .position(|(l, r)| l != r)
                            .unwrap_or_else(|| xs.lines().count().min(ys.lines().count()));
                        return Err(format!(
                            "fix {} ({}) {key} differs at line {}:\n  actual:   {}\n  expected: {}",
                            y["index"],
                            y["id"],
                            line + 1,
                            xs.lines().nth(line).unwrap_or("<end>"),
                            ys.lines().nth(line).unwrap_or("<end>")
                        ));
                    }
                }
            }
        }
    }
    tooling::json_diff(&actual, &expected)
}
