//! Option bags of `bpmn/bpmn-builder.ts` (lines 60–565) and `dmn/dmn-builder.ts`,
//! `dmn/drd-builder.ts`. Complete: porters use these as they are.
//!
//! Each is `Deserialize` with TS's camelCase keys, so a test can feed the very JSON the TS
//! oracle script used. `Option<T>` is a TS-optional field; a required TS field is a plain
//! field (`#[serde(default)]` only where TS validates it at run time, so the TS error is
//! still reachable). `Record<string, string>` is an `IndexMap` in insertion order; write it
//! out with `bpmnkit_bpmn::js::object_entries`, which puts integer-like keys first as JS does.
//! Typed straight from JSON text: a `serde_json::Value` in between sorts object keys.

use bpmnkit_bpmn::zeebe::{
    BindingType, ZeebeAgentDefinition, ZeebeIoMappingEntry, ZeebeLinkedResource, ZeebeListener,
    ZeebePropertyEntry, ZeebeTaskDefinition,
};
use bpmnkit_layout::{AnnotationSide, GridFill, GridHint};
use indexmap::IndexMap;
use serde::Deserialize;

/// `"create" | "update"`: which variable changes re-evaluate a conditional event.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConditionVariableEvent {
    Create,
    Update,
}

impl ConditionVariableEvent {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Create => "create",
            Self::Update => "update",
        }
    }
}

/// `ioMapping: { inputs?, outputs? }`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IoMappingOptions {
    pub inputs: Option<Vec<ZeebeIoMappingEntry>>,
    pub outputs: Option<Vec<ZeebeIoMappingEntry>>,
}

/// TS's `ElementOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementOptions {
    pub name: Option<String>,
    pub is_for_compensation: Option<bool>,
    pub documentation: Option<String>,
    pub execution_listeners: Option<Vec<ZeebeListener>>,
}

/// TS's `MultiInstanceOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MultiInstanceOptions {
    pub is_sequential: Option<bool>,
    pub collection: Option<String>,
    pub element_variable: Option<String>,
    pub output_collection: Option<String>,
    pub output_element: Option<String>,
    pub completion_condition: Option<String>,
}

/// TS's `MessageTaskOptions` (send and receive tasks).
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageTaskOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub multi_instance: Option<MultiInstanceOptions>,
    pub message_name: Option<String>,
    pub correlation_key: Option<String>,
}

/// TS's `StartEventOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartEventOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub condition: Option<String>,
    pub condition_variable_events: Option<Vec<ConditionVariableEvent>>,
    pub timer_duration: Option<String>,
    pub timer_date: Option<String>,
    pub timer_cycle: Option<String>,
    pub message_name: Option<String>,
    /// FEEL expression correlating the message (`zeebe:subscription`). Required for the
    /// message start event of an event sub-process; a process's own message start does not
    /// need one.
    pub correlation_key: Option<String>,
    pub form_id: Option<String>,
    pub zeebe_properties: Option<Vec<ZeebePropertyEntry>>,
    pub modeler_template: Option<String>,
    pub modeler_template_version: Option<String>,
    pub modeler_template_icon: Option<String>,
    pub is_interrupting: Option<bool>,
}

/// TS's `ServiceTaskOptions`. Not an `ElementOptions`: `name` is required.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceTaskOptions {
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    pub multi_instance: Option<MultiInstanceOptions>,
    pub name: String,
    pub task_type: String,
    pub retries: Option<String>,
    pub io_mapping: Option<IoMappingOptions>,
    pub task_headers: Option<IndexMap<String, String>>,
    pub zeebe_properties: Option<Vec<ZeebePropertyEntry>>,
    pub agent_definition: Option<ZeebeAgentDefinition>,
    pub linked_resources: Option<Vec<ZeebeLinkedResource>>,
    pub modeler_template: Option<String>,
    pub modeler_template_version: Option<String>,
    pub modeler_template_icon: Option<String>,
    pub is_for_compensation: Option<bool>,
    pub documentation: Option<String>,
    /// Not in TS's type, but `makeServiceTaskEl` forwards it so an untyped caller gets the
    /// placement error instead of a silent drop. Kept so the same JSON fails the same way.
    pub task_listeners: Option<Vec<ZeebeListener>>,
}

/// TS's `ScriptTaskOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScriptTaskOptions {
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    pub multi_instance: Option<MultiInstanceOptions>,
    pub name: Option<String>,
    pub expression: String,
    pub result_variable: String,
    pub is_for_compensation: Option<bool>,
    pub documentation: Option<String>,
}

