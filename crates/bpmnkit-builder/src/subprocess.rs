//! Port of `bpmn/bpmn-builder.ts` lines 2140–2725: `SubProcessContentBuilder`, plus the
//! container factories all three builders use for `subProcess`, `transaction`,
//! `adHocSubProcess` and `eventSubProcess` (TS inlines them per class, identically, and
//! has `makeTransactionEl` at line 1361).
//!
//! Porter notes:
//! - `add_element` checks duplicates with `Duplicate element ID "<id>" in sub-process`.
//!   With `auto_connect` false (ad-hoc children) no flows are made, but the cursor still
//!   moves. A link catch starts a new chain; a link throw clears the cursor.
//! - `connect_to` adds a flow only when there is a cursor and then clears it; it never
//!   fails and does not mark anything connected.
//! - `element()` fails with `Element "<id>" not found in sub-process`.
//! - `text_annotation` fails with `textAnnotation() must follow a flow element`.
//! - `with_boundary` fails with `withBoundary() must follow a task element inside the
//!   sub-process. Current builder position has no active task.` and refuses a boundary
//!   event as host.
//! - Container factories: TS runs the content callback, then `finalizeScope`, THEN builds
//!   the container element (so a placement error in the container's own listeners comes
//!   after any error in its content). Ad-hoc: `recordToolGrid` runs before the callback.
//!   `eventSubProcess` builds a `subProcess` with `triggeredByEvent: true` — the model's
//!   `SubProcess` variant, not `EventSubProcess`.

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::BpmnFlowElement;

use crate::branch::BranchBuilder;
use crate::elements::ScopeContents;
use crate::options::*;
use crate::shared::{is_failed, Failed, Scope, SharedRef};

/// Builder for the inside of a sub-process (TS's `SubProcessContentBuilder`).
#[derive(Debug)]
pub struct SubProcessContentBuilder {
    pub(crate) shared: SharedRef,
    pub(crate) scope: Scope,
    /// False inside an ad-hoc sub-process: its children are unordered, so nothing is wired.
    pub(crate) auto_connect: bool,
}

/// Runs `content` on a fresh builder sharing `shared`, then `finalize_scope` on what it
/// built (TS: `new SubProcessContentBuilder(roots, autoConnect)`, `content(sub)`,
/// `finalizeScope(sub._elements, sub._flows)`).
pub(crate) fn run_content(
    shared: &SharedRef,
    auto_connect: bool,
    content: impl FnOnce(&mut SubProcessContentBuilder),
) -> Result<ScopeContents, Failed> {
    todo!()
}

/// `subProcess()`'s element: content, then the container with its multi-instance marker.
pub(crate) fn make_sub_process_el(
    shared: &SharedRef,
    id: &str,
    content: impl FnOnce(&mut SubProcessContentBuilder),
    options: Option<&SubProcessOptions>,
) -> Result<BpmnFlowElement, Failed> {
    todo!()
}

/// TS's `makeTransactionEl`.
pub(crate) fn make_transaction_el(
    shared: &SharedRef,
    id: &str,
    content: impl FnOnce(&mut SubProcessContentBuilder),
    options: Option<&SubProcessOptions>,
) -> Result<BpmnFlowElement, Failed> {
    todo!()
}

/// `adHocSubProcess()`'s element: tool grid, unwired content, extensions, finalisation.
pub(crate) fn make_ad_hoc_sub_process_el(
    shared: &SharedRef,
    id: &str,
    content: impl FnOnce(&mut SubProcessContentBuilder),
    options: Option<&AdHocSubProcessOptions>,
) -> Result<BpmnFlowElement, Failed> {
    todo!()
}

/// `eventSubProcess()`'s element: a `subProcess` with `triggeredByEvent: true`.
pub(crate) fn make_event_sub_process_el(
    shared: &SharedRef,
    id: &str,
    content: impl FnOnce(&mut SubProcessContentBuilder),
    options: Option<&ElementOptions>,
) -> Result<BpmnFlowElement, Failed> {
    todo!()
}

impl SubProcessContentBuilder {
    pub(crate) fn new(shared: SharedRef, auto_connect: bool) -> Self {
        Self {
            shared,
            scope: Scope::default(),
            auto_connect,
        }
    }

    pub(crate) fn failed(&self) -> bool {
        is_failed(&self.shared)
    }

    /// TS's private `addElement`.
    fn add_element(&mut self, element: BpmnFlowElement) -> &mut Self {
        todo!()
    }

    /// TS's `addDisconnected()`: adds an element with no flows and no cursor move.
    pub fn add_disconnected(&mut self, element: BpmnFlowElement) -> &mut Self {
        todo!()
    }

    /// TS's `connectTo()`.
    pub fn connect_to(&mut self, target_id: &str) -> &mut Self {
        todo!()
    }

    /// TS's `element()`: moves the cursor to an existing element of this scope.
    pub fn element(&mut self, element_id: &str) -> &mut Self {
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
