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
//! - `text_annotation` with no cursor (after a nested `branch()` or a link throw) fails
//!   like `ProcessBuilder`'s.
//! - `boundary_event` pushes without a flow, sets the cursor to the boundary and clears
//!   `is_first_element`; `with_boundary` refuses a cursor at the gateway itself and a host
//!   that is not an activity.
//! - `with_boundary` also saves/restores `connected`.
//! - Sub-process construction is shared: `crate::subprocess::make_*_el`.
//! - `connect_to` with no cursor (after a nested `branch()`) wires the nested branches'
//!   open ends to the target instead of a flow from the cursor.

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::{BpmnElementType, BpmnFlowElement, BpmnSequenceFlow};

use crate::elements::{
    boundary_host_problem, build_event_definitions, is_link_event, make_condition_expression,
    make_start_event_el,
};
use crate::options::*;
use crate::shared::{check, fail, is_failed, BranchOutcome, Scope, SharedRef};
use crate::subprocess::{make_event_sub_process_el, scope_methods, SubProcessContentBuilder};

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
        let mut shared = self.shared.borrow_mut();
        shared
            .flow_tags
            .set_flow_discriminator_source(flow_id, &self.branch_name);
        if self.pending_flow_id.is_some() {
            shared.flow_tags.mark_explicit_flow_id(flow_id);
        }
    }

    /// The flow out of the gateway (or from the cursor) with the first-element attributes.
    /// Consumes a `generate_id("Flow")` unless a `flow_id()` was given.
    fn first_or_next_flow(&mut self, source: &str, target: &str) -> BpmnSequenceFlow {
        let first = self.is_first_element;
        let id = if first {
            self.pending_flow_id
                .clone()
                .unwrap_or_else(|| generate_id("Flow"))
        } else {
            generate_id("Flow")
        };
        BpmnSequenceFlow {
            id,
            source_ref: source.to_owned(),
            target_ref: target.to_owned(),
            name: first.then(|| {
                self.pending_label
                    .clone()
                    .unwrap_or_else(|| self.branch_name.clone())
            }),
            condition_expression: self
                .pending_condition
                .as_deref()
                .filter(|c| first && !c.is_empty())
                .map(make_condition_expression),
            ..BpmnSequenceFlow::default()
        }
    }

    /// TS's private `addElement`: wires the element after the cursor (and the open ends).
    fn add_element(&mut self, element: BpmnFlowElement) -> &mut Self {
        if self.failed() {
            return self;
        }
        let id = element.base().id.clone();
        let is_catch = is_link_event(&element, BpmnElementType::IntermediateCatchEvent);
        let is_throw = is_link_event(&element, BpmnElementType::IntermediateThrowEvent);
        self.scope.elements.push(element);
        self.scope.ids.insert(id.clone());

        if is_catch {
            self.is_first_element = false;
            self.scope.last_node_id = Some(id);
            return self;
        }

        if let Some(last) = self.cursor() {
            let flow = self.first_or_next_flow(&last, &id);
            let flow_id = flow.id.clone();
            self.scope.flows.push(flow);
            if self.is_first_element {
                self.register_first_flow(&flow_id);
                if self.pending_default {
                    self.default_flow_id = Some(flow_id);
                }
            }
        }

        for end in std::mem::take(&mut self.scope.open_branch_ends) {
            self.scope.flows.push(BpmnSequenceFlow {
                id: generate_id("Flow"),
                source_ref: end,
                target_ref: id.clone(),
                ..BpmnSequenceFlow::default()
            });
        }

        self.is_first_element = false;
        self.scope.last_node_id = if is_throw { None } else { Some(id) };
        self
    }

    // ── Flow attributes of the branch's first flow ──

    /// TS's `condition()`: FEEL condition on the flow out of the gateway.
    pub fn condition(&mut self, expression: &str) -> &mut Self {
        if !self.failed() {
            self.pending_condition = Some(expression.to_owned());
        }
        self
    }

    /// TS's `label()`: the flow's name instead of the branch name.
    pub fn label(&mut self, text: &str) -> &mut Self {
        if !self.failed() {
            self.pending_label = Some(text.to_owned());
        }
        self
    }

    /// TS's `flowId()`: a caller-chosen id for the flow out of the gateway.
    pub fn flow_id(&mut self, id: &str) -> &mut Self {
        if !self.failed() {
            self.pending_flow_id = Some(id.to_owned());
        }
        self
    }

    /// TS's `defaultFlow()`: this branch is the gateway's default.
    pub fn default_flow(&mut self) -> &mut Self {
        if !self.failed() {
            self.pending_default = true;
        }
        self
    }

    /// TS's `connectTo()`: a flow from the cursor to `target_id`; the branch is connected.
    pub fn connect_to(&mut self, target_id: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        // After a nested branch() the position is that branch's open ends, not one node.
        let Some(source) = self.scope.last_node_id.clone() else {
            for end in std::mem::take(&mut self.scope.open_branch_ends) {
                self.scope.flows.push(BpmnSequenceFlow {
                    id: generate_id("Flow"),
                    source_ref: end,
                    target_ref: target_id.to_owned(),
                    ..BpmnSequenceFlow::default()
                });
            }
            self.scope.last_node_id = Some(target_id.to_owned());
            self.connected = true;
            return self;
        };
        let flow = self.first_or_next_flow(&source, target_id);
        let flow_id = flow.id.clone();
        self.scope.flows.push(flow);
        if self.is_first_element {
            self.register_first_flow(&flow_id);
            if self.pending_default {
                self.default_flow_id = Some(flow_id);
            }
        }
        self.is_first_element = false;
        self.scope.last_node_id = Some(target_id.to_owned());
        self.connected = true;
        self
    }

    /// TS's `textAnnotation()`: annotates the cursor element.
    pub fn text_annotation(&mut self, text: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        let Some(target) = self.cursor() else {
            fail(&self.shared, "textAnnotation() must follow a flow element");
            return self;
        };
        self.annotate(&target, text, None)
    }

    // ── Events ──

    /// TS's `startEvent()`; `None` id is `generate_id("StartEvent")`.
    pub fn start_event(
        &mut self,
        id: Option<&str>,
        options: Option<StartEventOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let id = id.map_or_else(|| generate_id("StartEvent"), str::to_owned);
        self.build_el(|s| {
            let mut el = make_start_event_el(&id, options.as_ref())?;
            if let (BpmnFlowElement::StartEvent(ev), Some(o)) = (&mut el, options.as_ref()) {
                ev.event_definitions = build_event_definitions(&o.into(), s);
                if o.is_interrupting == Some(false) {
                    ev.is_interrupting = Some(false);
                }
            }
            Ok(el)
        })
    }

    scope_methods!();

    // ── Boundary events ──

    /// TS's `boundaryEvent()`; the positional `(id, hostId, options)` form is `options.attached_to`.
    pub fn boundary_event(&mut self, id: &str, options: BoundaryEventOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        let made =
            crate::elements::make_boundary_event_el(id, &options, &mut self.shared.borrow_mut());
        let Ok(el) = check(&self.shared, made) else {
            return self;
        };
        // Pushed directly: no flow, no duplicate check.
        self.scope.elements.push(el);
        self.scope.ids.insert(id.to_owned());
        self.scope.last_node_id = Some(id.to_owned());
        self.is_first_element = false;
        self
    }

    /// TS's `withBoundary()`: `options.attached_to` is ignored (the cursor element is the host); `handler` gets this builder.
    pub fn with_boundary(
        &mut self,
        id: &str,
        options: BoundaryEventOptions,
        handler: impl FnOnce(&mut Self),
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let attached_to = self.cursor().filter(|a| *a != self.gateway_id);
        let Some(attached_to) = attached_to else {
            fail(
                &self.shared,
                "withBoundary() must follow a task element inside the branch. Current builder position has no active task.",
            );
            return self;
        };
        if let Some(problem) = boundary_host_problem(self.scope.find(&attached_to)) {
            fail(&self.shared, problem);
            return self;
        }

        let saved_last = self.scope.last_node_id.clone();
        let saved_gateway = self.scope.current_gateway_id.clone();
        let saved_connected = self.connected;
        let saved_open_ends = std::mem::take(&mut self.scope.open_branch_ends);

        self.boundary_event(
            id,
            BoundaryEventOptions {
                attached_to,
                ..options
            },
        );
        if self.failed() {
            return self;
        }
        handler(self);

        self.scope.last_node_id = saved_last;
        self.scope.current_gateway_id = saved_gateway;
        self.connected = saved_connected;
        self.scope.open_branch_ends = saved_open_ends;
        self
    }

    /// TS's `eventSubProcess()`: no flows, cursor unmoved.
    pub fn event_sub_process(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<ElementOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let Ok(el) = make_event_sub_process_el(&self.shared, id, content, options.as_ref()) else {
            return self;
        };
        let el_id = el.base().id.clone();
        if self.scope.ids.contains(&el_id) {
            fail(&self.shared, format!("Duplicate element ID \"{el_id}\""));
            return self;
        }
        self.scope.elements.push(el);
        self.scope.ids.insert(el_id);
        self
    }
}
