//! Replays `dmn/<case>/` against `bpmnkit-dmn`. A case either parses, then `parse_dmn(input.dmn)`
//! must equal `expected/model.json` and `serialize_dmn` of it must equal `expected/roundtrip.dmn`;
//! or it has `expected/error.txt` and `parse_dmn` must fail with exactly that message.

use crate::bpmn::{first_diff_line, json_diff};
use bpmnkit_dmn::{parse_dmn, serialize_dmn};
use serde_json::Value as Json;
use std::path::Path;

/// Runs one case (`dmn/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    let read = |p: &str| {
        std::fs::read_to_string(case.join(p))
            .map_err(|e| format!("{}: {e}", case.join(p).display()))
    };
    let input = read("input.dmn")?;

    if case.join("expected/error.txt").exists() {
        let expected = read("expected/error.txt")?;
        let expected = expected.strip_suffix('\n').unwrap_or(&expected);
        return match parse_dmn(&input) {
            Ok(_) => Err(format!("parsed, expected error {expected:?}")),
            Err(e) if e.0 == expected => Ok(()),
            Err(e) => Err(format!("error {:?} != {expected:?}", e.0)),
        };
    }

    let expected_model: Json =
        serde_json::from_str(&read("expected/model.json")?).map_err(|e| e.to_string())?;
    let expected_xml = read("expected/roundtrip.dmn")?;

    let defs = parse_dmn(&input).map_err(|e| format!("parse: {e}"))?;
    let actual = serde_json::to_value(&defs).map_err(|e| e.to_string())?;
    if let Some(d) = json_diff("$", &actual, &expected_model) {
        return Err(format!("model.json {d}"));
    }
    let xml = serialize_dmn(&defs);
    if xml != expected_xml {
        return Err(format!(
            "roundtrip.dmn {}",
            first_diff_line(&xml, &expected_xml)
        ));
    }
    Ok(())
}

/// Like [`check_case`] but a panic counts as a failure.
pub fn run_case(dir: &Path, id: &str) -> bool {
    std::panic::catch_unwind(|| check_case(dir, id))
        .map(|r| r.is_ok())
        .unwrap_or(false)
}

#[derive(serde::Deserialize)]
struct EvalInput {
    decision: String,
    #[serde(default)]
    context: std::collections::BTreeMap<String, crate::Value>,
}

#[derive(serde::Deserialize)]
struct Evaluated {
    decision: String,
    result: crate::Value,
}

#[derive(serde::Deserialize)]
#[serde(untagged)]
enum Outcome {
    Ok {
        result: crate::Value,
        evaluated: Vec<Evaluated>,
    },
    Err {
        error: String,
    },
}

/// Ids of evaluation cases: `dmn/<case>/evaluate` for each case with an `evaluate.json`.
pub fn eval_case_ids(dir: &Path) -> Vec<String> {
    crate::load_dmn_case_ids(dir)
        .into_iter()
        .filter(|id| dir.join(id).join("evaluate.json").exists())
        .map(|id| format!("{id}/evaluate"))
        .collect()
}

/// Replays `dmn/<case>/evaluate.json` through `evaluate_decision_graph` and compares each entry
/// with `expected/evaluate.json`: the result and the decisions evaluated, or the error message.
pub fn check_eval_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id.strip_suffix("/evaluate").unwrap_or(id));
    let read = |p: &str| {
        std::fs::read_to_string(case.join(p))
            .map_err(|e| format!("{}: {e}", case.join(p).display()))
    };
    let defs = parse_dmn(&read("input.dmn")?).map_err(|e| format!("parse: {}", e.0))?;
    let inputs: Vec<EvalInput> =
        serde_json::from_str(&read("evaluate.json")?).map_err(|e| e.to_string())?;
    let expected: Vec<Outcome> =
        serde_json::from_str(&read("expected/evaluate.json")?).map_err(|e| e.to_string())?;
    if inputs.len() != expected.len() {
        return Err(format!(
            "{} inputs, {} expected",
            inputs.len(),
            expected.len()
        ));
    }
    for (i, (input, want)) in inputs.iter().zip(&expected).enumerate() {
        let mut ctx = bpmnkit_feel::Context::new();
        for (k, v) in &input.context {
            ctx.insert(
                k.clone(),
                crate::feel::to_feel(v).unwrap_or(bpmnkit_feel::Value::Null),
            );
        }
        let got = bpmnkit_dmn::evaluate_decision_graph(&defs, &input.decision, &ctx);
        let at = format!("[{i}] {}", input.decision);
        match (got, want) {
            (Ok(g), Outcome::Ok { result, evaluated }) => {
                let actual = crate::feel::from_feel(&g.result);
                if !actual.canonical_eq(result) {
                    return Err(format!("{at}: result {actual:?} != {result:?}"));
                }
                let ids: Vec<&str> = g
                    .evaluated_decisions
                    .iter()
                    .map(|d| d.decision_id.as_str())
                    .collect();
                let want_ids: Vec<&str> = evaluated.iter().map(|d| d.decision.as_str()).collect();
                if ids != want_ids {
                    return Err(format!("{at}: evaluated {ids:?} != {want_ids:?}"));
                }
                for (d, w) in g.evaluated_decisions.iter().zip(evaluated) {
                    let v = crate::feel::from_feel(&d.result);
                    if !v.canonical_eq(&w.result) {
                        return Err(format!("{at}: {} {v:?} != {:?}", w.decision, w.result));
                    }
                }
            }
            (Err(e), Outcome::Err { error }) if e.to_string() == *error => {}
            (Err(e), _) => return Err(format!("{at}: error {e}")),
            (Ok(g), Outcome::Err { error }) => {
                return Err(format!("{at}: got {:?}, expected error {error}", g.result))
            }
        }
    }
    Ok(())
}

/// Like [`check_eval_case`] but a panic counts as a failure.
pub fn run_eval_case(dir: &Path, id: &str) -> bool {
    std::panic::catch_unwind(|| check_eval_case(dir, id))
        .map(|r| r.is_ok())
        .unwrap_or(false)
}
