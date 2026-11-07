//! Port of `bpmn/bpmn-builder.ts` lines 2725–3955: `ProcessBuilder`, the top-level entry
//! point (`Bpmn::create_process`, `Bpmn::continue_process`).
//!
//! Porter notes:
//! - `add_flow_element` (TS `addFlowElement`) checks duplicates with
//!   `Duplicate element ID "<id>" in process "<processId>"`; a compensation handler
//!   (`isForCompensation`) is linked by an `Association` (`generate_id("Association")`,
//!   direction `One`) from the cursor and restores `saved_main_flow_id`; a link catch starts
//!   a chain; otherwise flows from the cursor and every open branch end.
//! - Gateways: TS adds the element, THEN sets `current_gateway_id` (the other builders set
//!   it first; the order only matters if adding fails).
//! - `start_event` applies `isInterrupting === false`. `service_task` merges
//!   `defaults({ serviceTask: { retries } })` when the options have no retries.
//! - `boundary_event` clears the cursor before adding (no flow into a boundary) and, for
//!   `compensation`, saves the previous cursor in `saved_main_flow_id` AFTER adding.
//! - `with_boundary` fails with `withBoundary() must follow a task element. Current builder
//!   position has no active element.`; it does NOT refuse a boundary host here.
//! - `event_sub_process` leaves `open_branch_ends` alone and clears `saved_main_flow_id`.
//! - `from()`: `structuredClone` the definitions, seed elements/flows/annotations/
//!   associations and the four root lists from the document; a missing process is the
//!   error `Process "<id>" is not in this document. It contains: "a", "b"` (or
//!   `no processes`). `source_flow_targets` maps flow id → `"<source>→<target>"` (U+2192).
//! - `build()`: resolve the pending splice; infer joins only for a new process; the
//!   `explicitJoins` check; `validate`; `assert_source_topology_intact`;
//!   `assign_stable_flow_ids` (preserving source flow ids); `assert_explicit_flow_ids_unique`;
//!   event-definition ids only for a new process; incoming/outgoing; then either
//!   `build_onto_source` or a fresh `BpmnDefinitions` (namespaces and attributes exactly as
//!   TS's literal, `Definitions_1`, a `<id>_di` diagram stub only with auto-layout).
//!   Auto-layout is `bpmnkit_layout::apply_auto_layout(&defs, LayoutEngine::Semantic,
//!   Some(&shared.layout_hints()))`; then `hoist_message_subscriptions`.
//!   `build` takes `&mut self` and mutates the builder as TS does (joins, renamed flows);
//!   the returned model owns clones.
//! - TS `this.processName` is `undefined` until `name()`; `from()` copies the source's.

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::rest_connector::RestConnectorConfig;
use bpmnkit_bpmn::{BpmnDefinitions, BpmnFlowElement};
use indexmap::{IndexMap, IndexSet};

use crate::branch::BranchBuilder;
use crate::options::*;
use crate::shared::{is_failed, new_shared, BuildError, Scope, SharedRef};
use crate::subprocess::SubProcessContentBuilder;

/// The document a continued process is built onto (TS's `_source`): a deep copy, and the
/// index of the process in `definitions.processes`.
#[derive(Debug, Clone)]
pub(crate) struct SourceDocument {
    pub definitions: BpmnDefinitions,
    pub process_index: usize,
}

/// Fluent builder for one BPMN process (TS's `ProcessBuilder`).
#[derive(Debug)]
pub struct ProcessBuilder {
    pub(crate) shared: SharedRef,
    pub(crate) scope: Scope,
    pub(crate) process_id: String,
    pub(crate) process_name: Option<String>,
    pub(crate) is_executable: bool,
    pub(crate) executable_set: bool,
    pub(crate) version_tag: Option<String>,
    pub(crate) auto_layout: bool,
    pub(crate) execution_platform_version: String,
    pub(crate) service_task_defaults: ServiceTaskDefaults,
    pub(crate) saved_main_flow_id: Option<String>,
    pub(crate) source: Option<SourceDocument>,
    pub(crate) source_flow_targets: IndexMap<String, String>,
    pub(crate) pending_splice_flow_id: Option<String>,
    pub(crate) spliced_flow_ids: IndexSet<String>,
}

impl ProcessBuilder {
    /// TS's `new ProcessBuilder(processId)`.
    pub fn new(process_id: &str) -> Self {
        Self {
            shared: new_shared(),
            scope: Scope::default(),
            process_id: process_id.to_owned(),
            process_name: None,
            is_executable: true,
            executable_set: false,
            version_tag: None,
            auto_layout: false,
            execution_platform_version: "8.9.0".to_owned(),
            service_task_defaults: ServiceTaskDefaults::default(),
            saved_main_flow_id: None,
            source: None,
            source_flow_targets: IndexMap::new(),
            pending_splice_flow_id: None,
            spliced_flow_ids: IndexSet::new(),
        }
    }

