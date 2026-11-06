//! Maps the shared `bpmnkit-bpmn` model onto Reebe's execution model.
//!
//! The shared model is a faithful, lossless view of the document; Reebe wants a resolved one:
//! message, signal, error and escalation refs replaced by names and codes, Zeebe extension
//! elements read into typed fields, and sub-process scopes nested. Where the shared model has
//! no field for something Reebe reads, the adapter reads the raw `extension_elements`.

use crate::model::*;
use bpmnkit_bpmn as kit;
use bpmnkit_bpmn::zeebe::get_zeebe_extensions;
use bpmnkit_bpmn::XmlElement;
use std::collections::HashMap;

/// Root declarations that event definitions refer to by id.
#[derive(Default)]
struct Refs<'a> {
    messages: HashMap<&'a str, &'a str>,
    message_keys: HashMap<&'a str, String>,
    signals: HashMap<&'a str, &'a str>,
    error_codes: HashMap<&'a str, &'a str>,
    escalation_codes: HashMap<&'a str, &'a str>,
}

impl<'a> Refs<'a> {
    fn new(defs: &'a kit::BpmnDefinitions) -> Self {
        let mut refs = Refs::default();
        for m in &defs.messages {
            if let Some(name) = &m.name {
                refs.messages.insert(&m.id, name);
            }
            // Where Camunda Modeler and Web Modeler put a message's correlation key.
            let sub = m
                .extension_elements
                .iter()
                .flatten()
                .rev()
                .find(|e| e.local_name() == "subscription");
            if let Some(key) = sub.and_then(|s| s.attr("correlationKey")) {
                refs.message_keys.insert(&m.id, key.to_owned());
            }
        }
        for s in &defs.signals {
            if let Some(name) = &s.name {
                refs.signals.insert(&s.id, name);
            }
        }
        for e in &defs.errors {
            if let Some(code) = &e.error_code {
                refs.error_codes.insert(&e.id, code);
            }
        }
        for e in &defs.escalations {
            if let Some(code) = &e.escalation_code {
                refs.escalation_codes.insert(&e.id, code);
            }
        }
        // Declarations the shared model keeps as unknown content because they are not
        // children of `<definitions>`, such as a `<message>` written inside a `<process>`.
        defs.unknown_children.iter().for_each(|e| refs.scan(e));
        defs.collaborations
            .iter()
            .flat_map(|c| &c.unknown_children)
            .for_each(|e| refs.scan(e));
        for p in &defs.processes {
            p.unknown_children.iter().for_each(|e| refs.scan(e));
            refs.scan_contents(&p.contents);
        }
        refs
    }

    fn scan_contents(&mut self, contents: &'a kit::BpmnProcessContents) {
        for f in &contents.sequence_flows {
            f.unknown_children.iter().for_each(|e| self.scan(e));
        }
        for fe in &contents.flow_elements {
            fe.base().unknown_children.iter().for_each(|e| self.scan(e));
            if let Some(inner) = fe.contents() {
                self.scan_contents(inner);
            }
        }
    }

    fn scan(&mut self, e: &'a XmlElement) {
        let id = e.attr("id");
        match (e.local_name(), id) {
            ("message", Some(id)) => {
                if let Some(name) = e.attr("name") {
                    self.messages.insert(id, name);
                }
                if let Some(key) = subscription_key(e) {
                    self.message_keys.insert(id, key);
                }
            }
            ("signal", Some(id)) => {
                if let Some(name) = e.attr("name") {
                    self.signals.insert(id, name);
                }
            }
            ("error", Some(id)) => {
                if let Some(code) = e.attr("errorCode") {
                    self.error_codes.insert(id, code);
                }
            }
            ("escalation", Some(id)) => {
                if let Some(code) = e.attr("escalationCode") {
                    self.escalation_codes.insert(id, code);
                }
            }
            _ => {}
        }
        e.children.iter().for_each(|c| self.scan(c));
    }
}

/// The last `zeebe:subscription` correlation key anywhere below a message.
fn subscription_key(e: &XmlElement) -> Option<String> {
    let own = (e.local_name() == "subscription")
        .then(|| e.attr("correlationKey"))
        .flatten()
        .map(str::to_owned);
    e.children
        .iter()
        .filter_map(subscription_key)
        .next_back()
        .or(own)
}

