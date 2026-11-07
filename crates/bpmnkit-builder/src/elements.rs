//! Port of `bpmn/bpmn-builder.ts` lines 500–1500: the free helpers all three flow builders
//! share (element factories, event definitions, multi-instance, ad-hoc extensions,
//! embedded forms, join inference, scope finalisation, message hoisting).
//!
//! Porter notes:
//! - Pure helpers return `Result<_, String>` with TS's exact message; the builders record
//!   it in `Shared` (see `shared.rs`). Helpers that only read options never fail.
//! - `make_flow_element` is TS's `makeFlowElement`: `create_flow_element` plus listener
//!   placement checks (`assert_zeebe_placement(bpmn_element_name(type), listener.name)`),
//!   listeners appended after the given extension elements.
//! - TS spreads options (`{...options, extensionElements}`) into `makeFlowElement`, which
//!   reads only name/documentation/extensionElements/executionListeners/taskListeners:
//!   [`FlowElementOptions`] is exactly that.
//! - `buildEventDefinitions` resolves root definitions in `Shared` (errors by code OR name,
//!   messages by name, signals by name, escalations by code) and creates missing ones with
//!   `root_definition_id`. A created `BpmnError` has `name` and `errorCode`; a created
//!   `BpmnMessage` has `name` (+ empty `unknownAttributes`, as TS writes `{}`).
//!   Timer: one definition when ANY of duration/date/cycle is a non-empty string (JS
//!   truthiness: `""` does not count). Error: when errorCode or errorRef is defined (empty
//!   counts). Compensation: when `compensation` is truthy.
//! - `Record<string,string>` options (taskHeaders) are written in
//!   `bpmnkit_bpmn::js::object_entries` order.
//! - `insertJoinGateways` iterates JS Maps: `outCount` and `incoming` in first-seen order,
//!   `splitToFlows` likewise — use `IndexMap`. It mutates `flow.targetRef` of flows found by
//!   identity: keep flow indices, not clones. New join flows get `generate_id("Flow")`.
//! - `traceBackToSplit` is O(n²) in TS (`flows.filter` per step); keep the semantics, an
//!   index is fine.
//! - `hoistMessageSubscriptions` walks `flowElements` recursively (any container), keys
//!   owners by messageRef in first-seen order, compares `correlationKey` attribute values
//!   (an absent attribute is `undefined`, a distinct key), and removes the hoisted
//!   `zeebe:subscription` from each host by identity (`filter(x => x !== sub)`): remove the
//!   first element equal to it at the recorded position, not every equal one.

use bpmnkit_bpmn::zeebe::{ZeebeExtensions, ZeebeFormDefinition, ZeebeListener};
use bpmnkit_bpmn::{
    BpmnConditionExpression, BpmnDefinitions, BpmnElementType, BpmnEventDefinition,
    BpmnFlowElement, BpmnMultiInstanceLoopCharacteristics, BpmnSequenceFlow, XmlElement,
};
use indexmap::IndexSet;

use crate::options::*;
use crate::shared::Shared;

/// `const EXPORTER_VERSION`: keep in sync with `packages/core/package.json`.
pub(crate) const EXPORTER_VERSION: &str = "0.0.23";

/// What TS's `makeFlowElement` reads off its options argument.
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct FlowElementOptions {
    pub name: Option<String>,
    pub extension_elements: Option<Vec<XmlElement>>,
    pub documentation: Option<String>,
    pub execution_listeners: Option<Vec<ZeebeListener>>,
    pub task_listeners: Option<Vec<ZeebeListener>>,
}

impl From<&ElementOptions> for FlowElementOptions {
    fn from(o: &ElementOptions) -> Self {
        Self {
            name: o.name.clone(),
            documentation: o.documentation.clone(),
            execution_listeners: o.execution_listeners.clone(),
            ..Self::default()
        }
    }
}

/// The `{ extensionElements, completionCondition }` pair of `buildAdHocSubProcessExtensions`.
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct AdHocExtensions {
    pub extension_elements: Vec<XmlElement>,
    pub completion_condition: Option<BpmnConditionExpression>,
}

/// The finished content of a sub-process scope (TS reads `sub._elements`, `sub._flows`,
/// `sub._textAnnotations`, `sub._associations` after `finalizeScope`).
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct ScopeContents {
    pub elements: Vec<BpmnFlowElement>,
    pub flows: Vec<BpmnSequenceFlow>,
    pub text_annotations: Vec<bpmnkit_bpmn::BpmnTextAnnotation>,
    pub associations: Vec<bpmnkit_bpmn::BpmnAssociation>,
}

// ── Root definitions ────────────────────────────────────────────────────────

/// TS's `canDeclareRoot`: `Ok(false)` when the identical declaration exists, `Ok(true)` to
/// record it, `Err` when it contradicts one (`existing_id` is the id of the definition the
/// label already resolves to) or the id is taken.
pub(crate) fn can_declare_root<'a>(
    kind: &str,
    label: &str,
    id: &str,
    existing_id: Option<&str>,
    all_ids: impl IntoIterator<Item = &'a str>,
) -> Result<bool, String> {
    todo!()
}