    pub(crate) fn failed(&self) -> bool {
        is_failed(&self.shared)
    }

    /// TS's static `from()`: continue process `process_id` of an existing document. A
    /// missing process is recorded and reported by `build()`.
    pub fn from(definitions: &BpmnDefinitions, process_id: &str) -> Self {
        todo!()
    }

    /// TS's `at()`: continue from an existing node.
    pub fn at(&mut self, node_id: &str) -> &mut Self {
        todo!()
    }

    /// TS's `insertAfter()`: splice into the single flow out of `node_id`.
    pub fn insert_after(&mut self, node_id: &str) -> &mut Self {
        todo!()
    }

    /// TS's private `moveCursor`.
    fn move_cursor(&mut self, node_id: &str) {
        todo!()
    }

    /// TS's private `resolvePendingSplice`.
    fn resolve_pending_splice(&mut self) {
        todo!()
    }

    /// TS's `withAutoLayout()`.
    pub fn with_auto_layout(&mut self) -> &mut Self {
        todo!()
    }

    /// TS's `executionPlatformVersion()`.
    pub fn execution_platform_version(&mut self, version: &str) -> &mut Self {
        todo!()
    }

    /// TS's `defaults()`.
    pub fn defaults(&mut self, options: DefaultsOptions) -> &mut Self {
        todo!()
    }

    /// TS's `name()`.
    pub fn name(&mut self, name: &str) -> &mut Self {
        todo!()
    }

    /// TS's `executable()`.
    pub fn executable(&mut self, value: bool) -> &mut Self {
        todo!()
    }

    /// TS's `versionTag()`.
    pub fn version_tag(&mut self, tag: &str) -> &mut Self {
        todo!()
    }

    // ── Root definitions ──

    /// TS's `message(id, { name })`.
    pub fn message(&mut self, id: &str, options: NamedDeclaration) -> &mut Self {
        todo!()
    }

    /// TS's `error(id, { code, name? })`.
    pub fn error(&mut self, id: &str, options: CodedDeclaration) -> &mut Self {
        todo!()
    }

    /// TS's `signal(id, { name })`.
    pub fn signal(&mut self, id: &str, options: NamedDeclaration) -> &mut Self {
        todo!()
    }

    /// TS's `escalation(id, { code, name? })`.
    pub fn escalation(&mut self, id: &str, options: CodedDeclaration) -> &mut Self {
        todo!()
    }

    // ── Process-only flow nodes and cursor moves ──

