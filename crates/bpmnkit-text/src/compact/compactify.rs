//! Port of `bpmn/compact.ts` lines 241–455: `compactify` (`findAttr`,
//! `compactifyElement`, `compactifyFlows`).
//!
//! Porter notes:
//! - `assertBpmnDefinitions` is a runtime type guard; the Rust type makes it moot.
//! - `compactifyElement` builds the object key by key; optional keys appear only when TS
//!   sets them (`if (x) result.x = …` uses JS truthiness: `""` is not set).
//! - `priority`: `/^\d+$/` → `Number(priority)` (a `NumberOrString::Number`), else the
//!   string. `modelerTemplate.version` is `Number.parseInt(v, 10)`: leading digits only
//!   (`"18abc"` → 18, `"abc"` → NaN → no version). Use JS `parseInt` semantics (leading
//!   whitespace, sign).
//! - Task headers, inputs, outputs and properties are built in XML order into a
//!   [`JsRecord`]; a repeated key keeps its first position and the last value.
//! - `findAttr` matches the literal `zeebe:` prefix (`ext.find(e => e.name === name)`).
//! - Container children recurse (`children: { elements, flows }`) for every element with
//!   `flowElements` and at least one child (`"flowElements" in el && length > 0`).
//! - `compactifyFlows`: `isDefault` from any element's `default` in the same scope.

use bpmnkit_bpmn::{BpmnDefinitions, BpmnFlowElement, BpmnSequenceFlow, XmlElement};

use super::types::*;
use crate::js_record::JsRecord;

/// TS's `findAttr`: attribute `attr` of the first extension element named `name`.
fn find_attr<'a>(ext: &'a [XmlElement], name: &str, attr: &str) -> Option<&'a str> {
    todo!()
}

/// TS's `compactifyElement`.
fn compactify_element(el: &BpmnFlowElement) -> CompactElement {
    todo!()
}

/// TS's `compactifyFlows`.
fn compactify_flows(
    elements: &[BpmnFlowElement],
    sequence_flows: &[BpmnSequenceFlow],
) -> Vec<CompactFlow> {
    todo!()
}

/// TS's `compactify`: every process, as `{ id, name, documentation, elements, flows }`
/// (no `notes`, no `executionPlatformVersion`).
pub fn compactify(defs: &BpmnDefinitions) -> CompactDiagram {
    todo!()
}
