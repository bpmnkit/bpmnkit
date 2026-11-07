//! Port of `dmn/compact.ts`: DMN compact form. The types are complete; `compactify_dmn`
//! and `expand_dmn` are to port.
//!
//! Porter notes:
//! - `compactifyDmn` keeps `undefined` fields absent (`name`, `hitPolicy`, `aggregation`,
//!   labels, `typeRef`s, `description`, `requires` when empty); a decision without a table
//!   has empty `inputs`/`outputs`/`rules`.
//! - `expandDmn` draws ids from `generate_id` in TS's order: per decision, first one
//!   `InformationRequirement` per requirement, then (only when the table has any input,
//!   output or rule) `inputExpression` per input, `inputEntry_<i>` / `outputEntry_<i>` per
//!   rule entry (rule by rule, inputs before outputs), then `decisionTable`. Then
//!   `bpmnkit_layout::layout_dmn`. The unknown-requirement message ends
//!   `Valid ids: a, b. Use ids, not names.` (`(none)` when there are none).
//! - `namespaces` is `""`, `dmndi`, `dc` (no `modeler`), `modelerAttributes` empty,
//!   `namespace` `http://bpmn.io/schema/dmn`, no exporter.

use bpmnkit_dmn::DmnDefinitions;
use serde::{Deserialize, Serialize};

use crate::TextError;

/// TS's `CompactDmnInput`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactDmnInput {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expression: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub type_ref: Option<String>,
}

/// TS's `CompactDmnOutput`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactDmnOutput {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub type_ref: Option<String>,
}

/// TS's `CompactDmnRule`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactDmnRule {
    pub id: String,
    pub inputs: Vec<String>,
    pub outputs: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

/// TS's `CompactDmnDecision`. `hit_policy` and `aggregation` stay raw strings, as in the
/// DMN model.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactDmnDecision {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hit_policy: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub aggregation: Option<String>,
    pub inputs: Vec<CompactDmnInput>,
    pub outputs: Vec<CompactDmnOutput>,
    pub rules: Vec<CompactDmnRule>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub requires: Option<Vec<String>>,
}

/// An input data of [`CompactDmn`].
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactDmnInputData {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

/// TS's `CompactDmn`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactDmn {
    pub id: String,
    pub name: String,
    pub decisions: Vec<CompactDmnDecision>,
    pub input_data: Vec<CompactDmnInputData>,
}

/// TS's `compactifyDmn`.
pub fn compactify_dmn(defs: &DmnDefinitions) -> CompactDmn {
    todo!()
}

/// TS's `expandDmn`: a full DMN model, laid out.
pub fn expand_dmn(compact: &CompactDmn) -> Result<DmnDefinitions, TextError> {
    todo!()
}
