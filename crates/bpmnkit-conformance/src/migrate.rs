//! `migrate/` cases (conformance/README.md, "Tooling"): `migrate/<case>/<run>` through
//! `convert_camunda7` / `convert_camunda8_to_7`, and the `juel/<n>` lines of `migrate/juel.jsonl`.

use crate::tooling;
use bpmnkit_bpmn::{ids::reset_id_counter, parse_bpmn, serialize_bpmn};
use bpmnkit_compat::camunda7::export::convert_camunda8_to_7;
use bpmnkit_compat::camunda7::juel::{translate_juel_to_feel, JuelToFeelOptions};
use bpmnkit_compat::camunda7::migrate::{convert_camunda7, Camunda7ConvertOptions};
use serde_json::{json, Value as Json};
use std::path::Path;

fn juel_lines(dir: &Path) -> Vec<Json> {
    let Ok(text) = std::fs::read_to_string(dir.join("migrate/juel.jsonl")) else {
        return vec![];
    };
    text.lines()
        .filter(|l| !l.trim().is_empty())
        .filter_map(|l| serde_json::from_str(l).ok())
        .collect()
}

/// Ids of every `migrate/` run, then of every `juel/<n>` line.
pub fn case_ids(dir: &Path) -> Vec<String> {
    let mut ids: Vec<String> = tooling::runs(dir, "migrate")
        .into_iter()
        .map(|r| r.id)
        .collect();
    ids.extend(
        juel_lines(dir)
            .iter()
            .filter_map(|l| l["id"].as_str().map(str::to_string)),
    );
    ids
}

/// Checks one run; `Err` says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    if id.starts_with("juel/") {
        return check_juel(dir, id);
    }
    let run = tooling::runs(dir, "migrate")
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let input = tooling::read(&run.input)?;
    reset_id_counter();
    let defs = parse_bpmn(&input).map_err(|e| format!("parse: {e}"))?;
    reset_id_counter();
    let expected = tooling::read_json(&run.expected)?;
    let (report, defs) = if run.options["direction"] == "8to7" {
        let r = convert_camunda8_to_7(&defs);
        (json!({ "findings": r.findings }), r.definitions)
    } else {
        let o = &run.options["options"];
        let options = Camunda7ConvertOptions {
            execution_platform_version: o["executionPlatformVersion"].as_str().map(str::to_string),
            validate: o["validate"].as_bool().unwrap_or(true),
            placeholders: o["placeholders"].as_bool().unwrap_or(false),
            camunda_version: o["camundaVersion"].as_str().map(str::to_string),
        };
        match convert_camunda7(&defs, &options) {
            Ok(r) => (
                serde_json::to_value(&r.report).map_err(|e| e.to_string())?,
                r.definitions,
            ),
            // The recorder writes a thrown error as {"error": message}.
            Err(e) => {
                return tooling::json_diff(&json!({ "error": e.to_string() }), &expected);
            }
        }
    };
    tooling::json_diff(&report, &expected["report"]).map_err(|d| format!("report {d}"))?;
    let xml = serialize_bpmn(&defs);
    // The recorder writes the converted model beside the report, as `<run>.bpmn`.
    let want = tooling::read(&run.expected.with_extension("bpmn"))?;
    let want = want.as_str();
    if xml != want {
        return Err(format!("xml {}", first_diff(&xml, want)));
    }
    Ok(())
}

fn first_diff(actual: &str, expected: &str) -> String {
    let n = actual
        .lines()
        .zip(expected.lines())
        .position(|(a, e)| a != e)
        .unwrap_or_else(|| actual.lines().count().min(expected.lines().count()));
    format!(
        "line {}: {:?} != {:?}",
        n + 1,
        actual.lines().nth(n).unwrap_or(""),
        expected.lines().nth(n).unwrap_or("")
    )
}

fn check_juel(dir: &Path, id: &str) -> Result<(), String> {
    let line = juel_lines(dir)
        .into_iter()
        .find(|l| l["id"] == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let juel = line["juel"].as_str().ok_or("no juel")?;
    let options = JuelToFeelOptions {
        multi_instance: line["options"]["multiInstance"].as_bool().unwrap_or(false),
    };
    let actual =
        serde_json::to_value(translate_juel_to_feel(juel, options)).map_err(|e| e.to_string())?;
    tooling::json_diff(&actual, &line["expected"]).map_err(|d| format!("{juel}: {d}"))
}