/// `embeddedForm: { id, schema }`: a form stored in the process (`zeebe:userTaskForm`).
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
pub struct EmbeddedForm {
    pub id: String,
    pub schema: String,
}

/// TS's `UserTaskOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserTaskOptions {
    pub task_listeners: Option<Vec<ZeebeListener>>,
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    pub multi_instance: Option<MultiInstanceOptions>,
    pub name: Option<String>,
    pub form_id: Option<String>,
    pub form_key: Option<String>,
    pub external_reference: Option<String>,
    pub form_binding_type: Option<BindingType>,
    pub form_version_tag: Option<String>,
    pub embedded_form: Option<EmbeddedForm>,
    pub zeebe_user_task: Option<bool>,
    pub io_mapping: Option<IoMappingOptions>,
    pub task_headers: Option<IndexMap<String, String>>,
    pub zeebe_properties: Option<Vec<ZeebePropertyEntry>>,
    pub modeler_template: Option<String>,
    pub modeler_template_version: Option<String>,
    pub modeler_template_icon: Option<String>,
    pub is_for_compensation: Option<bool>,
    pub documentation: Option<String>,
    pub assignee: Option<String>,
    pub candidate_groups: Option<String>,
    pub candidate_users: Option<String>,
    pub due_date: Option<String>,
    pub follow_up_date: Option<String>,
    /// Written with JS `String(priority)`: `bpmnkit_bpmn::js::js_number_to_string`.
    pub priority: Option<f64>,
}

/// TS's `CallActivityOptions`. No `taskHeaders`: Zeebe forbids them on a call activity.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CallActivityOptions {
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    pub multi_instance: Option<MultiInstanceOptions>,
    pub name: Option<String>,
    pub process_id: String,
    pub propagate_all_child_variables: Option<bool>,
    pub propagate_all_parent_variables: Option<bool>,
    pub binding_type: Option<BindingType>,
    pub version_tag: Option<String>,
    pub io_mapping: Option<IoMappingOptions>,
    pub zeebe_properties: Option<Vec<ZeebePropertyEntry>>,
    pub is_for_compensation: Option<bool>,
    pub documentation: Option<String>,
}

/// TS's `BusinessRuleTaskOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BusinessRuleTaskOptions {
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    pub multi_instance: Option<MultiInstanceOptions>,
    pub name: Option<String>,
    pub task_type: Option<String>,
    pub decision_id: Option<String>,
    pub result_variable: Option<String>,
    pub is_for_compensation: Option<bool>,
    pub documentation: Option<String>,
}

/// TS's `GatewayOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewayOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub default_flow: Option<String>,
}

/// TS's `BuildOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildOptions {
    pub explicit_joins: Option<bool>,
}

/// TS's `ParticipantOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParticipantOptions {
    pub name: Option<String>,
    pub process_id: Option<String>,
}

/// TS's `DiagramMessageOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagramMessageOptions {
    pub name: Option<String>,
    pub correlation_key: Option<String>,
}

/// TS's `MessageFlowOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageFlowOptions {
    pub source: String,
    pub target: String,
    pub name: Option<String>,
    pub message_ref: Option<String>,
}

/// TS's `IntermediateCatchEventOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IntermediateCatchEventOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub timer_duration: Option<String>,
    pub timer_date: Option<String>,
    pub timer_cycle: Option<String>,
    pub message_name: Option<String>,
    pub correlation_key: Option<String>,
    pub signal_name: Option<String>,
    pub link_name: Option<String>,
    pub condition: Option<String>,
    pub condition_variable_events: Option<Vec<ConditionVariableEvent>>,
}

/// TS's `IntermediateThrowEventOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IntermediateThrowEventOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub message_name: Option<String>,
    pub signal_name: Option<String>,
    pub escalation_code: Option<String>,
    pub compensation: Option<bool>,
    pub activity_ref: Option<String>,
    pub link_name: Option<String>,
}

/// TS's `EndEventOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EndEventOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub error_code: Option<String>,
    pub error_ref: Option<String>,
    pub message_name: Option<String>,
    pub signal_name: Option<String>,
    pub escalation_code: Option<String>,
}

/// TS's `BoundaryEventOptions`. `attached_to` is required in TS; an empty one is the TS
/// `ValidationError` ("requires the id of the activity it attaches to"), so it defaults.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BoundaryEventOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    #[serde(default)]
    pub attached_to: String,
    pub cancel_activity: Option<bool>,
    pub error_code: Option<String>,
    pub error_ref: Option<String>,
    pub timer_duration: Option<String>,
    pub timer_date: Option<String>,
    pub timer_cycle: Option<String>,
    pub message_name: Option<String>,
    pub correlation_key: Option<String>,
    pub signal_name: Option<String>,
    pub compensation: Option<bool>,
    pub condition: Option<String>,
    pub condition_variable_events: Option<Vec<ConditionVariableEvent>>,
}