    /// TS's `addStartEvent()`: a start event not connected to the cursor.
    pub fn add_start_event(
        &mut self,
        id: Option<&str>,
        options: Option<StartEventOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `disconnectedStartEvent()`: alias of `add_start_event`.
    pub fn disconnected_start_event(
        &mut self,
        id: Option<&str>,
        options: Option<StartEventOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `restConnector()`: a service task configured as the Camunda HTTP connector.
    pub fn rest_connector(&mut self, id: &str, config: RestConnectorConfig) -> &mut Self {
        todo!()
    }

    /// TS's `connectTo()`.
    pub fn connect_to(&mut self, target_id: &str) -> &mut Self {
        todo!()
    }

    /// TS's `element()`: moves the cursor to an existing element.
    pub fn element(&mut self, element_id: &str) -> &mut Self {
        todo!()
    }

    // ── Build ──

    /// TS's `build()`.
    pub fn build(&mut self, options: Option<BuildOptions>) -> Result<BpmnDefinitions, BuildError> {
        todo!()
    }

    /// TS's private `buildOntoSource`.
    fn build_onto_source(&mut self) -> Result<BpmnDefinitions, String> {
        todo!()
    }

    /// TS's private `assertSourceTopologyIntact`.
    fn assert_source_topology_intact(&self) -> Result<(), String> {
        todo!()
    }

    /// TS's private `validate`.
    fn validate(&self) -> Result<(), String> {
        todo!()
    }

    /// TS's private `addFlowElement`.
    fn add_flow_element(&mut self, element: BpmnFlowElement) -> Result<(), String> {
        todo!()
    }

    // ── Data elements (beside the chain; no sequence flows) ──

    /// TS's `dataObject()`.
    pub fn data_object(&mut self, id: &str, options: Option<DataElementOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `dataObjectReference()`.
    pub fn data_object_reference(
        &mut self,
        id: &str,
        data_object_ref: &str,
        options: Option<DataElementOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `dataStoreReference()` (only `name` is read).
    pub fn data_store_reference(
        &mut self,
        id: &str,
        data_store_ref: &str,
        options: Option<DataElementOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `dataAssociation()`.
    pub fn data_association(
        &mut self,
        activity_id: &str,
        data_ref_id: &str,
        direction: DataDirection,
    ) -> &mut Self {
        todo!()
    }

    // ── Annotations ──

    /// TS's `textAnnotation()`: annotates the cursor element.
    pub fn text_annotation(&mut self, text: &str) -> &mut Self {
        todo!()
    }

    /// TS's `annotate()`.
    pub fn annotate(
        &mut self,
        element_id: &str,
        text: &str,
        options: Option<AnnotateOptions>,
    ) -> &mut Self {
        todo!()
    }

    // ── Tasks ──

    /// TS's `serviceTask()`.
    pub fn service_task(&mut self, id: &str, options: ServiceTaskOptions) -> &mut Self {
        todo!()
    }

    /// TS's `userTask()`.
    pub fn user_task(&mut self, id: &str, options: Option<UserTaskOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `scriptTask()`.
    pub fn script_task(&mut self, id: &str, options: ScriptTaskOptions) -> &mut Self {
        todo!()
    }

    /// TS's `sendTask()`.
    pub fn send_task(&mut self, id: &str, options: Option<MessageTaskOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `receiveTask()`.
    pub fn receive_task(&mut self, id: &str, options: Option<MessageTaskOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `businessRuleTask()`.
    pub fn business_rule_task(
        &mut self,
        id: &str,
        options: Option<BusinessRuleTaskOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `callActivity()`.
    pub fn call_activity(&mut self, id: &str, options: CallActivityOptions) -> &mut Self {
        todo!()
    }

    /// TS's `manualTask()`.
    pub fn manual_task(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `task()`.
    pub fn task(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        todo!()
    }

    // ── Events ──

    /// TS's `startEvent()`; `None` id is `generate_id("StartEvent")`.
    pub fn start_event(
        &mut self,
        id: Option<&str>,
        options: Option<StartEventOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `endEvent()`; `None` id is `generate_id("EndEvent")`.
    pub fn end_event(&mut self, id: Option<&str>, options: Option<EndEventOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `intermediateThrowEvent()`.
    pub fn intermediate_throw_event(
        &mut self,
        id: Option<&str>,
        options: Option<IntermediateThrowEventOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `intermediateCatchEvent()`.
    pub fn intermediate_catch_event(
        &mut self,
        id: Option<&str>,
        options: Option<IntermediateCatchEventOptions>,
    ) -> &mut Self {
        todo!()
    }

    // ── Gateways ──

    /// TS's `exclusiveGateway()`.
    pub fn exclusive_gateway(&mut self, id: &str, options: Option<GatewayOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `parallelGateway()`.
    pub fn parallel_gateway(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `inclusiveGateway()`.
    pub fn inclusive_gateway(&mut self, id: &str, options: Option<GatewayOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `eventBasedGateway()`.
    pub fn event_based_gateway(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `complexGateway()`.
    pub fn complex_gateway(&mut self, id: &str, options: Option<GatewayOptions>) -> &mut Self {
        todo!()
    }

    // ── Boundary events ──

    /// TS's `boundaryEvent()`; the positional `(id, hostId, options)` form is `options.attached_to`.
    pub fn boundary_event(&mut self, id: &str, options: BoundaryEventOptions) -> &mut Self {
        todo!()
    }

    /// TS's `withBoundary()`: `options.attached_to` is ignored (the cursor element is the host); `handler` gets this builder.
    pub fn with_boundary(
        &mut self,
        id: &str,
        options: BoundaryEventOptions,
        handler: impl FnOnce(&mut Self),
    ) -> &mut Self {
        todo!()
    }

    // ── Sub-processes ──

    /// TS's `subProcess()`.
    pub fn sub_process(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<SubProcessOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `transaction()`.
    pub fn transaction(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<SubProcessOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `adHocSubProcess()`.
    pub fn ad_hoc_sub_process(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<AdHocSubProcessOptions>,
    ) -> &mut Self {
        todo!()
    }

    /// TS's `eventSubProcess()`: no flows, cursor unmoved.
    pub fn event_sub_process(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<ElementOptions>,
    ) -> &mut Self {
        todo!()
    }

    // ── Branching ──

    /// TS's `branch()`.
    pub fn branch(&mut self, name: &str, callback: impl FnOnce(&mut BranchBuilder)) -> &mut Self {
        todo!()
    }
}
