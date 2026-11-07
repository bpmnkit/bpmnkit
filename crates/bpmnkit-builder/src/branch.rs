//! Port of `bpmn/bpmn-builder.ts` lines 1490–2140: `BranchBuilder`, the builder a
//! gateway's `branch(name, b => …)` callback gets.
//!
//! Porter notes (differences from the other two builders, all kept on purpose):
//! - `add_element` (TS `addElement`) does NOT check duplicate ids — the parent does when it
//!   merges (`Scope::merge_branch`). Only `event_sub_process` checks, with the message
//!   `Duplicate element ID "<id>"` (no " in sub-process").
//! - The first flow out of the gateway carries the pending label (default: the branch
//!   name), condition, explicit flow id and default flag; register it with
//!   `shared.flow_tags.set_flow_discriminator_source(flow_id, branch_name)` and, when a
//!   `flow_id()` was given, `mark_explicit_flow_id`. Later flows get `generate_id("Flow")`.
//!   `generate_id` is called exactly where TS calls it (ids are a global counter).
//! - `start_event` does NOT apply `isInterrupting` here (Process and SubProcess do).
//! - `text_annotation` never fails: TS uses `this.lastNodeId!`, which can be `undefined`
//!   after a link throw event, giving the id `TextAnnotation_undefined_1`. Keep that.
//! - `boundary_event` pushes without a flow, sets the cursor to the boundary and clears
//!   `is_first_element`; `with_boundary` refuses a cursor at the gateway itself.
//! - `with_boundary` also saves/restores `connected`.
//! - Sub-process construction is shared: `crate::subprocess::make_*_el`.

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::BpmnFlowElement;

use crate::options::*;
use crate::shared::{is_failed, BranchOutcome, Scope, SharedRef};
use crate::subprocess::SubProcessContentBuilder;

/// Builder for one named path out of a gateway (TS's `BranchBuilder`).
#[derive(Debug)]
pub struct BranchBuilder {
    pub(crate) shared: SharedRef,
    /// `last_node_id` starts at the gateway; `current_gateway_id` is a gateway declared
    /// inside the branch.
    pub(crate) scope: Scope,
    pub(crate) gateway_id: String,
    pub(crate) branch_name: String,
    pub(crate) is_first_element: bool,
    pub(crate) pending_condition: Option<String>,
    pub(crate) pending_label: Option<String>,
    pub(crate) pending_flow_id: Option<String>,
    pub(crate) pending_default: bool,
    /// TS's `_defaultFlowId`.
    pub(crate) default_flow_id: Option<String>,
    /// TS's `_connected`: the branch ended in `connect_to()`.
    pub(crate) connected: bool,
}

impl BranchBuilder {
    pub(crate) fn new(gateway_id: &str, branch_name: &str, shared: SharedRef) -> Self {
        Self {
            shared,
            scope: Scope {
                last_node_id: Some(gateway_id.to_owned()),
                ..Scope::default()
            },
            gateway_id: gateway_id.to_owned(),
            branch_name: branch_name.to_owned(),
            is_first_element: true,
            pending_condition: None,
            pending_label: None,
            pending_flow_id: None,
            pending_default: false,
            default_flow_id: None,
            connected: false,
        }
    }

    /// What the parent's `branch()` adopts.
    pub(crate) fn into_outcome(self) -> BranchOutcome {
        BranchOutcome {
            elements: self.scope.elements,
            flows: self.scope.flows,
            text_annotations: self.scope.text_annotations,
            associations: self.scope.associations,
            default_flow_id: self.default_flow_id,
            connected: self.connected,
            last_node_id: self.scope.last_node_id,
            open_branch_ends: self.scope.open_branch_ends,
        }
    }

    pub(crate) fn failed(&self) -> bool {
        is_failed(&self.shared)
    }

    /// TS's private `registerFirstFlow`.
    fn register_first_flow(&mut self, flow_id: &str) {
        todo!()
    }

    /// TS's private `addElement`: wires the element after the cursor (and the open ends).
    fn add_element(&mut self, element: BpmnFlowElement) -> &mut Self {
        todo!()
    }

    // ── Flow attributes of the branch's first flow ──

    /// TS's `condition()`: FEEL condition on the flow out of the gateway.
    pub fn condition(&mut self, expression: &str) -> &mut Self {
        todo!()
    }

    /// TS's `label()`: the flow's name instead of the branch name.
    pub fn label(&mut self, text: &str) -> &mut Self {
        todo!()
    }

    /// TS's `flowId()`: a caller-chosen id for the flow out of the gateway.
    pub fn flow_id(&mut self, id: &str) -> &mut Self {
        todo!()
    }

    /// TS's `defaultFlow()`: this branch is the gateway's default.
    pub fn default_flow(&mut self) -> &mut Self {
        todo!()
    }

    /// TS's `connectTo()`: a flow from the cursor to `target_id`; the branch is connected.
    pub fn connect_to(&mut self, target_id: &str) -> &mut Self {
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
