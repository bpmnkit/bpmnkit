//! The DMN model. The serde shape (camelCase, absent optionals omitted) equals what
//! `JSON.stringify(parseDmn(xml))` prints in TS.
//!
//! `hit_policy`, `aggregation` and `type_ref` stay raw strings: TS only casts the attribute, so
//! values outside the spec's lists survive a round trip.

use bpmnkit_xml::XmlElement;
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnInputExpression {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub type_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnInput {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    pub input_expression: DmnInputExpression,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnOutput {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub type_ref: Option<String>,
}

/// An input entry (unary test) or output entry (literal expression) of a rule.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnEntry {
    pub id: String,
    pub text: String,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnRule {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub input_entries: Vec<DmnEntry>,
    pub output_entries: Vec<DmnEntry>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnDecisionTable {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hit_policy: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub aggregation: Option<String>,
    pub inputs: Vec<DmnInput>,
    pub outputs: Vec<DmnOutput>,
    pub rules: Vec<DmnRule>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnInformationRequirement {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required_decision: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required_input: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnKnowledgeRequirement {
    pub id: String,
    pub required_knowledge: String,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnAuthorityRequirement {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required_decision: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required_input: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required_authority: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnDecision {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decision_table: Option<DmnDecisionTable>,
    pub information_requirements: Vec<DmnInformationRequirement>,
    pub knowledge_requirements: Vec<DmnKnowledgeRequirement>,
    pub authority_requirements: Vec<DmnAuthorityRequirement>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnInputData {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnKnowledgeSource {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub authority_requirements: Vec<DmnAuthorityRequirement>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnBusinessKnowledgeModel {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub knowledge_requirements: Vec<DmnKnowledgeRequirement>,
    pub authority_requirements: Vec<DmnAuthorityRequirement>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnTextAnnotation {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnAssociation {
    pub id: String,
    pub source_ref: String,
    pub target_ref: String,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct DmnWaypoint {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct DmnBounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnDiagramShape {
    pub dmn_element_ref: String,
    pub bounds: DmnBounds,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnDiagramEdge {
    pub dmn_element_ref: String,
    pub waypoints: Vec<DmnWaypoint>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct DmnDiagram {
    pub shapes: Vec<DmnDiagramShape>,
    pub edges: Vec<DmnDiagramEdge>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DmnDefinitions {
    pub id: String,
    pub name: String,
    pub namespace: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub exporter: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub exporter_version: Option<String>,
    /// Namespace declarations (prefix to URI); the default namespace has the key `""`.
    pub namespaces: IndexMap<String, String>,
    /// `modeler:*` attributes of the root, without the prefix.
    pub modeler_attributes: IndexMap<String, String>,
    pub decisions: Vec<DmnDecision>,
    pub input_data: Vec<DmnInputData>,
    pub knowledge_sources: Vec<DmnKnowledgeSource>,
    pub business_knowledge_models: Vec<DmnBusinessKnowledgeModel>,
    pub text_annotations: Vec<DmnTextAnnotation>,
    pub associations: Vec<DmnAssociation>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diagram: Option<DmnDiagram>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
}
