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
//!   `Valid ids: a, b. Use ids, not names. See agent-cards/dmn.md#traps.` (`(none)` when there are none).
//! - `namespaces` is `""`, `dmndi`, `dc` (no `modeler`), `modelerAttributes` empty,
//!   `namespace` `http://bpmn.io/schema/dmn`, no exporter.

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_dmn::{
    DmnDecision, DmnDecisionTable, DmnDefinitions, DmnEntry, DmnInformationRequirement, DmnInput,
    DmnInputData, DmnInputExpression, DmnOutput, DmnRule,
};
use bpmnkit_layout::layout_dmn_owned;
use indexmap::IndexMap;
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
    let decisions = defs
        .decisions
        .iter()
        .map(|d| {
            let mut requires: Vec<String> = vec![];
            for req in &d.information_requirements {
                // `??` falls through on absence only; `if (src)` then drops an empty id.
                let src = req
                    .required_decision
                    .as_ref()
                    .or(req.required_input.as_ref());
                if let Some(src) = src.filter(|s| !s.is_empty()) {
                    requires.push(src.clone());
                }
            }
            let dt = d.decision_table.as_ref();
            CompactDmnDecision {
                id: d.id.clone(),
                name: d.name.clone(),
                hit_policy: dt.and_then(|t| t.hit_policy.clone()),
                aggregation: dt.and_then(|t| t.aggregation.clone()),
                inputs: dt
                    .map(|t| t.inputs.as_slice())
                    .unwrap_or_default()
                    .iter()
                    .map(|i| CompactDmnInput {
                        id: i.id.clone(),
                        label: i.label.clone(),
                        expression: i.input_expression.text.clone(),
                        type_ref: i.input_expression.type_ref.clone(),
                    })
                    .collect(),
                outputs: dt
                    .map(|t| t.outputs.as_slice())
                    .unwrap_or_default()
                    .iter()
                    .map(|o| CompactDmnOutput {
                        id: o.id.clone(),
                        label: o.label.clone(),
                        name: o.name.clone(),
                        type_ref: o.type_ref.clone(),
                    })
                    .collect(),
                rules: dt
                    .map(|t| t.rules.as_slice())
                    .unwrap_or_default()
                    .iter()
                    .map(|r| CompactDmnRule {
                        id: r.id.clone(),
                        inputs: r.input_entries.iter().map(|e| e.text.clone()).collect(),
                        outputs: r.output_entries.iter().map(|e| e.text.clone()).collect(),
                        description: r.description.clone(),
                    })
                    .collect(),
                requires: if requires.is_empty() {
                    None
                } else {
                    Some(requires)
                },
            }
        })
        .collect();

    CompactDmn {
        id: defs.id.clone(),
        name: defs.name.clone(),
        decisions,
        input_data: defs
            .input_data
            .iter()
            .map(|d| CompactDmnInputData {
                id: d.id.clone(),
                name: d.name.clone(),
            })
            .collect(),
    }
}

/// TS's `expandDmn`: a full DMN model, laid out.
pub fn expand_dmn(compact: &CompactDmn) -> Result<DmnDefinitions, TextError> {
    let input_data: Vec<DmnInputData> = compact
        .input_data
        .iter()
        .map(|d| DmnInputData {
            id: d.id.clone(),
            name: d.name.clone(),
        })
        .collect();

    let mut decisions: Vec<DmnDecision> = Vec::with_capacity(compact.decisions.len());
    for cd in &compact.decisions {
        let mut information_requirements = vec![];
        for src_id in cd.requires.as_deref().unwrap_or_default() {
            let is_decision = compact.decisions.iter().any(|d| &d.id == src_id);
            let is_input = compact.input_data.iter().any(|d| &d.id == src_id);
            if !is_decision && !is_input {
                let valid = compact
                    .decisions
                    .iter()
                    .map(|d| d.id.as_str())
                    .chain(compact.input_data.iter().map(|d| d.id.as_str()))
                    .collect::<Vec<_>>()
                    .join(", ");
                return Err(TextError::new(format!(
                    "Decision \"{}\" requires unknown id \"{src_id}\". Valid ids: {}. Use ids, not names. See agent-cards/dmn.md#traps.",
                    cd.id,
                    if valid.is_empty() { "(none)" } else { &valid }
                )));
            }
            information_requirements.push(DmnInformationRequirement {
                id: generate_id("InformationRequirement"),
                required_decision: is_decision.then(|| src_id.clone()),
                required_input: is_input.then(|| src_id.clone()),
            });
        }

        let mut decision_table = None;
        if !cd.inputs.is_empty() || !cd.outputs.is_empty() || !cd.rules.is_empty() {
            let inputs: Vec<DmnInput> = cd
                .inputs
                .iter()
                .map(|i| DmnInput {
                    id: i.id.clone(),
                    label: i.label.clone(),
                    input_expression: DmnInputExpression {
                        id: generate_id("inputExpression"),
                        type_ref: i.type_ref.clone(),
                        text: i.expression.clone(),
                    },
                })
                .collect();
            let outputs: Vec<DmnOutput> = cd
                .outputs
                .iter()
                .map(|o| DmnOutput {
                    id: o.id.clone(),
                    label: o.label.clone(),
                    name: o.name.clone(),
                    type_ref: o.type_ref.clone(),
                    output_values: None,
                })
                .collect();
            let rules: Vec<DmnRule> = cd
                .rules
                .iter()
                .map(|r| DmnRule {
                    id: r.id.clone(),
                    description: r.description.clone(),
                    input_entries: r
                        .inputs
                        .iter()
                        .enumerate()
                        .map(|(idx, text)| DmnEntry {
                            id: generate_id(&format!("inputEntry_{idx}")),
                            text: text.clone(),
                        })
                        .collect(),
                    output_entries: r
                        .outputs
                        .iter()
                        .enumerate()
                        .map(|(idx, text)| DmnEntry {
                            id: generate_id(&format!("outputEntry_{idx}")),
                            text: text.clone(),
                        })
                        .collect(),
                })
                .collect();
            decision_table = Some(DmnDecisionTable {
                id: generate_id("decisionTable"),
                hit_policy: cd.hit_policy.clone(),
                aggregation: cd.aggregation.clone(),
                inputs,
                outputs,
                rules,
            });
        }

        decisions.push(DmnDecision {
            id: cd.id.clone(),
            name: cd.name.clone(),
            decision_table,
            information_requirements,
            ..Default::default()
        });
    }

    let namespaces: IndexMap<String, String> = [
        ("", "https://www.omg.org/spec/DMN/20191111/MODEL/"),
        ("dmndi", "https://www.omg.org/spec/DMN/20191111/DMNDI/"),
        ("dc", "http://www.omg.org/spec/DMN/20180521/DC/"),
    ]
    .into_iter()
    .map(|(k, v)| (k.to_owned(), v.to_owned()))
    .collect();

    Ok(layout_dmn_owned(DmnDefinitions {
        id: compact.id.clone(),
        name: compact.name.clone(),
        namespace: "http://bpmn.io/schema/dmn".to_owned(),
        namespaces,
        decisions,
        input_data,
        ..Default::default()
    }))
}