/// TS's `SubProcessOptions` (also transactions).
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubProcessOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub multi_instance: Option<MultiInstanceOptions>,
}

/// `taskDefinition` of an ad-hoc sub-process.
pub type AdHocTaskDefinition = ZeebeTaskDefinition;

/// `loopCharacteristics` of an ad-hoc sub-process (a `zeebe:loopCharacteristics` only).
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdHocLoopOptions {
    pub input_collection: String,
    pub input_element: Option<String>,
    pub output_collection: Option<String>,
    pub output_element: Option<String>,
}

/// `"row" | "column"` of a `toolGrid`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ToolGridFill {
    Row,
    Column,
}

/// TS's `GridHint` as an option: `columns` is a number so a non-integer reaches
/// `recordToolGrid`'s "must be a positive integer, got 2.5" error.
#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
pub struct ToolGridOptions {
    pub columns: Option<f64>,
    pub fill: Option<ToolGridFill>,
}

impl ToolGridOptions {
    /// The layout's hint; call once `columns` is known to be a positive integer.
    pub fn to_hint(self) -> GridHint {
        GridHint {
            columns: self.columns.map(|c| c as i64),
            fill: self.fill.map(|f| match f {
                ToolGridFill::Row => GridFill::Row,
                ToolGridFill::Column => GridFill::Column,
            }),
        }
    }
}

/// TS's `AdHocSubProcessOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdHocSubProcessOptions {
    #[serde(flatten)]
    pub element: ElementOptions,
    pub active_elements_collection: Option<String>,
    pub output_collection: Option<String>,
    pub output_element: Option<String>,
    pub task_definition: Option<AdHocTaskDefinition>,
    pub io_mapping: Option<IoMappingOptions>,
    pub task_headers: Option<IndexMap<String, String>>,
    pub zeebe_properties: Option<Vec<ZeebePropertyEntry>>,
    pub agent_definition: Option<ZeebeAgentDefinition>,
    pub loop_characteristics: Option<AdHocLoopOptions>,
    pub multi_instance: Option<MultiInstanceOptions>,
    pub modeler_template: Option<String>,
    pub modeler_template_version: Option<String>,
    pub modeler_template_icon: Option<String>,
    pub completion_condition: Option<String>,
    pub cancel_remaining_instances: Option<bool>,
    pub tool_grid: Option<ToolGridOptions>,
}

/// TS's `DataElementOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DataElementOptions {
    pub name: Option<String>,
    pub is_collection: Option<bool>,
}

/// `"input" | "output"` of `dataAssociation()`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DataDirection {
    Input,
    Output,
}

/// `side` of [`AnnotateOptions`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AnnotateSide {
    Above,
    Below,
    Left,
    Right,
}

impl From<AnnotateSide> for AnnotationSide {
    fn from(side: AnnotateSide) -> Self {
        match side {
            AnnotateSide::Above => AnnotationSide::Above,
            AnnotateSide::Below => AnnotationSide::Below,
            AnnotateSide::Left => AnnotationSide::Left,
            AnnotateSide::Right => AnnotationSide::Right,
        }
    }
}

/// TS's `AnnotateOptions`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Deserialize)]
pub struct AnnotateOptions {
    pub side: Option<AnnotateSide>,
}

/// `defaults({ serviceTask: { retries } })`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultsOptions {
    pub service_task: Option<ServiceTaskDefaults>,
}

#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceTaskDefaults {
    pub retries: Option<String>,
}

/// `message(id, { name })` / `signal(id, { name })`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
pub struct NamedDeclaration {
    pub name: String,
}

/// `error(id, { code, name? })` / `escalation(id, { code, name? })`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
pub struct CodedDeclaration {
    pub code: String,
    pub name: Option<String>,
}

// ── Event definitions ───────────────────────────────────────────────────────

/// The parameter of TS's `buildEventDefinitions`: every event option bag narrows to it.
/// Field order is the order definitions are emitted in.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct EventDefinitionOptions {
    pub timer_duration: Option<String>,
    pub timer_date: Option<String>,
    pub timer_cycle: Option<String>,
    pub error_code: Option<String>,
    pub error_ref: Option<String>,
    pub message_name: Option<String>,
    pub signal_name: Option<String>,
    pub escalation_code: Option<String>,
    pub compensation: Option<bool>,
    pub activity_ref: Option<String>,
    pub link_name: Option<String>,
    pub condition: Option<String>,
    pub condition_variable_events: Option<Vec<ConditionVariableEvent>>,
}

