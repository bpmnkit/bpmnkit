//! Replays `diff/<case>/`: `diff_bpmn(parse(before.bpmn), parse(after.bpmn))` must equal
//! `expected/diff.json`, hashes included.

use crate::json_diff;
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_diff::diff_bpmn;
use serde_json::Value as Json;
use std::path::Path;

/// Runs one case (`diff/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    let read = |p: &str| {
        std::fs::read_to_string(case.join(p))
            .map_err(|e| format!("{}: {e}", case.join(p).display()))
    };
    let parse = |p: &str| parse_bpmn(&read(p)?).map_err(|e| format!("{p}: {e}"));
    let (before, after) = (parse("before.bpmn")?, parse("after.bpmn")?);
    let expected: Json = serde_json::from_str(&read("expected/diff.json")?)
        .map_err(|e| format!("expected/diff.json: {e}"))?;
    let actual = serde_json::to_value(diff_bpmn(&before, &after)).map_err(|e| e.to_string())?;
    match json_diff("$", &actual, &expected) {
        Some(d) => Err(format!("diff.json {d}")),
        None => Ok(()),
    }
}

/// Ids of diff cases (`diff/<case>`).
pub fn case_ids(dir: &Path) -> Vec<String> {
    crate::load_case_ids(dir, "diff")
}
