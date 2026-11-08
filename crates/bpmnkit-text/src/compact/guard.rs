//! TS's `assertCompactDiagram` (`bpmn/argument-guards.ts`): a shape check on the argument
//! as given, so a caller passing the wrong document gets a message naming it instead of a
//! deserialization error.

use serde_json::Value;

use super::expand::expand;
use super::types::CompactDiagram;
use crate::error::TextError;
use bpmnkit_bpmn::BpmnDefinitions;

fn has_arrays(value: &Value, a: &str, b: &str) -> bool {
    value.is_object() && value[a].is_array() && value[b].is_array()
}

/// A non-object argument, the way an error message reads it (JS `typeof`).
fn describe(value: &Value) -> &'static str {
    match value {
        Value::Null => "null",
        Value::Array(_) => "an array",
        Value::String(_) => "a string",
        Value::Number(_) => "a number",
        Value::Bool(_) => "a boolean",
        Value::Object(_) => "an object",
    }
}

fn compact_problem(value: &Value) -> Option<String> {
    if !value.is_object() {
        let hint = match value {
            Value::String(_) => " Pass compactify(Bpmn.parse(xml)) if you have raw XML.",
            _ => "",
        };
        return Some(format!("received {}.{hint}", describe(value)));
    }
    let Some(processes) = value["processes"].as_array() else {
        return Some("received an object with no processes array.".to_owned());
    };
    if !processes.is_empty()
        && processes
            .iter()
            .all(|p| has_arrays(p, "flowElements", "sequenceFlows"))
    {
        return Some("received a BpmnDefinitions. Pass compactify(defs).".to_owned());
    }
    processes
        .iter()
        .position(|p| !has_arrays(p, "elements", "flows"))
        .map(|bad| format!("received one whose processes[{bad}] has no elements and flows arrays."))
}

/// TS's `assertCompactDiagram(value, fn)`: `Err` with TS's `TypeError` message when `value`
/// cannot be walked as a compact diagram.
pub fn assert_compact_diagram(value: &Value, function: &str) -> Result<(), TextError> {
    match compact_problem(value) {
        Some(problem) => Err(TextError::new(format!(
            "{function} expects a CompactDiagram, {problem}"
        ))),
        None => Ok(()),
    }
}

/// TS's `expand` called with JSON text that may not be a `CompactDiagram`: the shape
/// check, then [`expand`]. Typed from the text itself, not a `Value`, so object key order
/// (connector inputs, headers) survives.
pub fn expand_json(json: &str) -> Result<BpmnDefinitions, TextError> {
    let value: Value =
        serde_json::from_str(json).map_err(|e| TextError::new(format!("expand: {e}")))?;
    assert_compact_diagram(&value, "expand")?;
    let compact: CompactDiagram =
        serde_json::from_str(json).map_err(|e| TextError::new(format!("expand: {e}")))?;
    expand(&compact)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn message(v: Value) -> String {
        assert_compact_diagram(&v, "expand").unwrap_err().message
    }

    #[test]
    fn names_the_shape_it_received() {
        let pre = "expand expects a CompactDiagram, received";
        assert_eq!(message(json!(null)), format!("{pre} null."));
        assert_eq!(message(json!([])), format!("{pre} an array."));
        assert_eq!(message(json!(1)), format!("{pre} a number."));
        assert_eq!(
            message(json!("<x/>")),
            format!("{pre} a string. Pass compactify(Bpmn.parse(xml)) if you have raw XML.")
        );
        assert_eq!(
            message(json!({"processes": {}})),
            format!("{pre} an object with no processes array.")
        );
        assert_eq!(
            message(json!({"processes": [{"flowElements": [], "sequenceFlows": []}]})),
            format!("{pre} a BpmnDefinitions. Pass compactify(defs).")
        );
        assert_eq!(
            message(json!({"processes": [{"elements": [], "flows": []}, {"id": "P"}]})),
            format!("{pre} one whose processes[1] has no elements and flows arrays.")
        );
    }

    #[test]
    fn a_compact_shape_passes() {
        assert!(assert_compact_diagram(&json!({"processes": []}), "expand").is_ok());
    }
}