/// TS's `resolveMessage`: the id of the root message named `message_name`, declared if new.
pub(crate) fn resolve_message(message_name: &str, shared: &mut Shared) -> String {
    todo!()
}

/// TS's `hoistMessageSubscriptions`: moves each element's `zeebe:subscription` onto the
/// `bpmn:message` it refers to, unless the message's users disagree on the key.
pub(crate) fn hoist_message_subscriptions(defs: BpmnDefinitions) -> BpmnDefinitions {
    todo!()
}

/// TS's `buildMessageSubscriptionExt`: `[]` for an absent or empty key.
pub(crate) fn build_message_subscription_ext(correlation_key: Option<&str>) -> Vec<XmlElement> {
    todo!()
}

/// TS's `buildEventDefinitions`, always with the shared root lists (every TS call site
/// passes them).
pub(crate) fn build_event_definitions(
    opts: &EventDefinitionOptions,
    shared: &mut Shared,
) -> Vec<BpmnEventDefinition> {
    todo!()
}

/// TS's `isLinkEvent(element, type)`: `ty` is `IntermediateThrowEvent` or
/// `IntermediateCatchEvent`.
pub(crate) fn is_link_event(element: &BpmnFlowElement, ty: BpmnElementType) -> bool {
    todo!()
}

// ── Element construction ────────────────────────────────────────────────────