impl From<&StartEventOptions> for EventDefinitionOptions {
    fn from(o: &StartEventOptions) -> Self {
        Self {
            timer_duration: o.timer_duration.clone(),
            timer_date: o.timer_date.clone(),
            timer_cycle: o.timer_cycle.clone(),
            message_name: o.message_name.clone(),
            condition: o.condition.clone(),
            condition_variable_events: o.condition_variable_events.clone(),
            ..Self::default()
        }
    }
}

impl From<&EndEventOptions> for EventDefinitionOptions {
    fn from(o: &EndEventOptions) -> Self {
        Self {
            error_code: o.error_code.clone(),
            error_ref: o.error_ref.clone(),
            message_name: o.message_name.clone(),
            signal_name: o.signal_name.clone(),
            escalation_code: o.escalation_code.clone(),
            ..Self::default()
        }
    }
}

impl From<&IntermediateThrowEventOptions> for EventDefinitionOptions {
    fn from(o: &IntermediateThrowEventOptions) -> Self {
        Self {
            message_name: o.message_name.clone(),
            signal_name: o.signal_name.clone(),
            escalation_code: o.escalation_code.clone(),
            compensation: o.compensation,
            activity_ref: o.activity_ref.clone(),
            link_name: o.link_name.clone(),
            ..Self::default()
        }
    }
}

impl From<&IntermediateCatchEventOptions> for EventDefinitionOptions {
    fn from(o: &IntermediateCatchEventOptions) -> Self {
        Self {
            timer_duration: o.timer_duration.clone(),
            timer_date: o.timer_date.clone(),
            timer_cycle: o.timer_cycle.clone(),
            message_name: o.message_name.clone(),
            signal_name: o.signal_name.clone(),
            link_name: o.link_name.clone(),
            condition: o.condition.clone(),
            condition_variable_events: o.condition_variable_events.clone(),
            ..Self::default()
        }
    }
}

impl From<&BoundaryEventOptions> for EventDefinitionOptions {
    fn from(o: &BoundaryEventOptions) -> Self {
        Self {
            timer_duration: o.timer_duration.clone(),
            timer_date: o.timer_date.clone(),
            timer_cycle: o.timer_cycle.clone(),
            error_code: o.error_code.clone(),
            error_ref: o.error_ref.clone(),
            message_name: o.message_name.clone(),
            signal_name: o.signal_name.clone(),
            compensation: o.compensation,
            condition: o.condition.clone(),
            condition_variable_events: o.condition_variable_events.clone(),
            ..Self::default()
        }
    }
}

// ── DMN ─────────────────────────────────────────────────────────────────────

/// TS's `HitPolicy` (`decisionTable.hitPolicy` values of the DMN spec).
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Deserialize)]
pub enum HitPolicy {
    #[default]
    #[serde(rename = "UNIQUE")]
    Unique,
    #[serde(rename = "FIRST")]
    First,
    #[serde(rename = "PRIORITY")]
    Priority,
    #[serde(rename = "ANY")]
    Any,
    #[serde(rename = "COLLECT")]
    Collect,
    #[serde(rename = "RULE ORDER")]
    RuleOrder,
    #[serde(rename = "OUTPUT ORDER")]
    OutputOrder,
}

impl HitPolicy {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Unique => "UNIQUE",
            Self::First => "FIRST",
            Self::Priority => "PRIORITY",
            Self::Any => "ANY",
            Self::Collect => "COLLECT",
            Self::RuleOrder => "RULE ORDER",
            Self::OutputOrder => "OUTPUT ORDER",
        }
    }
}

/// TS's `DmnTypeRef`: a union of literals in the type, but any string at runtime
/// (`integer`, `long`, `double` are common), and it is written verbatim.
pub type DmnTypeRef = String;

/// TS's `InputOptions` (decision-table input column).
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InputOptions {
    pub label: Option<String>,
    pub expression: String,
    pub type_ref: Option<DmnTypeRef>,
}

/// TS's `OutputOptions` (decision-table output column).
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutputOptions {
    pub label: Option<String>,
    pub name: String,
    pub type_ref: Option<DmnTypeRef>,
}

/// TS's `RuleOptions`.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuleOptions {
    pub description: Option<String>,
    pub inputs: Vec<String>,
    pub outputs: Vec<String>,
}
