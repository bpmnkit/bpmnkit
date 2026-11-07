//! Port of `bpmn/process-text-writer.ts`: writes the first process of a model in the line
//! format, under short aliases, for a model to read and answer with a change script.
//!
//! Porter notes:
//! - Output text must match TS byte for byte.
//! - `KIND_WORDS` is `new Map([...Object.entries(KINDS), ...Object.entries(FIXED_KINDS)]
//!   .map(([word, type]) => [type, word]))`: type → word, a later entry for the same type
//!   wins but keeps the first one's position (`tokens::KINDS`, `catalog::FIXED_KINDS`).
//! - `READABLE_ID` is `/^[a-z][a-z0-9_]{0,23}$/`; `ALIAS_WORDS` is 4.
//! - `writableMapping` JSON-quotes a literal with `JSON.stringify` (escape `"`, `\`,
//!   control characters as `\n`, `\u001f`, …; non-ASCII kept), FEEL loses its leading `=`.
//! - `platformVersion` needs `modeler:executionPlatform` containing "cloud"
//!   (case-insensitive) and the major.minor of `modeler:executionPlatformVersion`.
//! - The `connector_line` callback gets the full flow element (looked up by id in the first
//!   process) and the definitions.

use bpmnkit_bpmn::{BpmnDefinitions, BpmnFlowElement};
use indexmap::IndexSet;
use serde::{Deserialize, Serialize};

use crate::compact::{CompactElement, CompactFlow};
use crate::js_record::JsRecord;

/// Writes one element's connector as the text after `with <id>: `, or `None`.
pub type ConnectorLineFn<'a> = &'a dyn Fn(&BpmnFlowElement, &BpmnDefinitions) -> Option<String>;

/// TS's `WriteProcessTextOptions`.
#[derive(Clone, Copy, Default)]
pub struct WriteProcessTextOptions<'a> {
    /// TS's `connectorLine`; without it no `with` lines are written.
    pub connector_line: Option<ConnectorLineFn<'a>>,
}

impl std::fmt::Debug for WriteProcessTextOptions<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("WriteProcessTextOptions")
            .field("connector_line", &self.connector_line.is_some())
            .finish()
    }
}

/// TS's `WrittenProcessText`.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct WrittenProcessText {
    /// The diagram in the line format.
    pub text: String,
    /// Every written id → the element id it stands for.
    pub aliases: JsRecord,
}

/// TS's `writableName`: a name as it can be written inside brackets.
pub fn writable_name(name: &str) -> String {
    todo!()
}

/// TS's `writableLabel`: a flow name as it can be written in an arrow label.
pub fn writable_label(name: &str) -> String {
    todo!()
}

/// TS's `writableCondition`: a FEEL condition without its leading `=`, on one line.
pub fn writable_condition(condition: &str) -> String {
    todo!()
}

/// TS's `writableMapping`.
fn writable_mapping(source: &str) -> String {
    todo!()
}

/// TS's `platformVersion`.
fn platform_version(definitions: &BpmnDefinitions) -> Option<String> {
    todo!()
}

/// TS's `aliasFor`.
fn alias_for(element: &CompactElement, taken: &mut IndexSet<String>) -> String {
    todo!()
}

/// TS's `spec`: the bracket text of a declaration.
fn spec(element: &CompactElement, host: Option<&str>, container: Option<&str>) -> String {
    todo!()
}

/// TS's `label`: an arrow's label.
fn label(flow: &CompactFlow) -> String {
    todo!()
}

/// TS's `writeProcessText`.
pub fn write_process_text(
    definitions: &BpmnDefinitions,
    options: WriteProcessTextOptions<'_>,
) -> WrittenProcessText {
    todo!()
}