/// The processes of a parsed document, in Reebe's model.
pub(crate) fn adapt(defs: &kit::BpmnDefinitions) -> Vec<BpmnProcess> {
    let refs = Refs::new(defs);
    defs.processes
        .iter()
        .map(|p| {
            let mut process = adapt_process(p, &refs);
            // An absent `isExecutable` counts as executable; only an explicit "false" opts out.
            process.is_executable = p.is_executable != Some(false);
            process
        })
        .collect()
}

fn adapt_process(p: &kit::BpmnProcess, refs: &Refs) -> BpmnProcess {
    let mut process = BpmnProcess::new(p.id.clone());
    process.name = p.name.clone();
    let mut scope = Scope::default();
    scope.fill(&p.contents, refs, &mut process.unsupported_elements);
    scope.mark_default_flows();
    process.elements = scope.elements;
    process.sequence_flows = scope.flows;
    process.start_events = scope.start_events;
    process.end_events = scope.end_events;
    process.associations = scope.associations;
    process
}

/// A process or sub-process scope while it is being filled.
#[derive(Default)]
struct Scope {
    elements: HashMap<String, FlowElement>,
    flows: Vec<SequenceFlow>,
    start_events: Vec<String>,
    end_events: Vec<String>,
    associations: Vec<Association>,
    /// Direct children in document order.
    order: Vec<String>,
    details: HashMap<String, ElementDetails>,
}

impl Scope {
    fn fill(
        &mut self,
        contents: &kit::BpmnProcessContents,
        refs: &Refs,
        unsupported: &mut Vec<UnsupportedElement>,
    ) {
        for fe in &contents.flow_elements {
            self.add(fe, refs, unsupported);
        }
        self.flows
            .extend(contents.sequence_flows.iter().map(|f| SequenceFlow {
                id: f.id.clone(),
                name: f.name.clone(),
                source_ref: f.source_ref.clone(),
                target_ref: f.target_ref.clone(),
                condition_expression: f.condition_expression.as_ref().map(|c| c.text.clone()),
                is_default: false,
            }));
        self.associations
            .extend(contents.associations.iter().map(|a| Association {
                id: a.id.clone(),
                source_ref: a.source_ref.clone(),
                target_ref: a.target_ref.clone(),
            }));
    }

    fn insert(&mut self, id: &str, element: FlowElement) {
        self.order.push(id.to_owned());
        self.elements.insert(id.to_owned(), element);
    }

