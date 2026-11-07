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
//!   position has no active element.`, then refuses a host that is not an activity
//!   (`boundary_host_problem`, shared by all three builders).
//! - `event_sub_process` leaves `open_branch_ends` alone and clears `saved_main_flow_id`.
//! - `from()`: `structuredClone` the definitions, seed elements/flows/annotations/
//!   associations and the four root lists from the document; a missing process is the
//!   error `Process "<id>" is not in this document. It contains: "a", "b"` (or
//!   `no processes`). `source_flow_targets` maps flow id → `(source, target)`.
//! - `at()` / `element()` resolve a pending `insertAfter` splice before moving the cursor.
//! - `build()`: resolve the pending splice; copy the scope and flow tags (the result shares
//!   nothing with the builder, and a second `build()` starts from the same state); infer
//!   joins only for a new process; the `explicitJoins` check; ids unique across scopes
//!   (`assert_element_ids_unique`); `validate`; `assert_source_topology_intact`;
//!   `assign_stable_flow_ids` (preserving source flow ids); `assert_explicit_flow_ids_unique`;
//!   event-definition ids only for a new process; incoming/outgoing; then either
//!   `build_onto_source` or a fresh `BpmnDefinitions` (namespaces and attributes exactly as
//!   TS's literal, `Definitions_1`, a `<id>_di` diagram stub only with auto-layout).
//!   Auto-layout is `bpmnkit_layout::apply_auto_layout(&defs, LayoutEngine::Semantic,
//!   Some(&shared.layout_hints()))`; then `hoist_message_subscriptions`.
//! - TS `this.processName` is `undefined` until `name()`; `from()` copies the source's.

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::rest_connector::{
    rest_connector_retries, rest_connector_task_type, rest_connector_to_io_mapping_inputs,
    rest_connector_to_task_headers, RestConnectorConfig, REST_CONNECTOR_TEMPLATE_VERSION,
};
use bpmnkit_bpmn::stable_ids::{
    assert_explicit_flow_ids_unique, assign_event_definition_ids, assign_stable_flow_ids,
};
use bpmnkit_bpmn::zeebe::{
    ensure_zeebe_extension, zeebe_extensions_to_xml_elements, ZeebeExtensions, ZeebeIoMapping,
    ZeebeTaskDefinition, ZeebeTaskHeaders,
};
use bpmnkit_bpmn::{
    Attrs, BpmnAssociation, BpmnDefinitions, BpmnDiPlane, BpmnDiagram, BpmnElementType, BpmnError,
    BpmnEscalation, BpmnFlowElement, BpmnMessage, BpmnProcess, BpmnProcessContents,
    BpmnSequenceFlow, BpmnSignal, XmlElement,
};
use bpmnkit_layout::{apply_auto_layout_owned, LayoutEngine};
use indexmap::{IndexMap, IndexSet};

use crate::branch::BranchBuilder;
use crate::elements::{
    assert_element_ids_unique, boundary_host_problem, build_event_definitions, can_declare_root,
    embedded_form_elements, hoist_message_subscriptions, insert_join_gateways, is_gateway_type,
    is_link_event, make_boundary_event_el, make_business_rule_task_el, make_call_activity_el,
    make_data_element, make_defaultable_gateway_el, make_end_event_el, make_flow_element,
    make_intermediate_catch_event_el, make_intermediate_throw_event_el, make_plain_task_el,
    make_receive_task_el, make_script_task_el, make_send_task_el, make_service_task_el,
    make_start_event_el, make_user_task_el, recompute_incoming_outgoing, FlowElementOptions,
    EXPORTER_VERSION,
};
use crate::options::*;
use crate::shared::{
    check, fail, is_failed, new_shared, run_branch, BuildError, Failed, Scope, Shared, SharedRef,
};
use crate::subprocess::{
    make_ad_hoc_sub_process_el, make_event_sub_process_el, make_sub_process_el,
    make_transaction_el, SubProcessContentBuilder,
};

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
    pub(crate) source_flow_targets: IndexMap<String, (String, String)>,
    pub(crate) pending_splice_flow_id: Option<String>,
    pub(crate) spliced_flow_ids: IndexSet<String>,
}

/// JS truthiness of an optional id: `undefined` and `""` are both false.
fn truthy(value: &Option<String>) -> Option<&str> {
    value.as_deref().filter(|s| !s.is_empty())
}

