//! TS's `xsd-guards.ts`: build-time checks for attributes the BPMN/Zeebe XSD types
//! strictly. A value outside the type serialises fine and is only rejected at deploy,
//! with the attribute name redacted, so `build()` refuses it with the allowed values.
//!
//! TS's boolean checks (`cancelActivity`, `isInterrupting`, `isSequential`) have no
//! twin: those fields are `Option<bool>`, so a non-boolean cannot reach the builder.

use bpmnkit_bpmn::{BpmnFlowElement, BpmnSequenceFlow};

const HINT: &str = " See agent-cards/bpmn.md#traps.";

/// `/^[A-Za-z_][A-Za-z0-9_.-]*$/`: xsd:ID is an NCName (ASCII subset, as TS checks).
fn is_ncname(id: &str) -> bool {
    let mut chars = id.chars();
    matches!(chars.next(), Some('A'..='Z' | 'a'..='z' | '_'))
        && chars.all(|c| matches!(c, 'A'..='Z' | 'a'..='z' | '0'..='9' | '_' | '.' | '-'))
}

/// `/^(=.+|\d+)$/`: a whole number or a FEEL expression. JS `.` stops at line terminators.
fn is_retries(value: &str) -> bool {
    match value.strip_prefix('=') {
        Some(rest) => {
            !rest.is_empty()
                && !rest
                    .chars()
                    .any(|c| matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}'))
        }
        None => !value.is_empty() && value.bytes().all(|b| b.is_ascii_digit()),
    }
}

/// `JSON.stringify(string)`.
fn json_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\u{8}' => out.push_str("\\b"),
            '\u{c}' => out.push_str("\\f"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

/// TS's `assertNcName`.
pub(crate) fn assert_nc_name(id: &str, what: &str) -> Result<(), String> {
    if is_ncname(id) {
        return Ok(());
    }
    Err(format!(
        "{what} id {} is not a valid XML id (xsd:ID). Allowed: letters, digits, \"_\", \"-\", \".\" — starting with a letter or \"_\", no spaces or \":\". Example: \"Task_ApproveOrder\".{HINT}",
        json_string(id)
    ))
}

fn check_elements(elements: &[BpmnFlowElement]) -> Result<(), String> {
    for el in elements {
        assert_nc_name(&el.base().id, "Element")?;
        if let Some(contents) = el.contents() {
            check_elements(&contents.flow_elements)?;
        }
    }
    Ok(())
}

/// TS's `assertXsdValues`: the first value the XSD would reject at deploy.
pub(crate) fn assert_xsd_values(
    process_id: &str,
    elements: &[BpmnFlowElement],
    flows: &[BpmnSequenceFlow],
) -> Result<(), String> {
    assert_nc_name(process_id, "Process")?;
    check_elements(elements)?;
    for flow in flows {
        assert_nc_name(&flow.id, "Sequence flow")?;
    }
    Ok(())
}

/// TS's `assertRetriesOption`. TS names the task type, not the element id, in the message.
pub(crate) fn assert_retries_option(value: Option<&str>, task_type: &str) -> Result<(), String> {
    match value {
        Some(v) if !is_retries(v) => Err(format!(
            "retries on {} must be a whole-number string like \"3\" or a FEEL expression like \"=retries\", got {}.{HINT}",
            json_string(task_type),
            json_string(v)
        )),
        _ => Ok(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ncname() {
        for ok in ["a", "_x", "Task_1", "a.b-c"] {
            assert!(is_ncname(ok), "{ok}");
        }
        for bad in ["", "1a", "a b", "a:b", "x→y", "-a", ".a"] {
            assert!(!is_ncname(bad), "{bad}");
        }
    }

    #[test]
    fn retries() {
        for ok in ["0", "3", "=retries", "= x"] {
            assert!(is_retries(ok), "{ok}");
        }
        for bad in ["", "=", "three", "3.0", "-1", " 3", "=a\nb"] {
            assert!(!is_retries(bad), "{bad}");
        }
    }
}