    fn add(
        &mut self,
        fe: &kit::BpmnFlowElement,
        refs: &Refs,
        unsupported: &mut Vec<UnsupportedElement>,
    ) {
        use kit::BpmnFlowElement as K;
        let b = fe.base();
        let id = b.id.as_str();
        let x = Ext::new(b);
        let element = match fe {
            K::StartEvent(e) => {
                let mut ev = StartEvent::new(id);
                ev.name = b.name.clone();
                ev.interrupting = e.is_interrupting.unwrap_or(true);
                ev.outgoing = b.outgoing.clone();
                ev.event_definition = event_definition(&e.event_definitions, &x, refs, true);
                ev.input_mappings = x.inputs();
                ev.output_mappings = x.outputs();
                ev.execution_listeners = x.execution_listeners();
                self.start_events.push(id.to_owned());
                FlowElement::StartEvent(ev)
            }
            K::EndEvent(e) => {
                let mut ev = EndEvent::new(id);
                ev.name = b.name.clone();
                ev.incoming = b.incoming.clone();
                ev.event_definition = event_definition(&e.event_definitions, &x, refs, false);
                ev.execution_listeners = x.execution_listeners();
                self.end_events.push(id.to_owned());
                FlowElement::EndEvent(ev)
            }
            K::IntermediateCatchEvent(e) => {
                let mut ev = IntermediateCatchEvent::new(id);
                ev.name = b.name.clone();
                ev.incoming = b.incoming.clone();
                ev.outgoing = b.outgoing.clone();
                ev.event_definition = event_definition(&e.event_definitions, &x, refs, true);
                ev.input_mappings = x.inputs();
                ev.output_mappings = x.outputs();
                FlowElement::IntermediateCatchEvent(ev)
            }
            K::IntermediateThrowEvent(e) => {
                let mut ev = IntermediateThrowEvent::new(id);
                ev.name = b.name.clone();
                ev.incoming = b.incoming.clone();
                ev.outgoing = b.outgoing.clone();
                ev.event_definition = event_definition(&e.event_definitions, &x, refs, false);
                FlowElement::IntermediateThrowEvent(ev)
            }
            K::BoundaryEvent(e) => {
                let mut ev = BoundaryEvent::new(id, e.attached_to_ref.clone());
                ev.name = b.name.clone();
                ev.outgoing = b.outgoing.clone();
                ev.cancel_activity = e.cancel_activity.unwrap_or(true);
                ev.event_definition = event_definition(&e.event_definitions, &x, refs, true);
                ev.output_mappings = x.outputs();
                FlowElement::BoundaryEvent(ev)
            }
            K::ServiceTask(a) => {
                let mut t = ServiceTask::new(id);
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                t.task_definition = x.task_definition();
                t.task_headers = x.task_headers();
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.execution_listeners = x.execution_listeners();
                t.multi_instance = multi_instance(a.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::ServiceTask(t)
            }
            K::UserTask(a) => {
                let mut t = UserTask::new(id);
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                if let Some(a) = x.zeebe.assignment_definition.clone() {
                    t.assignee = a.assignee;
                    t.candidate_groups = a.candidate_groups;
                    t.candidate_users = a.candidate_users;
                }
                if let Some(s) = x.zeebe.task_schedule.clone() {
                    t.due_date = s.due_date;
                    t.follow_up_date = s.follow_up_date;
                }
                // Raw: the typed form definition prefers `formId`, which Reebe does not read.
                t.form_definition = x.child("formDefinition").map(|f| ZeebeFormDefinition {
                    form_key: attr(f, "formKey"),
                    external_reference: attr(f, "externalReference"),
                });
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.execution_listeners = x.execution_listeners();
                t.task_listeners = x
                    .zeebe
                    .task_listeners
                    .iter()
                    .flatten()
                    .map(|l| ZeebeTaskListener {
                        event_type: non_empty(&l.event_type, "create"),
                        job_type: l.type_.clone(),
                        retries: l.retries.clone().unwrap_or_else(|| "3".into()),
                    })
                    .collect();
                t.multi_instance = multi_instance(a.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::UserTask(t)
            }
            K::ReceiveTask(m) => {
                let mut t = ReceiveTask::new(id);
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                t.message_ref = m.message_ref.clone();
                if let Some(r) = m.message_ref.as_deref() {
                    t.message_name = refs.messages.get(r).map(|n| (*n).to_owned());
                    t.correlation_key = refs.message_keys.get(r).cloned();
                }
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.multi_instance = multi_instance(m.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::ReceiveTask(t)
            }
            K::ScriptTask(a) => {
                let mut t = ScriptTask::new(id);
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                if let Some(s) = x.child("script") {
                    t.script = Some(attr(s, "expression").unwrap_or_default());
                    t.result_variable = attr(s, "resultVariable");
                }
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.multi_instance = multi_instance(a.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::ScriptTask(t)
            }
            K::SendTask(m) => {
                let mut t = SendTask::new(id);
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                t.task_definition = x.task_definition();
                t.task_headers = x.task_headers();
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.multi_instance = multi_instance(m.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::SendTask(t)
            }
            K::BusinessRuleTask(a) => {
                let mut t = BusinessRuleTask::new(id);
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                if let Some(c) = x.child("calledDecision") {
                    t.zeebe_called_decision_id = attr(c, "decisionId");
                    t.zeebe_result_variable = attr(c, "resultVariable");
                }
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.multi_instance = multi_instance(a.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::BusinessRuleTask(t)
            }
            K::Task(a) | K::ManualTask(a) => {
                let mut t = Task::new(id, matches!(fe, K::ManualTask(_)));
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.multi_instance = multi_instance(a.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::Task(t)
            }
            K::CallActivity(a) => {
                let mut t = CallActivity::new(id);
                t.name = b.name.clone();
                t.incoming = b.incoming.clone();
                t.outgoing = b.outgoing.clone();
                t.called_element = x.child("calledElement").map(|c| ZeebeCalledElement {
                    process_id: attr(c, "processId").unwrap_or_default(),
                    // Reebe's own attribute spelling, kept as the old parser read it.
                    propagate_all_child_variables: c.attr("propagateAllChildVariablesEnabled")
                        == Some("true"),
                });
                t.input_mappings = x.inputs();
                t.output_mappings = x.outputs();
                t.multi_instance = multi_instance(a.loop_characteristics.as_ref());
                t.is_for_compensation = compensation(b);
                FlowElement::CallActivity(t)
            }
            K::SubProcess(s) => {
                let (mut sp, _) = sub_process(b, &s.contents, refs, unsupported, &x);
                sp.triggered_by_event = s.triggered_by_event.unwrap_or(false);
                sp.cancel_remaining_instances = b
                    .unknown_attributes
                    .iter()
                    .find(|(k, _)| k.rsplit(':').next() == Some("cancelRemainingInstances"))
                    .is_none_or(|(_, v)| v != "false");
                sp.multi_instance = multi_instance(s.loop_characteristics.as_ref());
                FlowElement::SubProcess(sp)
            }
            K::AdHocSubProcess(s) => {
                let (mut sp, mut child_details) =
                    sub_process(b, &s.contents, refs, unsupported, &x);
                sp.ad_hoc = true;
                sp.cancel_remaining_instances = s.cancel_remaining_instances.unwrap_or(true);
                sp.multi_instance = multi_instance(s.loop_characteristics.as_ref());
                sp.task_definition = x.task_definition();
                if let Some(ad_hoc) = &x.zeebe.ad_hoc {
                    let keep = |v: &Option<String>| v.clone().filter(|v| !v.trim().is_empty());
                    sp.active_elements_collection = keep(&ad_hoc.active_elements_collection);
                    sp.output_collection = keep(&ad_hoc.output_collection);
                    sp.output_element = keep(&ad_hoc.output_element);
                }
                sp.completion_condition = s
                    .completion_condition
                    .as_ref()
                    .map(|c| c.text.trim().to_owned())
                    .filter(|c| !c.is_empty());
                // Only an ad-hoc sub-process hands its children's documentation and
                // properties on, for its tool-style activation.
                for child in &sp.element_order {
                    if let Some(d) = child_details.remove(child) {
                        sp.element_details.insert(child.clone(), d);
                    }
                }
                FlowElement::SubProcess(sp)
            }
            // Zeebe does not execute a complex gateway; recording it lets deployment reject it.
            K::ComplexGateway(_) => {
                unsupported.push(UnsupportedElement {
                    id: id.to_owned(),
                    element_type: "complexGateway".into(),
                });
                return;
            }
            // Neither is a scope of its own here: the old parser did not know these tags and
            // read their content as part of the enclosing scope.
            K::Transaction(t) => {
                self.fill(&t.contents, refs, unsupported);
                return;
            }
            K::EventSubProcess(s) => {
                self.fill(&s.contents, refs, unsupported);
                return;
            }
            K::ExclusiveGateway(g) | K::InclusiveGateway(g) => {
                let mut gw = gateway(b);
                gw.default_flow = g.default.clone();
                if matches!(fe, K::ExclusiveGateway(_)) {
                    FlowElement::ExclusiveGateway(gw)
                } else {
                    FlowElement::InclusiveGateway(gw)
                }
            }
            K::ParallelGateway(_) => FlowElement::ParallelGateway(gateway(b)),
            K::EventBasedGateway(_) => FlowElement::EventBasedGateway(gateway(b)),
            K::DataObject(_) | K::DataObjectReference(_) | K::DataStoreReference(_) => return,
        };
        if let Some(d) = details(b, &x) {
            self.details.insert(id.to_owned(), d);
        }
        self.insert(id, element);
    }

    /// Mark the default flow of every exclusive and inclusive gateway in the scope, and in
    /// its sub-processes at every depth.
    fn mark_default_flows(&mut self) {
        mark_defaults(&mut self.elements, &mut self.flows);
    }
}

fn mark_defaults(elements: &mut HashMap<String, FlowElement>, flows: &mut [SequenceFlow]) {
    let defaults: Vec<&str> = elements
        .values()
        .filter_map(|el| match el {
            FlowElement::ExclusiveGateway(gw) | FlowElement::InclusiveGateway(gw) => {
                gw.default_flow.as_deref()
            }
            _ => None,
        })
        .collect();
    for flow in flows.iter_mut() {
        if defaults.contains(&flow.id.as_str()) {
            flow.is_default = true;
        }
    }
    for el in elements.values_mut() {
        if let FlowElement::SubProcess(sp) = el {
            mark_defaults(&mut sp.elements, &mut sp.sequence_flows);
        }
    }
}

fn sub_process(
    b: &kit::BpmnFlowNodeBase,
    contents: &kit::BpmnProcessContents,
    refs: &Refs,
    unsupported: &mut Vec<UnsupportedElement>,
    x: &Ext,
) -> (SubProcess, HashMap<String, ElementDetails>) {
    let mut inner = Scope::default();
    inner.fill(contents, refs, unsupported);
    inner.mark_default_flows();
    let mut sp = SubProcess::new(b.id.clone());
    sp.name = b.name.clone();
    sp.incoming = b.incoming.clone();
    sp.outgoing = b.outgoing.clone();
    sp.input_mappings = x.inputs();
    sp.output_mappings = x.outputs();
    sp.is_for_compensation = compensation(b);
    sp.elements = inner.elements;
    sp.sequence_flows = inner.flows;
    sp.start_events = inner.start_events;
    sp.associations = inner.associations;
    sp.element_order = inner.order;
    (sp, inner.details)
}

fn gateway(b: &kit::BpmnFlowNodeBase) -> Gateway {
    let mut gw = Gateway::new(b.id.clone());
    gw.name = b.name.clone();
    gw.incoming = b.incoming.clone();
    gw.outgoing = b.outgoing.clone();
    gw
}

fn attr(e: &XmlElement, name: &str) -> Option<String> {
    e.attr(name).map(str::to_owned)
}

fn non_empty(value: &str, default: &str) -> String {
    if value.is_empty() { default } else { value }.to_owned()
}

fn compensation(b: &kit::BpmnFlowNodeBase) -> bool {
    b.is_for_compensation == Some(true)
}

/// The Zeebe extension elements of one flow node: typed where the shared model reads them the
/// way Reebe needs, raw otherwise.
struct Ext<'a> {
    raw: &'a [XmlElement],
    zeebe: kit::zeebe::ZeebeExtensions,
}

impl<'a> Ext<'a> {
    fn new(b: &'a kit::BpmnFlowNodeBase) -> Self {
        Self {
            raw: &b.extension_elements,
            zeebe: get_zeebe_extensions(&b.extension_elements),
        }
    }

    /// The last extension element with this local name, as a later one overrides an earlier.
    fn child(&self, tag: &str) -> Option<&'a XmlElement> {
        self.raw.iter().rev().find(|e| e.local_name() == tag)
    }

    fn inputs(&self) -> Vec<ZeebeIoMapping> {
        self.zeebe
            .io_mapping
            .iter()
            .flat_map(|m| &m.inputs)
            .map(io)
            .collect()
    }

    fn outputs(&self) -> Vec<ZeebeIoMapping> {
        self.zeebe
            .io_mapping
            .iter()
            .flat_map(|m| &m.outputs)
            .map(io)
            .collect()
    }

    fn task_definition(&self) -> Option<ZeebeTaskDefinition> {
        self.child("taskDefinition").map(|d| ZeebeTaskDefinition {
            job_type: attr(d, "type").unwrap_or_default(),
            retries: attr(d, "retries").unwrap_or_else(|| "3".into()),
            timeout: attr(d, "timeout"),
        })
    }

    /// Headers missing a key or a value are dropped.
    fn task_headers(&self) -> Vec<(String, String)> {
        self.raw
            .iter()
            .filter(|e| e.local_name() == "taskHeaders")
            .flat_map(|h| &h.children)
            .filter(|h| h.local_name() == "header")
            .filter_map(|h| Some((attr(h, "key")?, attr(h, "value")?)))
            .collect()
    }

    fn execution_listeners(&self) -> Vec<ZeebeExecutionListener> {
        self.zeebe
            .execution_listeners
            .iter()
            .flatten()
            .map(|l| ZeebeExecutionListener {
                event_type: if l.event_type == "end" {
                    ExecutionListenerEventType::End
                } else {
                    ExecutionListenerEventType::Start
                },
                job_type: l.type_.clone(),
                retries: l.retries.clone().unwrap_or_else(|| "3".into()),
            })
            .collect()
    }

    /// `zeebe:subscription` on the event itself.
    fn subscription_key(&self) -> Option<String> {
        self.child("subscription")
            .map(|s| attr(s, "correlationKey").unwrap_or_default())
    }
}

fn io(e: &kit::zeebe::ZeebeIoMappingEntry) -> ZeebeIoMapping {
    ZeebeIoMapping {
        source: e.source.clone(),
        target: e.target.clone(),
    }
}

/// Documentation (the first one counts, as in bpmn-js) and `zeebe:property` entries.
fn details(b: &kit::BpmnFlowNodeBase, x: &Ext) -> Option<ElementDetails> {
    let properties: Vec<(String, String)> = x
        .raw
        .iter()
        .filter(|e| e.local_name() == "properties")
        .flat_map(|p| &p.children)
        .filter(|p| p.local_name() == "property")
        .filter_map(|p| Some((attr(p, "name")?, attr(p, "value").unwrap_or_default())))
        .collect();
    if b.documentation.is_none() && properties.is_empty() {
        return None;
    }
    Some(ElementDetails {
        documentation: b.documentation.as_ref().map(|d| d.trim().to_owned()),
        properties,
    })
}

/// A Zeebe multi-instance activity needs `zeebe:loopCharacteristics`; a bare BPMN loop is none.
fn multi_instance(
    l: Option<&kit::BpmnMultiInstanceLoopCharacteristics>,
) -> Option<MultiInstanceLoopCharacteristics> {
    let l = l?;
    let z = l
        .extension_elements
        .iter()
        .rev()
        .find(|e| e.local_name() == "loopCharacteristics")?;
    Some(MultiInstanceLoopCharacteristics {
        is_sequential: l.is_sequential.unwrap_or(false),
        input_collection: attr(z, "inputCollection").unwrap_or_default(),
        input_element: attr(z, "inputElement"),
        output_collection: attr(z, "outputCollection"),
        output_element: attr(z, "outputElement"),
        completion_condition: l
            .completion_condition
            .as_ref()
            .map(|c| c.text.trim().to_owned())
            .or_else(|| attr(z, "completionCondition")),
    })
}

/// The event's last definition Reebe executes; conditional and cancel ones are not.
fn event_definition(
    defs: &[kit::BpmnEventDefinition],
    x: &Ext,
    refs: &Refs,
    own_subscription: bool,
) -> Option<EventDefinition> {
    use kit::BpmnEventDefinition as D;
    defs.iter()
        .filter_map(|d| match d {
            D::Timer(t) => Some(EventDefinition::Timer(timer(t))),
            D::Message(m) => {
                let r = m.message_ref.as_deref();
                let name = r
                    .and_then(|r| refs.messages.get(r))
                    .map(|n| (*n).to_owned())
                    .unwrap_or_default();
                // A subscription on the event itself wins over the message's own.
                let key = own_subscription
                    .then(|| x.subscription_key())
                    .flatten()
                    .or_else(|| r.and_then(|r| refs.message_keys.get(r)).cloned());
                Some(EventDefinition::Message(MessageEventDefinition {
                    message_name: name,
                    correlation_key: key,
                }))
            }
            D::Signal(s) => {
                let name = s
                    .signal_ref
                    .as_deref()
                    .map(|r| refs.signals.get(r).map_or(r, |n| *n).to_owned());
                Some(EventDefinition::Signal(SignalEventDefinition {
                    signal_name: name.unwrap_or_default(),
                }))
            }
            D::Error(e) => Some(EventDefinition::Error(ErrorEventDefinition {
                error_code: e
                    .error_ref
                    .as_deref()
                    .map(|r| refs.error_codes.get(r).map_or(r, |c| *c).to_owned()),
                error_message_variable: None,
                error_code_variable: None,
            })),
            D::Escalation(e) => Some(EventDefinition::Escalation(EscalationEventDefinition {
                escalation_code: e
                    .escalation_ref
                    .as_deref()
                    .map(|r| refs.escalation_codes.get(r).map_or(r, |c| *c).to_owned()),
            })),
            D::Terminate(_) => Some(EventDefinition::Terminate),
            D::Compensate(c) => Some(EventDefinition::Compensation(CompensationEventDefinition {
                activity_ref: c.activity_ref.clone().filter(|r| !r.is_empty()),
            })),
            D::Link(l) => Some(EventDefinition::Link(l.name.clone().unwrap_or_default())),
            D::Conditional(_) | D::Cancel(_) => None,
        })
        .next_back()
}

/// The timer's expression: the first non-empty of duration, date and cycle.
fn timer(t: &kit::BpmnTimerEventDefinition) -> TimerEventDefinition {
    [
        (TimerType::Duration, &t.time_duration),
        (TimerType::Date, &t.time_date),
        (TimerType::Cycle, &t.time_cycle),
    ]
    .into_iter()
    .find_map(|(timer_type, text)| {
        let expression = text.as_deref()?.trim();
        (!expression.is_empty()).then(|| TimerEventDefinition {
            timer_type,
            expression: expression.to_owned(),
        })
    })
    .unwrap_or(TimerEventDefinition {
        timer_type: TimerType::Duration,
        expression: String::new(),
    })
}
