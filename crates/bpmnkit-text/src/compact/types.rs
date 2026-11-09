//! TS's compact types (`bpmn/compact.ts` lines 26–195). Complete: porters use them as
//! they are.
//!
//! Field order is TS's interface order; JSON comparisons in conformance ignore key order,
//! but keep it anyway. `undefined` fields are omitted; empty arrays are written.
//! `Record<string, string>` fields are [`JsRecord`] (JS key order). Numbers are `f64`.
//! Deserializing is stricter than TS's casts: a field of the wrong JSON type fails here,
//! where TS would carry it on (only reachable with malformed model output).

use bpmnkit_bpmn::BpmnElementType;
use serde::{Deserialize, Serialize};

use crate::js_record::JsRecord;

/// `number | string`, e.g. a user task's `priority` (`50` or `"=prio"`).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum NumberOrString {
    Number(f64),
    String(String),
}

/// `modelerTemplate: { id, version? }`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactModelerTemplate {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub version: Option<f64>,
}

/// `children: { elements, flows }` of a container.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactChildren {
    pub elements: Vec<CompactElement>,
    pub flows: Vec<CompactFlow>,
}

/// `multiInstance` of an activity.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactMultiInstance {
    pub collection: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub element: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sequential: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output_collection: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output_element: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub completion_condition: Option<String>,
}

/// TS's `CompactElement`: one flow node.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactElement {
    #[serde(default)]
    pub id: String,
    /// The element type name (`"serviceTask"`). A string, not [`BpmnElementType`]: TS reads
    /// any string here and fails later (`Unhandled BPMN element type in expand(): x`).
    #[serde(rename = "type")]
    pub type_: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// `<bpmn:documentation>`: an ad-hoc tool's description, a start event's input contract.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    /// `zeebe:taskDefinition` type.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub job_type: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub data_object_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub data_store_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_collection: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub task_headers: Option<JsRecord>,
    /// Input mappings, target → source (`=` starts FEEL).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub inputs: Option<JsRecord>,
    /// Output mappings, target → source.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub outputs: Option<JsRecord>,
    /// `zeebe:userTask`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub native_user_task: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modeler_template: Option<CompactModelerTemplate>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub called_process: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub form_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assignee: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub candidate_groups: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub candidate_users: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub due_date: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub follow_up_date: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub priority: Option<NumberOrString>,
    /// `zeebe:properties`, name → value.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub properties: Option<JsRecord>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decision_id: Option<String>,
    /// A script task's FEEL expression, with its leading `=`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub script: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub result_variable: Option<String>,
    /// Event definition type (`timer`, `error`, `message`, …).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub event_type: Option<String>,
    /// A boundary event's host id.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attached_to: Option<String>,
    /// A boundary event, or an event sub-process's start event: `false` is non-interrupting.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub interrupting: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub children: Option<CompactChildren>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub multi_instance: Option<CompactMultiInstance>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timer_duration: Option<String>,
    /// A timer's ISO 8601 date-time: when it fires.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timer_date: Option<String>,
    /// A timer's repeating interval (`R/PT1H`) or cron expression.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timer_cycle: Option<String>,
    /// A message event's or receive task's message name (one `bpmn:message` per name and key).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message_name: Option<String>,
    /// The FEEL correlation key of a caught message (`zeebe:subscription` on the message).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub correlation_key: Option<String>,
    /// A signal event's signal name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub signal_name: Option<String>,
    /// An error event's error code.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_code: Option<String>,
    /// An escalation event's escalation code.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub escalation_code: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub condition: Option<String>,
    /// A link event's name: a throw jumps to the catch of the same name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link_name: Option<String>,
}

impl CompactElement {
    /// `type` as a known element type, or `None` for a string TS would not recognise.
    pub fn element_type(&self) -> Option<BpmnElementType> {
        BpmnElementType::parse(&self.type_)
    }
}

/// TS's `CompactFlow`: one sequence flow.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactFlow {
    #[serde(default)]
    pub id: String,
    pub from: String,
    pub to: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub condition: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_default: Option<bool>,
}

/// TS's `CompactNote`: a text annotation and the element it is on.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactNote {
    pub element_id: String,
    pub text: String,
}

/// TS's `CompactProcess`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactProcess {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    /// `isExecutable`. When absent, `expand` makes the process executable, except in a
    /// diagram with pools or lanes: there only the first process without the key is.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub executable: Option<bool>,
    /// The swimlanes, outermost first; members on leaf lanes only.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lanes: Option<Vec<CompactLane>>,
    pub elements: Vec<CompactElement>,
    pub flows: Vec<CompactFlow>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub notes: Option<Vec<CompactNote>>,
}

/// TS's `CompactLane`: a leaf lists its `members`, a parent its child `lanes`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactLane {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Ids of the top-level flow nodes in this lane. Leaf lanes only.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub members: Option<Vec<String>>,
    /// Child lanes, outermost first.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lanes: Option<Vec<CompactLane>>,
}

/// TS's `CompactParticipant`: a pool; a black box has no `process_id`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactParticipant {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub process_id: Option<String>,
}

/// TS's `CompactMessageFlow`. `source`/`target`, not `from`/`to`: those mark a sequence
/// flow, which is what a streamed preview turns them into.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactMessageFlow {
    pub id: String,
    pub source: String,
    pub target: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

/// TS's `CompactDiagram`: a read-only, token-efficient view of a model.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactDiagram {
    pub id: String,
    /// Written as `modeler:executionPlatformVersion` by `expand`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub execution_platform_version: Option<String>,
    pub processes: Vec<CompactProcess>,
    /// The pools, in drawing order.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub participants: Option<Vec<CompactParticipant>>,
    /// Messages between pools.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message_flows: Option<Vec<CompactMessageFlow>>,
}