/// TS's `makeFlowElement`: an empty element plus listeners, placement-checked.
pub(crate) fn make_flow_element(
    id: &str,
    ty: BpmnElementType,
    options: FlowElementOptions,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `buildMultiInstance`.
pub(crate) fn build_multi_instance(
    options: &MultiInstanceOptions,
) -> BpmnMultiInstanceLoopCharacteristics {
    todo!()
}

/// TS's `withMultiInstance`: only service/user/script/send/receive/business-rule tasks and
/// call activities take it; `None` leaves `el` as it is.
pub(crate) fn with_multi_instance(
    el: BpmnFlowElement,
    mi: Option<&MultiInstanceOptions>,
) -> BpmnFlowElement {
    todo!()
}

/// TS's `buildAdHocLoopCharacteristics`.
pub(crate) fn build_ad_hoc_loop_characteristics(
    lc: &AdHocLoopOptions,
) -> BpmnMultiInstanceLoopCharacteristics {
    todo!()
}

/// TS's `isGatewayType`.
pub(crate) fn is_gateway_type(ty: BpmnElementType) -> bool {
    ty.is_gateway()
}

/// TS's `recomputeIncomingOutgoing`. A flow whose endpoint is missing is skipped; with
/// duplicate element ids the LAST one wins (`new Map(elements.map(...))`).
pub(crate) fn recompute_incoming_outgoing(
    elements: &mut [BpmnFlowElement],
    flows: &[BpmnSequenceFlow],
) {
    todo!()
}

/// TS's `buildMappingExtensions` (ioMapping, taskHeaders, properties).
pub(crate) fn build_mapping_extensions(
    io_mapping: Option<&IoMappingOptions>,
    task_headers: Option<&indexmap::IndexMap<String, String>>,
    zeebe_properties: Option<&[bpmnkit_bpmn::zeebe::ZeebePropertyEntry]>,
) -> ZeebeExtensions {
    todo!()
}

/// TS's `buildServiceTaskExtensions`.
pub(crate) fn build_service_task_extensions(options: &ServiceTaskOptions) -> Vec<XmlElement> {
    todo!()
}

/// TS's `makeConditionExpression`: `xsi:type="bpmn:tFormalExpression"`.
pub(crate) fn make_condition_expression(expression: &str) -> BpmnConditionExpression {
    todo!()
}

/// TS's `buildAdHocSubProcessExtensions`.
pub(crate) fn build_ad_hoc_sub_process_extensions(
    options: Option<&AdHocSubProcessOptions>,
) -> AdHocExtensions {
    todo!()
}

/// TS's `finalizeAdHocSubProcessEl`: template attributes, contents, loop, completion.
pub(crate) fn finalize_ad_hoc_sub_process_el(
    element: &mut BpmnFlowElement,
    options: Option<&AdHocSubProcessOptions>,
    sub: ScopeContents,
    completion_condition: Option<BpmnConditionExpression>,
) {
    todo!()
}

/// TS's `makeServiceTaskEl`.
pub(crate) fn make_service_task_el(
    id: &str,
    options: &ServiceTaskOptions,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `makeScriptTaskEl`.
pub(crate) fn make_script_task_el(
    id: &str,
    options: &ScriptTaskOptions,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `applyModelerTemplate` (template, version, icon; each only when non-empty).
pub(crate) fn apply_modeler_template(
    el: &mut BpmnFlowElement,
    template: Option<&str>,
    version: Option<&str>,
    icon: Option<&str>,
) {
    todo!()
}

/// TS's `makeStartEventEl`: the shell; callers add event definitions and `isInterrupting`.
pub(crate) fn make_start_event_el(
    id: &str,
    options: Option<&StartEventOptions>,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `userTaskFormDefinition`.
pub(crate) fn user_task_form_definition(
    options: Option<&UserTaskOptions>,
) -> Result<Option<ZeebeFormDefinition>, String> {
    todo!()
}

/// TS's `makeUserTaskEl`; an `embeddedForm` is recorded in `shared.embedded_forms` under
/// the task's id (TS's `embeddedForms.set(el, …)`).
pub(crate) fn make_user_task_el(
    id: &str,
    options: Option<&UserTaskOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `embeddedFormElements`: `zeebe:userTaskForm`s for every embedded form under
/// `elements`, nested containers included, deduped by form id in first-seen order.
pub(crate) fn embedded_form_elements(
    elements: &[BpmnFlowElement],
    shared: &Shared,
) -> Result<Vec<XmlElement>, String> {
    todo!()
}

/// TS's `makeBusinessRuleTaskEl`.
pub(crate) fn make_business_rule_task_el(
    id: &str,
    options: Option<&BusinessRuleTaskOptions>,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `makeCallActivityEl`.
pub(crate) fn make_call_activity_el(
    id: &str,
    options: &CallActivityOptions,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `makeExclusiveGatewayEl` / `makeInclusiveGatewayEl` / `makeComplexGatewayEl`
/// (`ty` is one of those three; `defaultFlow` only when non-empty).
pub(crate) fn make_defaultable_gateway_el(
    id: &str,
    ty: BpmnElementType,
    options: Option<&GatewayOptions>,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// `sendTask()` of all three builders: element, compensation flag, message, multi-instance.
pub(crate) fn make_send_task_el(
    id: &str,
    options: Option<&MessageTaskOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// `receiveTask()` of all three builders: as [`make_send_task_el`] plus the subscription.
pub(crate) fn make_receive_task_el(
    id: &str,
    options: Option<&MessageTaskOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// `manualTask()` / `task()` of all three builders (`ty` is `ManualTask` or `Task`).
pub(crate) fn make_plain_task_el(
    id: &str,
    ty: BpmnElementType,
    options: Option<&ElementOptions>,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// `endEvent()` of all three builders, minus the cursor: definitions only when options
/// are given.
pub(crate) fn make_end_event_el(
    id: &str,
    options: Option<&EndEventOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// `intermediateThrowEvent()` of all three builders, minus the cursor.
pub(crate) fn make_intermediate_throw_event_el(
    id: &str,
    options: Option<&IntermediateThrowEventOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// `intermediateCatchEvent()` of all three builders, minus the cursor (subscription
/// extension from `correlationKey`, definitions only when options are given).
pub(crate) fn make_intermediate_catch_event_el(
    id: &str,
    options: Option<&IntermediateCatchEventOptions>,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `resolveBoundaryEventArgs`: refuses an empty `attachedTo` with TS's
/// `ValidationError` message.
pub(crate) fn resolve_boundary_event_args(
    id: &str,
    options: &BoundaryEventOptions,
) -> Result<(), String> {
    todo!()
}

/// `boundaryEvent()` of all three builders, minus the cursor: resolves the args, builds the
/// element with `attachedToRef`, `cancelActivity` and definitions.
pub(crate) fn make_boundary_event_el(
    id: &str,
    options: &BoundaryEventOptions,
    shared: &mut Shared,
) -> Result<BpmnFlowElement, String> {
    todo!()
}

/// TS's `makeDataElement` (`ty` is one of the three data types; `data_ref` is the
/// `dataObjectRef` / `dataStoreRef`).
pub(crate) fn make_data_element(
    id: &str,
    ty: BpmnElementType,
    data_ref: Option<&str>,
    options: Option<&DataElementOptions>,
) -> BpmnFlowElement {
    todo!()
}

/// TS's `recordToolGrid`.
pub(crate) fn record_tool_grid(
    shared: &mut Shared,
    id: &str,
    options: Option<&AdHocSubProcessOptions>,
) -> Result<(), String> {
    todo!()
}

// ── Scope finalisation ──────────────────────────────────────────────────────

/// TS's `insertJoinGateways`.
pub(crate) fn insert_join_gateways(
    elements: &mut Vec<BpmnFlowElement>,
    flows: &mut Vec<BpmnSequenceFlow>,
) {
    todo!()
}

/// TS's `finalizeScope`: event-definition ids, joins, stable flow ids, incoming/outgoing.
pub(crate) fn finalize_scope(
    elements: &mut Vec<BpmnFlowElement>,
    flows: &mut Vec<BpmnSequenceFlow>,
    shared: &mut Shared,
) -> Result<(), String> {
    todo!()
}

/// TS's `traceBackToSplit`.
pub(crate) fn trace_back_to_split(
    node_id: &str,
    split_gateways: &IndexSet<String>,
    flows: &[BpmnSequenceFlow],
) -> Option<String> {
    todo!()
}

/// TS's `mergeRootDefinitions`: appends the definitions of `incoming` whose id is new.
pub(crate) fn merge_root_definitions<T: Clone>(
    into: &mut Vec<T>,
    incoming: &[T],
    id_of: impl Fn(&T) -> &str,
) {
    todo!()
}
