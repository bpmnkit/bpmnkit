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