fn new_flow(id: String, source_ref: &str, target_ref: &str) -> BpmnSequenceFlow {
    BpmnSequenceFlow {
        id,
        source_ref: source_ref.to_owned(),
        target_ref: target_ref.to_owned(),
        extension_elements: Vec::new(),
        unknown_attributes: Attrs::new(),
        ..BpmnSequenceFlow::default()
    }
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

    /// Runs a helper that reads or declares root definitions, then records its error.
    fn with_shared<T>(
        &self,
        f: impl FnOnce(&mut Shared) -> Result<T, String>,
    ) -> Result<T, Failed> {
        let result = f(&mut self.shared.borrow_mut());
        check(&self.shared, result)
    }

    /// `this.addFlowElement(<element>)` for an element whose construction may have failed.
    fn add(&mut self, element: Result<BpmnFlowElement, Failed>) -> Result<(), Failed> {
        let element = element?;
        let added = self.add_flow_element(element);
        check(&self.shared, added)
    }

    /// TS's static `from()`: continue process `process_id` of an existing document. A
    /// missing process is recorded and reported by `build()`.
    pub fn from(definitions: &BpmnDefinitions, process_id: &str) -> Self {
        let mut builder = ProcessBuilder::new(process_id);
        let Some(process_index) = definitions
            .processes
            .iter()
            .position(|candidate| candidate.id == process_id)
        else {
            let available: Vec<String> = definitions
                .processes
                .iter()
                .map(|candidate| format!("\"{}\"", candidate.id))
                .collect();
            let listed = if available.is_empty() {
                "no processes".to_owned()
            } else {
                available.join(", ")
            };
            fail(
                &builder.shared,
                format!("Process \"{process_id}\" is not in this document. It contains: {listed}"),
            );
            return builder;
        };

        let copy = definitions.clone();
        let process = &copy.processes[process_index];
        builder.process_name = process.name.clone();
        builder
            .scope
            .elements
            .extend(process.contents.flow_elements.iter().cloned());
        for element in &process.contents.flow_elements {
            builder.scope.ids.insert(element.base().id.clone());
        }
        builder
            .scope
            .flows
            .extend(process.contents.sequence_flows.iter().cloned());
        builder
            .scope
            .text_annotations
            .extend(process.contents.text_annotations.iter().cloned());
        builder
            .scope
            .associations
            .extend(process.contents.associations.iter().cloned());
        {
            // Seeded so a message event reuses the document's message instead of
            // declaring a second one with the same name.
            let mut shared = builder.shared.borrow_mut();
            shared.errors.extend(copy.errors.iter().cloned());
            shared.messages.extend(copy.messages.iter().cloned());
            shared.signals.extend(copy.signals.iter().cloned());
            shared.escalations.extend(copy.escalations.iter().cloned());
        }
        builder.source_flow_targets = process
            .contents
            .sequence_flows
            .iter()
            .map(|flow| {
                (
                    flow.id.clone(),
                    (flow.source_ref.clone(), flow.target_ref.clone()),
                )
            })
            .collect();
        builder.source = Some(SourceDocument {
            definitions: copy,
            process_index,
        });
        builder
    }

    /// TS's `at()`: continue from an existing node.
    pub fn at(&mut self, node_id: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        let Some(node) = self.scope.find(node_id) else {
            fail(
                &self.shared,
                format!(
                    "\"{node_id}\" is not a flow node in process \"{}\". Nodes inside a sub-process cannot be continued from here.",
                    self.process_id
                ),
            );
            return self;
        };
        if matches!(node, BpmnFlowElement::EndEvent(_)) {
            fail(
                &self.shared,
                format!("Cannot continue from end event \"{node_id}\": an end event has no outgoing sequence flow."),
            );
            return self;
        }
        let has_outgoing = self
            .scope
            .flows
            .iter()
            .any(|flow| flow.source_ref == node_id);
        if has_outgoing && !is_gateway_type(node.element_type()) {
            let ty = node.type_name();
            fail(
                &self.shared,
                format!(
                    "\"{node_id}\" already has an outgoing sequence flow. Continuing from it would give a {ty} two outgoing flows, which is an uncontrolled split. Use insertAfter(\"{node_id}\") to splice into that path instead."
                ),
            );
            return self;
        }
        self.resolve_pending_splice();
        self.move_cursor(node_id);
        self
    }

    /// TS's `insertAfter()`: splice into the single flow out of `node_id`.
    pub fn insert_after(&mut self, node_id: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        if self.scope.find(node_id).is_none() {
            fail(
                &self.shared,
                format!(
                    "\"{node_id}\" is not a flow node in process \"{}\".",
                    self.process_id
                ),
            );
            return self;
        }
        let outgoing: Vec<&BpmnSequenceFlow> = self
            .scope
            .flows
            .iter()
            .filter(|flow| flow.source_ref == node_id)
            .collect();
        if outgoing.is_empty() {
            fail(
                &self.shared,
                format!("\"{node_id}\" has no outgoing sequence flow, so there is nothing to insert into. Use at(\"{node_id}\") to continue from it."),
            );
            return self;
        }
        if outgoing.len() > 1 {
            fail(
                &self.shared,
                format!(
                    "\"{node_id}\" has {} outgoing sequence flows, so \"after\" is ambiguous. Name the flow's target and insert before that instead.",
                    outgoing.len()
                ),
            );
            return self;
        }
        let flow_id = outgoing[0].id.clone();

        self.resolve_pending_splice();
        self.pending_splice_flow_id = Some(flow_id.clone());
        self.spliced_flow_ids.insert(flow_id);
        self.move_cursor(node_id);
        self
    }

    /// TS's private `moveCursor`.
    fn move_cursor(&mut self, node_id: &str) {
        let is_gateway = self
            .scope
            .find(node_id)
            .is_some_and(|node| is_gateway_type(node.element_type()));
        self.scope.last_node_id = Some(node_id.to_owned());
        self.scope.current_gateway_id = is_gateway.then(|| node_id.to_owned());
        self.scope.open_branch_ends = Vec::new();
        self.saved_main_flow_id = None;
    }

    /// TS's private `resolvePendingSplice`.
    fn resolve_pending_splice(&mut self) {
        let Some(flow_id) = self.pending_splice_flow_id.take() else {
            return;
        };
        let last = self.scope.last_node_id.clone();
        let flow = self
            .scope
            .flows
            .iter_mut()
            .find(|candidate| candidate.id == flow_id);
        if let (Some(flow), Some(last)) = (flow, last) {
            flow.source_ref = last;
        }
    }

    /// TS's `withAutoLayout()`.
    pub fn with_auto_layout(&mut self) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.auto_layout = true;
        self
    }

    /// TS's `executionPlatformVersion()`.
    pub fn execution_platform_version(&mut self, version: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.execution_platform_version = version.to_owned();
        self
    }

    /// TS's `defaults()`.
    pub fn defaults(&mut self, options: DefaultsOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        // `{...defaults, ...serviceTask}`: an absent key keeps the earlier value.
        if let Some(service_task) = options.service_task {
            if service_task.retries.is_some() {
                self.service_task_defaults.retries = service_task.retries;
            }
        }
        self
    }

    /// TS's `name()`.
    pub fn name(&mut self, name: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.process_name = Some(name.to_owned());
        self
    }

    /// TS's `executable()`.
    pub fn executable(&mut self, value: bool) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.is_executable = value;
        self.executable_set = true;
        self
    }

    /// TS's `versionTag()`.
    pub fn version_tag(&mut self, tag: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.version_tag = Some(tag.to_owned());
        self
    }

    // ── Root definitions ──

    /// TS's `message(id, { name })`.
    pub fn message(&mut self, id: &str, options: NamedDeclaration) -> &mut Self {
        if self.failed() {
            return self;
        }
        let name = options.name;
        let _ = self.with_shared(|s| {
            let existing = s
                .messages
                .iter()
                .find(|m| m.name.as_deref() == Some(name.as_str()))
                .map(|m| m.id.clone());
            let declare = can_declare_root(
                "Message",
                &name,
                id,
                existing.as_deref(),
                s.messages.iter().map(|m| m.id.as_str()),
            )?;
            if declare {
                s.messages.push(BpmnMessage {
                    id: id.to_owned(),
                    name: Some(name.clone()),
                    unknown_attributes: Attrs::new(),
                    ..BpmnMessage::default()
                });
            }
            Ok(())
        });
        self
    }

    /// TS's `error(id, { code, name? })`.
    pub fn error(&mut self, id: &str, options: CodedDeclaration) -> &mut Self {
        if self.failed() {
            return self;
        }
        let CodedDeclaration { code, name } = options;
        let _ = self.with_shared(|s| {
            let existing = s
                .errors
                .iter()
                .find(|e| {
                    e.error_code.as_deref() == Some(code.as_str())
                        || e.name.as_deref() == Some(code.as_str())
                })
                .map(|e| e.id.clone());
            let declare = can_declare_root(
                "Error",
                &code,
                id,
                existing.as_deref(),
                s.errors.iter().map(|e| e.id.as_str()),
            )?;
            if declare {
                s.errors.push(BpmnError {
                    id: id.to_owned(),
                    name: Some(name.unwrap_or_else(|| code.clone())),
                    error_code: Some(code.clone()),
                    ..BpmnError::default()
                });
            }
            Ok(())
        });
        self
    }

    /// TS's `signal(id, { name })`.
    pub fn signal(&mut self, id: &str, options: NamedDeclaration) -> &mut Self {
        if self.failed() {
            return self;
        }
        let name = options.name;
        let _ = self.with_shared(|s| {
            let existing = s
                .signals
                .iter()
                .find(|x| x.name.as_deref() == Some(name.as_str()))
                .map(|x| x.id.clone());
            let declare = can_declare_root(
                "Signal",
                &name,
                id,
                existing.as_deref(),
                s.signals.iter().map(|x| x.id.as_str()),
            )?;
            if declare {
                s.signals.push(BpmnSignal {
                    id: id.to_owned(),
                    name: Some(name.clone()),
                    ..BpmnSignal::default()
                });
            }
            Ok(())
        });
        self
    }

    /// TS's `escalation(id, { code, name? })`.
    pub fn escalation(&mut self, id: &str, options: CodedDeclaration) -> &mut Self {
        if self.failed() {
            return self;
        }
        let CodedDeclaration { code, name } = options;
        let _ = self.with_shared(|s| {
            let existing = s
                .escalations
                .iter()
                .find(|x| x.escalation_code.as_deref() == Some(code.as_str()))
                .map(|x| x.id.clone());
            let declare = can_declare_root(
                "Escalation",
                &code,
                id,
                existing.as_deref(),
                s.escalations.iter().map(|x| x.id.as_str()),
            )?;
            if declare {
                s.escalations.push(BpmnEscalation {
                    id: id.to_owned(),
                    name: Some(name.unwrap_or_else(|| code.clone())),
                    escalation_code: Some(code.clone()),
                    ..BpmnEscalation::default()
                });
            }
            Ok(())
        });
        self
    }

    // ── Process-only flow nodes and cursor moves ──

    /// TS's `addStartEvent()`: a start event not connected to the cursor.
    pub fn add_start_event(
        &mut self,
        id: Option<&str>,
        options: Option<StartEventOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.scope.last_node_id = None;
        self.scope.current_gateway_id = None;
        self.start_event(id, options)
    }

    /// TS's `disconnectedStartEvent()`: alias of `add_start_event`.
    pub fn disconnected_start_event(
        &mut self,
        id: Option<&str>,
        options: Option<StartEventOptions>,
    ) -> &mut Self {
        self.add_start_event(id, options)
    }

    /// TS's `restConnector()`: a service task configured as the Camunda HTTP connector.
    pub fn rest_connector(&mut self, id: &str, config: RestConnectorConfig) -> &mut Self {
        if self.failed() {
            return self;
        }
        let inputs = rest_connector_to_io_mapping_inputs(&config);
        let task_header_entries = rest_connector_to_task_headers(&config);

        let mut extensions = ZeebeExtensions {
            task_definition: Some(ZeebeTaskDefinition {
                type_: rest_connector_task_type().to_owned(),
                retries: Some(rest_connector_retries(&config)),
            }),
            io_mapping: Some(ZeebeIoMapping {
                inputs,
                outputs: Vec::new(),
            }),
            ..ZeebeExtensions::default()
        };
        if !task_header_entries.is_empty() {
            extensions.task_headers = Some(ZeebeTaskHeaders {
                headers: task_header_entries,
            });
        }

        let el = make_flow_element(
            id,
            BpmnElementType::ServiceTask,
            FlowElementOptions {
                name: config.name.clone(),
                extension_elements: Some(zeebe_extensions_to_xml_elements(&extensions)),
                ..FlowElementOptions::default()
            },
        );
        // The template stamp is what makes editors recognise a REST connector.
        let el = check(&self.shared, el).map(|mut el| {
            let mut attrs = Attrs::new();
            attrs.insert(
                "zeebe:modelerTemplate".to_owned(),
                "io.camunda.connectors.HttpJson.v2".to_owned(),
            );
            attrs.insert(
                "zeebe:modelerTemplateVersion".to_owned(),
                REST_CONNECTOR_TEMPLATE_VERSION.to_owned(),
            );
            el.base_mut().unknown_attributes = attrs;
            el
        });
        let _ = self.add(el);
        self
    }

    /// TS's `connectTo()`.
    pub fn connect_to(&mut self, target_id: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        if let Some(last) = truthy(&self.scope.last_node_id) {
            let flow = new_flow(generate_id("Flow"), last, target_id);
            self.scope.flows.push(flow);
        }
        self.scope.last_node_id = None;
        self
    }

    /// TS's `element()`: moves the cursor to an existing element.
    pub fn element(&mut self, element_id: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        if !self.scope.ids.contains(element_id) {
            fail(
                &self.shared,
                format!(
                    "Element \"{element_id}\" not found in process \"{}\"",
                    self.process_id
                ),
            );
            return self;
        }
        self.resolve_pending_splice();
        self.scope.last_node_id = Some(element_id.to_owned());
        self.scope.current_gateway_id = None;
        self
    }

    // ── Build ──

    /// TS's `build()`. A failure is recorded like any other, so a second call returns it too.
    pub fn build(&mut self, options: Option<BuildOptions>) -> Result<BpmnDefinitions, BuildError> {
        if let Some(error) = self.shared.borrow().error.clone() {
            return Err(error);
        }
        self.build_model(options).map_err(|message| {
            fail(&self.shared, message);
            self.shared
                .borrow()
                .error
                .clone()
                .unwrap_or_else(|| unreachable!("error just recorded"))
        })
    }

    /// The body of TS's `build()`, with `throw` as `Err`.
    fn build_model(&mut self, options: Option<BuildOptions>) -> Result<BpmnDefinitions, String> {
        self.resolve_pending_splice();
        // Built from a copy: the result shares nothing with the builder, and a second
        // build() (or one after a refused build) starts from the same state.
        let mut elements = self.scope.elements.clone();
        let mut flows = self.scope.flows.clone();
        let mut flow_tags = self.shared.borrow().flow_tags.clone();
        let before_count = elements.len();
        // A continued document never infers joins: inference reads the whole topology and
        // would retarget edges the caller never touched.
        if self.source.is_none() {
            insert_join_gateways(&mut elements, &mut flows);
        }

        let explicit_joins = options.and_then(|o| o.explicit_joins).unwrap_or(false);
        if explicit_joins && elements.len() > before_count {
            let inserted: Vec<&str> = elements[before_count..]
                .iter()
                .map(|e| e.base().id.as_str())
                .collect();
            return Err(format!(
                "Inferred join gateways: {}. Declare them with .connectTo(joinId), or drop {{ explicitJoins: true }} to keep the inference.",
                inserted.join(", ")
            ));
        }

        assert_element_ids_unique(&elements, &self.process_id)?;
        self.validate(&elements, &flows)?;
        self.assert_source_topology_intact(&flows)?;
        {
            // A continued document's flows keep their ids.
            let preserve: Option<IndexSet<String>> = self
                .source
                .as_ref()
                .map(|_| self.source_flow_targets.keys().cloned().collect());
            assign_stable_flow_ids(&mut elements, &mut flows, &mut flow_tags, preserve.as_ref())?;
            assert_explicit_flow_ids_unique(&elements, &flows, &flow_tags)?;
        }
        // A continued document keeps its untouched part byte-for-byte, ids included.
        if self.source.is_none() {
            for el in &mut elements {
                let id = el.base().id.clone();
                if let Some(defs) = el.event_definitions_mut() {
                    assign_event_definition_ids(&id, defs);
                }
            }
        }
        recompute_incoming_outgoing(&mut elements, &flows);

        if self.source.is_some() {
            return self.build_onto_source(elements, flows);
        }

        let mut extension_elements = embedded_form_elements(&elements, &self.shared.borrow())?;
        if let Some(tag) = truthy(&self.version_tag) {
            let mut attributes = Attrs::new();
            attributes.insert("value".to_owned(), tag.to_owned());
            extension_elements.push(XmlElement {
                name: "zeebe:versionTag".to_owned(),
                attributes,
                children: Vec::new(),
                text: None,
            });
        }

        let process = BpmnProcess {
            id: self.process_id.clone(),
            name: self.process_name.clone(),
            is_executable: Some(self.is_executable),
            extension_elements,
            contents: BpmnProcessContents {
                flow_elements: elements,
                sequence_flows: flows,
                text_annotations: self.scope.text_annotations.clone(),
                associations: self.scope.associations.clone(),
                groups: Vec::new(),
            },
            unknown_attributes: Attrs::new(),
            ..BpmnProcess::default()
        };

        let namespaces: Attrs = [
            ("bpmn", "http://www.omg.org/spec/BPMN/20100524/MODEL"),
            ("bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI"),
            ("dc", "http://www.omg.org/spec/DD/20100524/DC"),
            ("di", "http://www.omg.org/spec/DD/20100524/DI"),
            ("zeebe", "http://camunda.org/schema/zeebe/1.0"),
            ("modeler", "http://camunda.org/schema/modeler/1.0"),
            ("xsi", "http://www.w3.org/2001/XMLSchema-instance"),
        ]
        .into_iter()
        .map(|(k, v)| (k.to_owned(), v.to_owned()))
        .collect();
        let mut unknown_attributes = Attrs::new();
        unknown_attributes.insert(
            "modeler:executionPlatform".to_owned(),
            "Camunda Cloud".to_owned(),
        );
        unknown_attributes.insert(
            "modeler:executionPlatformVersion".to_owned(),
            self.execution_platform_version.clone(),
        );

        let (errors, escalations, messages, signals, hints) = {
            let shared = self.shared.borrow();
            (
                shared.errors.clone(),
                shared.escalations.clone(),
                shared.messages.clone(),
                shared.signals.clone(),
                shared.layout_hints(),
            )
        };

        // A diagram stub so the layout keeps the process-specific DI ids.
        let diagrams = if self.auto_layout {
            vec![BpmnDiagram {
                id: format!("{}_di", self.process_id),
                plane: BpmnDiPlane {
                    id: format!("{}_di_plane", self.process_id),
                    bpmn_element: self.process_id.clone(),
                    shapes: Vec::new(),
                    edges: Vec::new(),
                    unknown_attributes: None,
                },
                unknown_attributes: None,
                unknown_children: Vec::new(),
            }]
        } else {
            Vec::new()
        };

        let defs = BpmnDefinitions {
            id: "Definitions_1".to_owned(),
            target_namespace: "http://bpmn.io/schema/bpmn".to_owned(),
            exporter: Some("@bpmnkit/core".to_owned()),
            exporter_version: Some(EXPORTER_VERSION.to_owned()),
            namespaces,
            unknown_attributes,
            errors,
            escalations,
            messages,
            signals,
            collaborations: Vec::new(),
            processes: vec![process],
            diagrams,
            ..BpmnDefinitions::default()
        };

        let defs = if self.auto_layout {
            apply_auto_layout_owned(defs, LayoutEngine::Semantic, Some(&hints))
        } else {
            defs
        };
        Ok(hoist_message_subscriptions(defs))
    }

    /// TS's private `buildOntoSource`: everything the builder has no opinion about (other
    /// processes, collaboration, DI, lanes, extensions) stays as the document had it.
    fn build_onto_source(
        &self,
        elements: Vec<BpmnFlowElement>,
        flows: Vec<BpmnSequenceFlow>,
    ) -> Result<BpmnDefinitions, String> {
        let Some(source) = self.source.as_ref() else {
            unreachable!("build_onto_source without a source document");
        };
        let mut definitions = source.definitions.clone();
        let forms = embedded_form_elements(&elements, &self.shared.borrow())?;
        {
            let process = &mut definitions.processes[source.process_index];
            process.contents.flow_elements = elements;
            process.contents.sequence_flows = flows;
            process.contents.text_annotations = self.scope.text_annotations.clone();
            process.contents.associations = self.scope.associations.clone();
            if let Some(name) = &self.process_name {
                process.name = Some(name.clone());
            }
            // Only when asked: an absent `isExecutable` reads as false, so writing the
            // builder's default would make a non-executable process executable.
            if self.executable_set {
                process.is_executable = Some(self.is_executable);
            }
            if let Some(tag) = &self.version_tag {
                // On the existing element: a real process carries other extensions beside it.
                ensure_zeebe_extension(
                    "process",
                    &mut process.extension_elements,
                    "zeebe:versionTag",
                )?
                .attributes
                .insert("value".to_owned(), tag.clone());
            }
            for form in forms {
                let at = process.extension_elements.iter().position(|e| {
                    e.name == form.name && e.attributes.get("id") == form.attributes.get("id")
                });
                match at {
                    Some(at) => process.extension_elements[at] = form,
                    None => process.extension_elements.push(form),
                }
            }
        }

        let hints = {
            let shared = self.shared.borrow();
            definitions.errors = shared.errors.clone();
            definitions.messages = shared.messages.clone();
            definitions.signals = shared.signals.clone();
            definitions.escalations = shared.escalations.clone();
            shared.layout_hints()
        };

        let definitions = if self.auto_layout {
            apply_auto_layout_owned(definitions, LayoutEngine::Semantic, Some(&hints))
        } else {
            definitions
        };
        Ok(hoist_message_subscriptions(definitions))
    }

    /// TS's private `assertSourceTopologyIntact`: continuing a model must leave the flows
    /// it already had where they were.
    fn assert_source_topology_intact(&self, flows: &[BpmnSequenceFlow]) -> Result<(), String> {
        if self.source.is_none() {
            return Ok(());
        }
        let mut rewired: Vec<String> = Vec::new();
        // `new Map(...)`: with duplicate ids the last flow wins.
        let mut by_id: IndexMap<&str, &BpmnSequenceFlow> = IndexMap::new();
        for flow in flows {
            by_id.insert(flow.id.as_str(), flow);
        }
        for (id, (source, target)) in &self.source_flow_targets {
            let Some(flow) = by_id.get(id.as_str()) else {
                rewired.push(format!("{id} (removed)"));
                continue;
            };
            // A spliced flow may only move its source: `insertAfter` inserts into a path.
            if self.spliced_flow_ids.contains(id) {
                if &flow.target_ref != target {
                    rewired.push(format!(
                        "{id} (spliced flow now targets {}, not {target})",
                        flow.target_ref
                    ));
                }
                continue;
            }
            if &flow.source_ref != source || &flow.target_ref != target {
                rewired.push(format!(
                    "{id} ({source}→{target} became {}→{})",
                    flow.source_ref, flow.target_ref
                ));
            }
        }
        if !rewired.is_empty() {
            return Err(format!(
                "Building would rewire sequence flows this document already had: {}. Continuing a model must not change the part you did not touch.",
                rewired.join(", ")
            ));
        }
        Ok(())
    }

    /// TS's private `validate`.
    fn validate(
        &self,
        elements: &[BpmnFlowElement],
        flows: &[BpmnSequenceFlow],
    ) -> Result<(), String> {
        let element_ids: IndexSet<&str> = elements.iter().map(|el| el.base().id.as_str()).collect();
        for flow in flows {
            if !element_ids.contains(flow.target_ref.as_str()) {
                return Err(format!(
                    "Sequence flow \"{}\" in process \"{}\" references unknown element \"{}\". Check connectTo() calls — target must exist.",
                    flow.id, self.process_id, flow.target_ref
                ));
            }
            if !element_ids.contains(flow.source_ref.as_str()) {
                return Err(format!(
                    "Sequence flow \"{}\" in process \"{}\" references unknown source element \"{}\".",
                    flow.id, self.process_id, flow.source_ref
                ));
            }
        }
        Ok(())
    }

    /// TS's private `addFlowElement`.
    fn add_flow_element(&mut self, element: BpmnFlowElement) -> Result<(), String> {
        let id = element.base().id.clone();
        if self.scope.ids.contains(&id) {
            return Err(format!(
                "Duplicate element ID \"{id}\" in process \"{}\"",
                self.process_id
            ));
        }
        let for_compensation = element.base().is_for_compensation == Some(true);
        let link_catch = is_link_event(&element, BpmnElementType::IntermediateCatchEvent);
        let link_throw = is_link_event(&element, BpmnElementType::IntermediateThrowEvent);

        self.scope.elements.push(element);
        self.scope.ids.insert(id.clone());

        // A compensation handler is outside the token flow: an association from the
        // compensation boundary event, then the main-flow cursor comes back.
        if for_compensation {
            if let Some(last) = truthy(&self.scope.last_node_id) {
                self.scope.associations.push(BpmnAssociation {
                    id: generate_id("Association"),
                    source_ref: last.to_owned(),
                    target_ref: id.clone(),
                    association_direction: Some("One".to_owned()),
                    unknown_attributes: Attrs::new(),
                    ..BpmnAssociation::default()
                });
            }
            self.scope.last_node_id = self.saved_main_flow_id.take();
            return Ok(());
        }

        // A link catch starts a new chain; open branch ends wait for the next element.
        if link_catch {
            self.saved_main_flow_id = None;
            self.scope.last_node_id = Some(id);
            return Ok(());
        }

        if let Some(last) = truthy(&self.scope.last_node_id) {
            let flow = new_flow(generate_id("Flow"), last, &id);
            self.scope.flows.push(flow);
        }
        for branch_end in std::mem::take(&mut self.scope.open_branch_ends) {
            let flow = new_flow(generate_id("Flow"), &branch_end, &id);
            self.scope.flows.push(flow);
        }

        // A normal element interrupts a pending compensation boundary/handler pair.
        self.saved_main_flow_id = None;
        self.scope.last_node_id = if link_throw { None } else { Some(id) };
        Ok(())
    }

    /// `addDataElement` plus recording its error.
    fn add_data(&mut self, el: BpmnFlowElement) -> &mut Self {
        let added = self.scope.add_data_element(el);
        let _ = check(&self.shared, added);
        self
    }

    // ── Data elements (beside the chain; no sequence flows) ──

    /// TS's `dataObject()`.
    pub fn data_object(&mut self, id: &str, options: Option<DataElementOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_data_element(id, BpmnElementType::DataObject, None, options.as_ref());
        self.add_data(el)
    }

    /// TS's `dataObjectReference()`.
    pub fn data_object_reference(
        &mut self,
        id: &str,
        data_object_ref: &str,
        options: Option<DataElementOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_data_element(
            id,
            BpmnElementType::DataObjectReference,
            Some(data_object_ref),
            options.as_ref(),
        );
        self.add_data(el)
    }

    /// TS's `dataStoreReference()` (only `name` is read).
    pub fn data_store_reference(
        &mut self,
        id: &str,
        data_store_ref: &str,
        options: Option<DataElementOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_data_element(
            id,
            BpmnElementType::DataStoreReference,
            Some(data_store_ref),
            options.as_ref(),
        );
        self.add_data(el)
    }

    /// TS's `dataAssociation()`.
    pub fn data_association(
        &mut self,
        activity_id: &str,
        data_ref_id: &str,
        direction: DataDirection,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let added = self
            .scope
            .add_data_association(activity_id, data_ref_id, direction);
        let _ = check(&self.shared, added);
        self
    }

    // ── Annotations ──

    /// TS's `textAnnotation()`: annotates the cursor element.
    pub fn text_annotation(&mut self, text: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        let Some(last) = truthy(&self.scope.last_node_id).map(str::to_owned) else {
            fail(&self.shared, "textAnnotation() must follow a flow element");
            return self;
        };
        self.annotate(&last, text, None)
    }

    /// TS's `annotate()`.
    pub fn annotate(
        &mut self,
        element_id: &str,
        text: &str,
        options: Option<AnnotateOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.scope
            .annotate(&mut self.shared.borrow_mut(), element_id, text, options);
        self
    }

    // ── Tasks ──

    /// TS's `serviceTask()`.
    pub fn service_task(&mut self, id: &str, options: ServiceTaskOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        let mut merged = options;
        if merged.retries.is_none() {
            merged.retries = self.service_task_defaults.retries.clone();
        }
        let el = check(&self.shared, make_service_task_el(id, &merged));
        let _ = self.add(el);
        self
    }

    /// TS's `userTask()`.
    pub fn user_task(&mut self, id: &str, options: Option<UserTaskOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = self.with_shared(|s| make_user_task_el(id, options.as_ref(), s));
        let _ = self.add(el);
        self
    }

    /// TS's `scriptTask()`.
    pub fn script_task(&mut self, id: &str, options: ScriptTaskOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = check(&self.shared, make_script_task_el(id, &options));
        let _ = self.add(el);
        self
    }

    /// TS's `sendTask()`.
    pub fn send_task(&mut self, id: &str, options: Option<MessageTaskOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = self.with_shared(|s| make_send_task_el(id, options.as_ref(), s));
        let _ = self.add(el);
        self
    }

    /// TS's `receiveTask()`.
    pub fn receive_task(&mut self, id: &str, options: Option<MessageTaskOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = self.with_shared(|s| make_receive_task_el(id, options.as_ref(), s));
        let _ = self.add(el);
        self
    }

    /// TS's `businessRuleTask()`.
    pub fn business_rule_task(
        &mut self,
        id: &str,
        options: Option<BusinessRuleTaskOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = check(
            &self.shared,
            make_business_rule_task_el(id, options.as_ref()),
        );
        let _ = self.add(el);
        self
    }

    /// TS's `callActivity()`.
    pub fn call_activity(&mut self, id: &str, options: CallActivityOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = check(&self.shared, make_call_activity_el(id, &options));
        let _ = self.add(el);
        self
    }

    /// TS's `manualTask()`.
    pub fn manual_task(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_plain_task_el(id, BpmnElementType::ManualTask, options.as_ref());
        let el = check(&self.shared, el);
        let _ = self.add(el);
        self
    }

    /// TS's `task()`.
    pub fn task(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_plain_task_el(id, BpmnElementType::Task, options.as_ref());
        let el = check(&self.shared, el);
        let _ = self.add(el);
        self
    }

    // ── Events ──

    /// TS's `startEvent()`; `None` id is `generate_id("StartEvent")`. Chains from the cursor
    /// like any element; `add_start_event` starts a disconnected path.
    pub fn start_event(
        &mut self,
        id: Option<&str>,
        options: Option<StartEventOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let id = id.map_or_else(|| generate_id("StartEvent"), str::to_owned);
        let el = self.with_shared(|s| {
            let mut element = make_start_event_el(&id, options.as_ref())?;
            if let (BpmnFlowElement::StartEvent(start), Some(options)) =
                (&mut element, options.as_ref())
            {
                start.event_definitions = build_event_definitions(&options.into(), s);
                if options.is_interrupting == Some(false) {
                    start.is_interrupting = Some(false);
                }
            }
            Ok(element)
        });
        let _ = self.add(el);
        self
    }

    /// TS's `endEvent()`; `None` id is `generate_id("EndEvent")`.
    pub fn end_event(&mut self, id: Option<&str>, options: Option<EndEventOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let id = id.map_or_else(|| generate_id("EndEvent"), str::to_owned);
        let el = self.with_shared(|s| make_end_event_el(&id, options.as_ref(), s));
        let _ = self.add(el);
        self
    }

    /// TS's `intermediateThrowEvent()`.
    pub fn intermediate_throw_event(
        &mut self,
        id: Option<&str>,
        options: Option<IntermediateThrowEventOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let id = id.map_or_else(|| generate_id("IntermediateThrowEvent"), str::to_owned);
        let el = self.with_shared(|s| make_intermediate_throw_event_el(&id, options.as_ref(), s));
        let _ = self.add(el);
        self
    }

    /// TS's `intermediateCatchEvent()`.
    pub fn intermediate_catch_event(
        &mut self,
        id: Option<&str>,
        options: Option<IntermediateCatchEventOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let id = id.map_or_else(|| generate_id("IntermediateCatchEvent"), str::to_owned);
        let el = self.with_shared(|s| make_intermediate_catch_event_el(&id, options.as_ref(), s));
        let _ = self.add(el);
        self
    }

    // ── Gateways ──

    /// Adds a gateway, then makes it the current one (TS sets it after adding).
    fn add_gateway(&mut self, id: &str, el: Result<BpmnFlowElement, String>) -> &mut Self {
        let el = check(&self.shared, el);
        if self.add(el).is_ok() {
            self.scope.current_gateway_id = Some(id.to_owned());
        }
        self
    }

    /// TS's `exclusiveGateway()`.
    pub fn exclusive_gateway(&mut self, id: &str, options: Option<GatewayOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el =
            make_defaultable_gateway_el(id, BpmnElementType::ExclusiveGateway, options.as_ref());
        self.add_gateway(id, el)
    }

    /// TS's `parallelGateway()`.
    pub fn parallel_gateway(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_flow_element(
            id,
            BpmnElementType::ParallelGateway,
            options
                .as_ref()
                .map(FlowElementOptions::from)
                .unwrap_or_default(),
        );
        self.add_gateway(id, el)
    }

    /// TS's `inclusiveGateway()`.
    pub fn inclusive_gateway(&mut self, id: &str, options: Option<GatewayOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el =
            make_defaultable_gateway_el(id, BpmnElementType::InclusiveGateway, options.as_ref());
        self.add_gateway(id, el)
    }

    /// TS's `eventBasedGateway()`.
    pub fn event_based_gateway(&mut self, id: &str, options: Option<ElementOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_flow_element(
            id,
            BpmnElementType::EventBasedGateway,
            options
                .as_ref()
                .map(FlowElementOptions::from)
                .unwrap_or_default(),
        );
        self.add_gateway(id, el)
    }

    /// TS's `complexGateway()`.
    pub fn complex_gateway(&mut self, id: &str, options: Option<GatewayOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_defaultable_gateway_el(id, BpmnElementType::ComplexGateway, options.as_ref());
        self.add_gateway(id, el)
    }

    // ── Boundary events ──

    /// TS's `boundaryEvent()`; the positional `(id, hostId, options)` form is `options.attached_to`.
    pub fn boundary_event(&mut self, id: &str, options: BoundaryEventOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        let Ok(el) = self.with_shared(|s| make_boundary_event_el(id, &options, s)) else {
            return self;
        };
        // No flow into a boundary event; the builder chains from it instead.
        let prev_last = self.scope.last_node_id.take();
        let added = self.add_flow_element(el);
        if check(&self.shared, added).is_err() {
            return self;
        }
        // Saved after adding, so the handler that follows is what consumes it.
        if options.compensation == Some(true) {
            self.saved_main_flow_id = prev_last;
        }
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
        let Some(attached_to) = truthy(&self.scope.last_node_id).map(str::to_owned) else {
            fail(
                &self.shared,
                "withBoundary() must follow a task element. Current builder position has no active element.",
            );
            return self;
        };
        if let Some(problem) = boundary_host_problem(self.scope.find(&attached_to)) {
            fail(&self.shared, problem);
            return self;
        }

        let saved_last = self.scope.last_node_id.clone();
        let saved_gateway = self.scope.current_gateway_id.clone();
        let saved_open_ends = std::mem::take(&mut self.scope.open_branch_ends);

        self.boundary_event(
            id,
            BoundaryEventOptions {
                attached_to,
                ..options
            },
        );
        // TS threw before running the handler.
        if self.failed() {
            return self;
        }
        handler(self);
        if self.failed() {
            return self;
        }

        self.scope.last_node_id = saved_last;
        self.scope.current_gateway_id = saved_gateway;
        self.scope.open_branch_ends = saved_open_ends;
        self.saved_main_flow_id = None;
        self
    }

    // ── Sub-processes ──

    /// TS's `subProcess()`.
    pub fn sub_process(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<SubProcessOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_sub_process_el(&self.shared, id, content, options.as_ref());
        let _ = self.add(el);
        self
    }

    /// TS's `transaction()`.
    pub fn transaction(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<SubProcessOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_transaction_el(&self.shared, id, content, options.as_ref());
        let _ = self.add(el);
        self
    }

    /// TS's `adHocSubProcess()`.
    pub fn ad_hoc_sub_process(
        &mut self,
        id: &str,
        content: impl FnOnce(&mut SubProcessContentBuilder),
        options: Option<AdHocSubProcessOptions>,
    ) -> &mut Self {
        if self.failed() {
            return self;
        }
        let el = make_ad_hoc_sub_process_el(&self.shared, id, content, options.as_ref());
        let _ = self.add(el);
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
        let Ok(element) = make_event_sub_process_el(&self.shared, id, content, options.as_ref())
        else {
            return self;
        };
        // The surrounding process wires around it; open branch ends wait for the next
        // normal element.
        let element_id = element.base().id.clone();
        if self.scope.ids.contains(&element_id) {
            fail(
                &self.shared,
                format!(
                    "Duplicate element ID \"{element_id}\" in process \"{}\"",
                    self.process_id
                ),
            );
            return self;
        }
        self.saved_main_flow_id = None;
        self.scope.elements.push(element);
        self.scope.ids.insert(element_id);
        self
    }

    // ── Branching ──

    /// TS's `branch()`.
    pub fn branch(&mut self, name: &str, callback: impl FnOnce(&mut BranchBuilder)) -> &mut Self {
        if self.failed() {
            return self;
        }
        let gateway = truthy(&self.scope.current_gateway_id).map(str::to_owned);
        let Ok(outcome) = run_branch(&self.shared, gateway.as_deref(), name, callback) else {
            return self;
        };
        let merged = self.scope.merge_branch(outcome);
        let _ = check(&self.shared, merged);
        self
    }
}
