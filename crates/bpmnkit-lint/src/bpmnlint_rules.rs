//! Native equivalents of bpmnlint rules (`@bpmnkit/core`'s `optimize/bpmnlint-rules.ts`).
//!
//! Opt-in: nothing here runs unless a `.bpmnlintrc` enables the rule it stands in for.
//! Every rule walks every scope (processes and the sub-processes nested in them), and
//! connectivity is read from each scope's sequence flows, not `<incoming>`/`<outgoing>`.

use crate::js::number_to_string;
use crate::{Category, Finding, FindingData, Severity};
use bpmnkit_bpmn::{
    BpmnBounds, BpmnDefinitions, BpmnDiShape, BpmnEventDefinition, BpmnFlowElement, BpmnLane,
    BpmnProcessContents, BpmnSequenceFlow,
};
use bpmnkit_form::Json;
use bpmnkit_spec::lint as spec;
use indexmap::IndexMap;
use std::collections::HashMap;

/// The bpmnlint rules implemented natively, in check order (from the spec).
pub static NATIVE_BPMNLINT_RULES: &[&str] = spec::NATIVE_ORDER;

// ---------------------------------------------------------------------------
// Scopes
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Kind {
    Process,
    SubProcess,
    AdHocSubProcess,
    EventSubProcess,
    Transaction,
}

struct Scope<'a> {
    id: &'a str,
    contents: &'a BpmnProcessContents,
    kind: Kind,
    /// The top-level process the scope belongs to.
    process_id: &'a str,
    executable: bool,
    event_sub_process: bool,
    by_source: HashMap<&'a str, Vec<&'a BpmnSequenceFlow>>,
    by_target: HashMap<&'a str, Vec<&'a BpmnSequenceFlow>>,
}

impl<'a> Scope<'a> {
    fn outgoing(&self, id: &str) -> &[&'a BpmnSequenceFlow] {
        self.by_source.get(id).map_or(&[], Vec::as_slice)
    }

    fn incoming(&self, id: &str) -> &[&'a BpmnSequenceFlow] {
        self.by_target.get(id).map_or(&[], Vec::as_slice)
    }
}

fn kind_of(el: &BpmnFlowElement) -> Option<Kind> {
    match el {
        BpmnFlowElement::SubProcess(_) => Some(Kind::SubProcess),
        BpmnFlowElement::AdHocSubProcess(_) => Some(Kind::AdHocSubProcess),
        BpmnFlowElement::EventSubProcess(_) => Some(Kind::EventSubProcess),
        BpmnFlowElement::Transaction(_) => Some(Kind::Transaction),
        _ => None,
    }
}

fn is_sub_container(el: &BpmnFlowElement) -> bool {
    el.contents().is_some()
}

fn is_event_sub_process(el: &BpmnFlowElement) -> bool {
    match el {
        BpmnFlowElement::EventSubProcess(_) => true,
        BpmnFlowElement::SubProcess(s) => s.triggered_by_event == Some(true),
        _ => false,
    }
}

/// Every process and every sub-process nested in it, outermost first.
fn all_scopes(defs: &BpmnDefinitions) -> Vec<Scope<'_>> {
    fn visit<'a>(
        scopes: &mut Vec<Scope<'a>>,
        id: &'a str,
        contents: &'a BpmnProcessContents,
        kind: Kind,
        event_sub_process: bool,
        process_id: &'a str,
        executable: bool,
    ) {
        let mut by_source: HashMap<&str, Vec<&BpmnSequenceFlow>> = HashMap::new();
        let mut by_target: HashMap<&str, Vec<&BpmnSequenceFlow>> = HashMap::new();
        for flow in &contents.sequence_flows {
            by_source.entry(&flow.source_ref).or_default().push(flow);
            by_target.entry(&flow.target_ref).or_default().push(flow);
        }
        scopes.push(Scope {
            id,
            contents,
            kind,
            process_id,
            executable,
            event_sub_process,
            by_source,
            by_target,
        });
        for el in &contents.flow_elements {
            if let (Some(kind), Some(inner)) = (kind_of(el), el.contents()) {
                visit(
                    scopes,
                    &el.base().id,
                    inner,
                    kind,
                    is_event_sub_process(el),
                    process_id,
                    executable,
                );
            }
        }
    }
    let mut scopes = vec![];
    for p in &defs.processes {
        visit(
            &mut scopes,
            &p.id,
            &p.contents,
            Kind::Process,
            false,
            &p.id,
            p.is_executable == Some(true),
        );
    }
    scopes
}

// ---------------------------------------------------------------------------
// Element classification (bpmn-moddle's type hierarchy, flattened)
// ---------------------------------------------------------------------------

fn is_event(el: &BpmnFlowElement) -> bool {
    use BpmnFlowElement::*;
    matches!(
        el,
        StartEvent(_)
            | EndEvent(_)
            | IntermediateThrowEvent(_)
            | IntermediateCatchEvent(_)
            | BoundaryEvent(_)
    )
}

/// `bpmn:Task` and its subtypes — call activities and sub-processes are not tasks.
fn is_task(el: &BpmnFlowElement) -> bool {
    use BpmnFlowElement::*;
    matches!(
        el,
        Task(_)
            | ServiceTask(_)
            | ScriptTask(_)
            | UserTask(_)
            | SendTask(_)
            | ReceiveTask(_)
            | BusinessRuleTask(_)
            | ManualTask(_)
    )
}

fn is_gateway(el: &BpmnFlowElement) -> bool {
    use BpmnFlowElement::*;
    matches!(
        el,
        ExclusiveGateway(_)
            | ParallelGateway(_)
            | InclusiveGateway(_)
            | EventBasedGateway(_)
            | ComplexGateway(_)
    )
}

fn is_activity(el: &BpmnFlowElement) -> bool {
    is_task(el) || matches!(el, BpmnFlowElement::CallActivity(_)) || is_sub_container(el)
}

fn is_flow_node(el: &BpmnFlowElement) -> bool {
    is_event(el) || is_activity(el) || is_gateway(el)
}

fn event_definitions(el: &BpmnFlowElement) -> &[BpmnEventDefinition] {
    use BpmnFlowElement::*;
    match el {
        StartEvent(e) => &e.event_definitions,
        EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => &e.event_definitions,
        BoundaryEvent(e) => &e.event_definitions,
        _ => &[],
    }
}

fn definition_type(d: &BpmnEventDefinition) -> &'static str {
    use BpmnEventDefinition::*;
    match d {
        Timer(_) => "timer",
        Error(_) => "error",
        Escalation(_) => "escalation",
        Message(_) => "message",
        Signal(_) => "signal",
        Conditional(_) => "conditional",
        Link(_) => "link",
        Cancel(_) => "cancel",
        Terminate(_) => "terminate",
        Compensate(_) => "compensate",
    }
}

/// The default flow id: gateways model it, other elements keep it in `unknownAttributes`.
fn default_flow_of(el: Option<&BpmnFlowElement>) -> Option<&str> {
    let el = el?;
    use BpmnFlowElement::*;
    if let ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) = el {
        if let Some(d) = &g.default {
            return Some(d);
        }
    }
    el.base()
        .unknown_attributes
        .get("default")
        .map(String::as_str)
}

fn has_condition(flow: &BpmnSequenceFlow) -> bool {
    flow.condition_expression.is_some()
}

/// The default flow as bpmn-moddle reads it: only activities and exclusive, inclusive and
/// complex gateways have a `default` property.
fn modelled_default_of(el: &BpmnFlowElement) -> Option<&str> {
    use BpmnFlowElement::*;
    let has_default = is_activity(el)
        || matches!(
            el,
            ExclusiveGateway(_) | InclusiveGateway(_) | ComplexGateway(_)
        );
    if has_default {
        default_flow_of(Some(el))
    } else {
        None
    }
}

/// Has event definitions, all of one type.
fn only_definitions(el: &BpmnFlowElement, ty: &str) -> bool {
    let defs = event_definitions(el);
    !defs.is_empty() && defs.iter().all(|d| definition_type(d) == ty)
}

fn is_blank(name: Option<&str>) -> bool {
    crate::js::trim(name.unwrap_or("")).is_empty()
}

fn for_compensation(el: &BpmnFlowElement) -> bool {
    el.base().is_for_compensation == Some(true)
}

fn id(el: &BpmnFlowElement) -> &str {
    &el.base().id
}

fn name(el: &BpmnFlowElement) -> Option<&str> {
    el.base().name.as_deref()
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

struct Report<'a> {
    category: Category,
    findings: &'a mut Vec<Finding>,
}

impl Report<'_> {
    fn add(
        &mut self,
        id: &str,
        message: String,
        suggestion: &str,
        process_id: &str,
        element_ids: &[&str],
    ) {
        self.findings.push(Finding::new(FindingData {
            id: id.into(),
            category: self.category,
            severity: Severity::Warning,
            message,
            suggestion: suggestion.into(),
            process_id: process_id.into(),
            element_ids: element_ids.iter().map(|s| s.to_string()).collect(),
            produces: None,
            consumes: None,
            bpmnlint_rule: None,
        }));
    }
}

fn is_sub_scope(kind: Kind) -> bool {
    matches!(
        kind,
        Kind::SubProcess | Kind::EventSubProcess | Kind::Transaction
    )
}

fn run_rule(
    name: &str,
    defs: &BpmnDefinitions,
    scopes: &[Scope],
    options: Option<&Json>,
    r: &mut Report,
) -> bool {
    match name {
        "ad-hoc-sub-process" => {
            for s in scopes.iter().filter(|s| s.kind == Kind::AdHocSubProcess) {
                for el in &s.contents.flow_elements {
                    let what = match el {
                        BpmnFlowElement::StartEvent(_) => "Start",
                        BpmnFlowElement::EndEvent(_) => "End",
                        _ => continue,
                    };
                    r.add(
                        "flow/ad-hoc-start-end-event",
                        format!("{what} event \"{}\" is not allowed in ad-hoc sub-process \"{}\".", id(el), s.id),
                        "Remove it — an ad-hoc sub-process has no start or end events; its activities run on demand.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "conditional-event" => {
            for s in scopes.iter().filter(|s| s.executable) {
                for el in &s.contents.flow_elements {
                    let def = event_definitions(el).iter().find_map(|d| match d {
                        BpmnEventDefinition::Conditional(c) => Some(c),
                        _ => None,
                    });
                    let Some(def) = def else { continue };
                    if !crate::js::trim(def.condition.as_deref().unwrap_or("")).is_empty() {
                        continue;
                    }
                    r.add(
                        "flow/conditional-event-no-condition",
                        format!("Conditional event \"{}\" has no condition.", id(el)),
                        "Add the condition that should trigger the event.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "conditional-flows" => {
            for s in scopes {
                for el in &s.contents.flow_elements {
                    let outgoing = s.outgoing(id(el));
                    let default_flow = modelled_default_of(el);
                    if default_flow.is_none() && !outgoing.iter().any(|f| has_condition(f)) {
                        continue;
                    }
                    for flow in outgoing {
                        if has_condition(flow) || Some(flow.id.as_str()) == default_flow {
                            continue;
                        }
                        r.add(
                            "feel/missing-condition",
                            format!(
                                "Sequence flow \"{}\" leaves \"{}\", which routes by condition, but has no condition and is not the default flow.",
                                flow.id,
                                id(el)
                            ),
                            "Add a condition expression, or make this flow the default.",
                            s.process_id,
                            &[&flow.id],
                        );
                    }
                }
            }
        }
        "end-event-required" | "start-event-required" => {
            let start = name == "start-event-required";
            for s in scopes.iter().filter(|s| is_sub_scope(s.kind)) {
                let found = s.contents.flow_elements.iter().any(|el| {
                    if start {
                        matches!(el, BpmnFlowElement::StartEvent(_))
                    } else {
                        matches!(el, BpmnFlowElement::EndEvent(_))
                    }
                });
                if found {
                    continue;
                }
                if start {
                    r.add(
                        "flow/sub-process-no-start-event",
                        format!("Sub-process \"{}\" has no start event.", s.id),
                        "Add a start event so it is clear where the sub-process begins.",
                        s.process_id,
                        &[s.id],
                    );
                } else {
                    r.add(
                        "flow/sub-process-no-end-event",
                        format!("Sub-process \"{}\" has no end event.", s.id),
                        "Add an end event so the sub-process completes explicitly.",
                        s.process_id,
                        &[s.id],
                    );
                }
            }
        }
        "event-based-gateway" => {
            for s in scopes {
                for el in &s.contents.flow_elements {
                    if !matches!(el, BpmnFlowElement::EventBasedGateway(_)) {
                        continue;
                    }
                    let outgoing = s.outgoing(id(el));
                    if outgoing.len() < 2 {
                        r.add(
                            "flow/event-gateway-invalid",
                            format!(
                                "Event-based gateway \"{}\" has {} outgoing flow{}; it needs at least 2.",
                                id(el),
                                outgoing.len(),
                                if outgoing.len() == 1 { "" } else { "s" }
                            ),
                            "Connect the gateway to two or more catch events — it waits for the first of them.",
                            s.process_id,
                            &[id(el)],
                        );
                    }
                    for flow in outgoing.iter().filter(|f| has_condition(f)) {
                        r.add(
                            "flow/event-gateway-invalid",
                            format!(
                                "Sequence flow \"{}\" leaves event-based gateway \"{}\" with a condition.",
                                flow.id,
                                id(el)
                            ),
                            "Remove the condition — the event that arrives first decides the path.",
                            s.process_id,
                            &[&flow.id],
                        );
                    }
                }
            }
        }
        "event-sub-process-typed-start-event" => {
            for s in scopes.iter().filter(|s| s.event_sub_process) {
                for el in &s.contents.flow_elements {
                    let BpmnFlowElement::StartEvent(e) = el else {
                        continue;
                    };
                    if !e.event_definitions.is_empty() {
                        continue;
                    }
                    r.add(
                        "flow/event-sub-process-untyped-start",
                        format!("Start event \"{}\" of event sub-process \"{}\" has no event definition.", id(el), s.id),
                        "Give the start event a trigger (message, timer, error, signal, …).",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "fake-join" => {
            for s in scopes {
                for el in &s.contents.flow_elements {
                    if !is_activity(el) && !is_event(el) {
                        continue;
                    }
                    // `flow/multi-incoming-task` already covers the top level, except start events.
                    if s.kind == Kind::Process && !matches!(el, BpmnFlowElement::StartEvent(_)) {
                        continue;
                    }
                    let incoming = s.incoming(id(el)).len();
                    if incoming <= 1 {
                        continue;
                    }
                    r.add(
                        "flow/multi-incoming-task",
                        format!(
                            "Element \"{}\" ({}) has {incoming} incoming flows, which do not join.",
                            id(el),
                            el.type_name()
                        ),
                        "Join the flows with a gateway before this element.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "global" => check_global(defs, scopes, r),
        "label-required" => check_labels(defs, scopes, r),
        "link-event" => check_links(scopes, r),
        "no-bpmndi" => check_bpmndi(defs, r),
        "no-complex-gateway" => discouraged(
            scopes,
            r,
            "complexGateway",
            "pattern/complex-gateway",
            "complex gateway",
        ),
        "no-inclusive-gateway" => discouraged(
            scopes,
            r,
            "inclusiveGateway",
            "pattern/inclusive-gateway",
            "inclusive gateway",
        ),
        "no-disconnected" => {
            for s in scopes.iter().filter(|s| s.kind != Kind::AdHocSubProcess) {
                for el in &s.contents.flow_elements {
                    let checked =
                        is_task(el) || is_gateway(el) || is_sub_container(el) || is_event(el);
                    if !checked || is_event_sub_process(el) || for_compensation(el) {
                        continue;
                    }
                    let defs = event_definitions(el);
                    if matches!(el, BpmnFlowElement::BoundaryEvent(_))
                        && defs.len() == 1
                        && matches!(defs[0], BpmnEventDefinition::Compensate(_))
                    {
                        continue;
                    }
                    if !s.incoming(id(el)).is_empty() || !s.outgoing(id(el)).is_empty() {
                        continue;
                    }
                    r.add(
                        "flow/disconnected",
                        format!(
                            "Element \"{}\" ({}) is not connected to any sequence flow.",
                            id(el),
                            el.type_name()
                        ),
                        "Connect it to the process flow or remove it.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "no-duplicate-sequence-flows" => {
            for s in scopes {
                let mut seen = std::collections::HashSet::new();
                for flow in &s.contents.sequence_flows {
                    let key = format!(
                        "{}#{}#{}",
                        flow.source_ref,
                        flow.target_ref,
                        flow.condition_expression
                            .as_ref()
                            .map_or("", |c| c.text.as_str())
                    );
                    if seen.insert(key) {
                        continue;
                    }
                    r.add(
                        "flow/duplicate-sequence-flow",
                        format!(
                            "Sequence flow \"{}\" duplicates another flow from \"{}\" to \"{}\".",
                            flow.id, flow.source_ref, flow.target_ref
                        ),
                        "Remove the duplicate — two identical flows spawn two tokens.",
                        s.process_id,
                        &[&flow.id, &flow.source_ref, &flow.target_ref],
                    );
                }
            }
        }
        "no-gateway-join-fork" | "superfluous-gateway" => {
            let mixed = name == "no-gateway-join-fork";
            // `optimize()` covers the top level.
            for s in scopes.iter().filter(|s| s.kind != Kind::Process) {
                for el in s.contents.flow_elements.iter().filter(|el| is_gateway(el)) {
                    let incoming = s.incoming(id(el)).len();
                    let outgoing = s.outgoing(id(el)).len();
                    if mixed && incoming > 1 && outgoing > 1 {
                        r.add(
                            "flow/mixed-gateway",
                            format!(
                                "Gateway \"{}\" ({}) has {incoming} incoming and {outgoing} outgoing flows — it both joins and forks.",
                                id(el),
                                el.type_name()
                            ),
                            "Split it into a joining gateway followed by a forking one.",
                            s.process_id,
                            &[id(el)],
                        );
                    } else if !mixed && incoming == 1 && outgoing == 1 {
                        r.add(
                            "flow/redundant-gateway",
                            format!(
                                "Gateway \"{}\" ({}) has only 1 incoming and 1 outgoing flow — it is redundant.",
                                id(el),
                                el.type_name()
                            ),
                            "Remove this gateway and connect its source directly to its target.",
                            s.process_id,
                            &[id(el)],
                        );
                    }
                }
            }
        }
        "no-implicit-end" => {
            let mut processes = HashMap::new();
            for p in &defs.processes {
                processes.insert(p.id.as_str(), p);
            }
            for s in scopes.iter().filter(|s| s.kind != Kind::AdHocSubProcess) {
                // bpmnlint looks for a compensation handler's association in the enclosing
                // process only, not in the sub-process that holds the event.
                let associations = processes
                    .get(s.process_id)
                    .map_or(&[][..], |p| p.contents.associations.as_slice());
                for el in &s.contents.flow_elements {
                    if !is_flow_node(el)
                        || matches!(el, BpmnFlowElement::EndEvent(_))
                        || is_event_sub_process(el)
                    {
                        continue;
                    }
                    if matches!(el, BpmnFlowElement::IntermediateThrowEvent(_))
                        && only_definitions(el, "link")
                    {
                        continue;
                    }
                    if is_activity(el) && for_compensation(el) {
                        continue;
                    }
                    if matches!(el, BpmnFlowElement::BoundaryEvent(_))
                        && only_definitions(el, "compensate")
                        && associations.iter().any(|a| a.source_ref == id(el))
                    {
                        continue;
                    }
                    if !s.outgoing(id(el)).is_empty() {
                        continue;
                    }
                    r.add(
                        "flow/implicit-end",
                        format!(
                            "Element \"{}\" ({}) has no outgoing sequence flow, so it ends the flow implicitly.",
                            id(el),
                            el.type_name()
                        ),
                        "Connect it to an end event.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "no-implicit-start" => {
            for s in scopes.iter().filter(|s| s.kind != Kind::AdHocSubProcess) {
                for el in &s.contents.flow_elements {
                    if !is_flow_node(el) || is_event_sub_process(el) {
                        continue;
                    }
                    if matches!(
                        el,
                        BpmnFlowElement::StartEvent(_) | BpmnFlowElement::BoundaryEvent(_)
                    ) {
                        continue;
                    }
                    if matches!(el, BpmnFlowElement::IntermediateCatchEvent(_))
                        && only_definitions(el, "link")
                    {
                        continue;
                    }
                    if is_activity(el) && for_compensation(el) {
                        continue;
                    }
                    if !s.incoming(id(el)).is_empty() {
                        continue;
                    }
                    r.add(
                        "flow/implicit-start",
                        format!(
                            "Element \"{}\" ({}) has no incoming sequence flow, so it starts the flow implicitly.",
                            id(el),
                            el.type_name()
                        ),
                        "Connect it from a start event or an upstream element.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "no-implicit-split" => {
            for s in scopes {
                for el in &s.contents.flow_elements {
                    if !is_activity(el) && !is_event(el) {
                        continue;
                    }
                    let default_flow = default_flow_of(Some(el));
                    let unconditional = s
                        .outgoing(id(el))
                        .iter()
                        .filter(|f| !has_condition(f) && Some(f.id.as_str()) != default_flow)
                        .count();
                    if unconditional <= 1 {
                        continue;
                    }
                    r.add(
                        "flow/implicit-split",
                        format!(
                            "Element \"{}\" ({}) splits the flow implicitly into {unconditional} unconditional flows.",
                            id(el),
                            el.type_name()
                        ),
                        "Model the split with an explicit parallel gateway.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "no-overlapping-elements" => check_overlaps(defs, r),
        "single-blank-start-event" => {
            for s in scopes {
                let blank = s
                    .contents
                    .flow_elements
                    .iter()
                    .filter(|el| matches!(el, BpmnFlowElement::StartEvent(e) if e.event_definitions.is_empty()))
                    .count();
                if blank <= 1 {
                    continue;
                }
                let what = if s.kind == Kind::Process {
                    "Process"
                } else {
                    "Sub-process"
                };
                r.add(
                    "flow/multiple-blank-start-events",
                    format!("{what} \"{}\" has {blank} blank start events.", s.id),
                    "Keep one blank start event per scope; give the others a trigger or remove them.",
                    s.process_id,
                    &[s.id],
                );
            }
        }
        "single-event-definition" => {
            for s in scopes {
                for el in &s.contents.flow_elements {
                    let count = event_definitions(el).len();
                    if count <= 1 {
                        continue;
                    }
                    r.add(
                        "flow/multiple-event-definitions",
                        format!("Event \"{}\" has {count} event definitions.", id(el)),
                        "Keep one event definition per event; split the others into separate events.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "standard-size" => check_standard_sizes(defs, scopes, options, r),
        "sub-process-blank-start-event" => {
            for s in scopes
                .iter()
                .filter(|s| s.kind != Kind::Process && !s.event_sub_process)
            {
                for el in &s.contents.flow_elements {
                    let BpmnFlowElement::StartEvent(e) = el else {
                        continue;
                    };
                    if e.event_definitions.is_empty() {
                        continue;
                    }
                    r.add(
                        "flow/sub-process-typed-start",
                        format!("Start event \"{}\" of sub-process \"{}\" has an event definition.", id(el), s.id),
                        "A sub-process is entered through its sequence flow — make the start event blank.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        "superfluous-label" => {
            for s in scopes {
                let mut by_id = HashMap::new();
                for el in &s.contents.flow_elements {
                    by_id.insert(id(el), el);
                }
                for flow in &s.contents.sequence_flows {
                    if is_blank(flow.name.as_deref()) || has_condition(flow) {
                        continue;
                    }
                    let source = by_id.get(flow.source_ref.as_str()).copied();
                    if default_flow_of(source) == Some(flow.id.as_str()) {
                        continue;
                    }
                    let decision_fork = source.is_some_and(|src| {
                        matches!(
                            src,
                            BpmnFlowElement::ExclusiveGateway(_)
                                | BpmnFlowElement::InclusiveGateway(_)
                        ) && s.outgoing(id(src)).len() > 1
                    });
                    if decision_fork {
                        continue;
                    }
                    r.add(
                        "naming/superfluous-flow-label",
                        format!(
                            "Sequence flow \"{}\" is labeled \"{}\" but carries no condition.",
                            flow.id,
                            flow.name.as_deref().unwrap_or("")
                        ),
                        "Remove the label — only conditional, default and decision-gateway flows need one.",
                        s.process_id,
                        &[&flow.id],
                    );
                }
            }
        }
        "superfluous-termination" => {
            let is_terminate = |el: &BpmnFlowElement| matches!(el, BpmnFlowElement::EndEvent(e) if e.event_definitions.iter().any(|d| matches!(d, BpmnEventDefinition::Terminate(_))));
            let is_interrupting_event_sub = |el: &BpmnFlowElement| {
                is_event_sub_process(el)
                    && el.contents().is_some_and(|c| {
                        c.flow_elements
                            .iter()
                            .any(|c| matches!(c, BpmnFlowElement::StartEvent(e) if e.is_interrupting != Some(false)))
                    })
            };
            for s in scopes.iter().filter(|s| s.kind != Kind::AdHocSubProcess) {
                let ends: Vec<&BpmnFlowElement> = s
                    .contents
                    .flow_elements
                    .iter()
                    .filter(|el| is_flow_node(el) && s.outgoing(id(el)).is_empty())
                    .collect();
                let terminates: Vec<&BpmnFlowElement> =
                    ends.iter().copied().filter(|el| is_terminate(el)).collect();
                if terminates.len() != 1 {
                    continue;
                }
                if !ends
                    .iter()
                    .all(|el| is_terminate(el) || is_interrupting_event_sub(el))
                {
                    continue;
                }
                for el in terminates {
                    r.add(
                        "flow/superfluous-termination",
                        format!(
                            "Terminate end event \"{}\" is the only way this scope ends, so terminating is superfluous.",
                            id(el)
                        ),
                        "Use a plain end event.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
        _ => return false,
    }
    true
}

fn discouraged(scopes: &[Scope], r: &mut Report, ty: &str, finding: &str, label: &str) {
    for s in scopes {
        for el in s
            .contents
            .flow_elements
            .iter()
            .filter(|el| el.type_name() == ty)
        {
            r.add(
                finding,
                format!(
                    "Element \"{}\" is a {label}, which this project's lint configuration discourages.",
                    id(el)
                ),
                "Model the routing with exclusive or parallel gateways instead.",
                s.process_id,
                &[id(el)],
            );
        }
    }
}

/// A root element's id and name.
type Named<'a> = (&'a str, Option<&'a str>);

fn check_global(defs: &BpmnDefinitions, scopes: &[Scope], r: &mut Report) {
    let mut referenced = std::collections::HashSet::new();
    for s in scopes {
        for el in &s.contents.flow_elements {
            for def in event_definitions(el) {
                let entry = match def {
                    BpmnEventDefinition::Error(d) => d.error_ref.as_ref().map(|x| ("error", x)),
                    BpmnEventDefinition::Escalation(d) => {
                        d.escalation_ref.as_ref().map(|x| ("escalation", x))
                    }
                    BpmnEventDefinition::Message(d) => {
                        d.message_ref.as_ref().map(|x| ("message", x))
                    }
                    BpmnEventDefinition::Signal(d) => d.signal_ref.as_ref().map(|x| ("signal", x)),
                    _ => None,
                };
                if let Some((kind, r)) = entry.filter(|(_, r)| !r.is_empty()) {
                    referenced.insert(format!("{kind}:{r}"));
                }
            }
            if let BpmnFlowElement::SendTask(t) | BpmnFlowElement::ReceiveTask(t) = el {
                if let Some(m) = t.message_ref.as_ref().filter(|m| !m.is_empty()) {
                    referenced.insert(format!("message:{m}"));
                }
            }
        }
    }
    for c in &defs.collaborations {
        for flow in &c.message_flows {
            if let Some(m) = flow.message_ref.as_ref().filter(|m| !m.is_empty()) {
                referenced.insert(format!("message:{m}"));
            }
        }
    }
    let groups: [(&str, Vec<Named>); 4] = [
        (
            "error",
            defs.errors
                .iter()
                .map(|e| (e.id.as_str(), e.name.as_deref()))
                .collect(),
        ),
        (
            "escalation",
            defs.escalations
                .iter()
                .map(|e| (e.id.as_str(), e.name.as_deref()))
                .collect(),
        ),
        (
            "message",
            defs.messages
                .iter()
                .map(|e| (e.id.as_str(), e.name.as_deref()))
                .collect(),
        ),
        (
            "signal",
            defs.signals
                .iter()
                .map(|e| (e.id.as_str(), e.name.as_deref()))
                .collect(),
        ),
    ];
    for (kind, elements) in &groups {
        for (eid, ename) in elements {
            // bpmnlint's `hasName` is `name?.trim() !== ""`: a missing name passes.
            if ename.is_some_and(|n| crate::js::trim(n).is_empty()) {
                r.add(
                    "pattern/global-element",
                    format!("Global {kind} \"{eid}\" has no name."),
                    &format!("Name the {kind} so the events referring to it say what they mean."),
                    &defs.id,
                    &[eid],
                );
            }
            if !referenced.contains(&format!("{kind}:{eid}")) {
                r.add(
                    "pattern/global-element",
                    format!("Global {kind} \"{eid}\" is not referenced by any element."),
                    &format!("Remove the unused {kind}, or reference it from the event that should use it."),
                    &defs.id,
                    &[eid],
                );
            }
            if elements.iter().filter(|(_, n)| n == ename).count() > 1 {
                r.add(
                    "pattern/global-element",
                    format!("Global {kind} \"{eid}\" shares its name with another {kind}."),
                    &format!("Give each {kind} a unique name, or reuse one {kind} instead of declaring it twice."),
                    &defs.id,
                    &[eid],
                );
            }
        }
    }
}

fn check_labels(defs: &BpmnDefinitions, scopes: &[Scope], r: &mut Report) {
    let missing = |r: &mut Report, id: &str, what: &str, process_id: &str| {
        r.add(
            "naming/missing-label",
            format!("{what} \"{id}\" has no label."),
            "Name it, so the diagram says what it does or means.",
            process_id,
            &[id],
        );
    };
    for c in &defs.collaborations {
        for p in &c.participants {
            if is_blank(p.name.as_deref()) {
                missing(r, &p.id, "Participant", &defs.id);
            }
        }
    }
    fn lanes(
        list: &[BpmnLane],
        process_id: &str,
        r: &mut Report,
        missing: &dyn Fn(&mut Report, &str, &str, &str),
    ) {
        for lane in list {
            if is_blank(lane.name.as_deref()) {
                missing(r, &lane.id, "Lane", process_id);
            }
            if let Some(child) = &lane.child_lane_set {
                lanes(&child.lanes, process_id, r, missing);
            }
        }
    }
    for p in &defs.processes {
        if let Some(set) = &p.lane_set {
            lanes(&set.lanes, &p.id, r, &missing);
        }
    }
    for s in scopes {
        for el in &s.contents.flow_elements {
            // Sub-processes, parallel and event-based gateways and joins need no label.
            if !is_flow_node(el) || is_sub_container(el) {
                continue;
            }
            if matches!(
                el,
                BpmnFlowElement::ParallelGateway(_) | BpmnFlowElement::EventBasedGateway(_)
            ) {
                continue;
            }
            if is_gateway(el) && s.outgoing(id(el)).len() <= 1 {
                continue;
            }
            if is_blank(name(el)) {
                missing(
                    r,
                    id(el),
                    &format!("{} element", el.type_name()),
                    s.process_id,
                );
            }
        }
        for flow in &s.contents.sequence_flows {
            if has_condition(flow) && is_blank(flow.name.as_deref()) {
                missing(r, &flow.id, "Conditional sequence flow", s.process_id);
            }
        }
    }
}

fn check_links(scopes: &[Scope], r: &mut Report) {
    let is_catch = |el: &BpmnFlowElement| {
        matches!(
            el,
            BpmnFlowElement::IntermediateCatchEvent(_)
                | BpmnFlowElement::StartEvent(_)
                | BpmnFlowElement::BoundaryEvent(_)
        )
    };
    for s in scopes {
        let mut by_name: IndexMap<&str, Vec<&BpmnFlowElement>> = IndexMap::new();
        for el in s.contents.flow_elements.iter().filter(|el| is_event(el)) {
            let def = event_definitions(el).iter().find_map(|d| match d {
                BpmnEventDefinition::Link(l) => Some(l),
                _ => None,
            });
            let Some(def) = def else { continue };
            let link = def.name.as_deref().unwrap_or("");
            if link.is_empty() {
                r.add(
                    "flow/link-event-mismatch",
                    format!("Link event \"{}\" has no link name.", id(el)),
                    "Name the link — a throw and its catch are paired by name.",
                    s.process_id,
                    &[id(el)],
                );
                continue;
            }
            by_name.entry(link).or_default().push(el);
        }
        for (link, events) in by_name {
            let catches: Vec<&BpmnFlowElement> =
                events.iter().copied().filter(|el| is_catch(el)).collect();
            if events.len() == 1 {
                let only = events[0];
                r.add(
                    "flow/link-event-mismatch",
                    format!(
                        "Link {} event with link name \"{link}\" is missing in this scope.",
                        if is_catch(only) { "throw" } else { "catch" }
                    ),
                    "Add the matching link event in the same process or sub-process.",
                    s.process_id,
                    &[id(only)],
                );
            } else if catches.len() > 1 {
                for el in catches {
                    r.add(
                        "flow/link-event-mismatch",
                        format!(
                            "Duplicate link catch event with link name \"{link}\" in this scope."
                        ),
                        "Keep one catch event per link name.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            } else if catches.is_empty() {
                for el in events {
                    r.add(
                        "flow/link-event-mismatch",
                        format!(
                            "Link catch event with link name \"{link}\" is missing in this scope."
                        ),
                        "Add a link catch event with the same name.",
                        s.process_id,
                        &[id(el)],
                    );
                }
            }
        }
    }
}

fn check_bpmndi(defs: &BpmnDefinitions, r: &mut Report) {
    let mut drawn = std::collections::HashSet::new();
    for d in &defs.diagrams {
        for shape in &d.plane.shapes {
            drawn.insert(shape.bpmn_element.as_str());
        }
        for edge in &d.plane.edges {
            drawn.insert(edge.bpmn_element.as_str());
        }
    }
    let missing = |r: &mut Report, id: &str, process_id: &str| {
        if drawn.contains(id) {
            return;
        }
        r.add(
            "pattern/missing-di",
            format!("Element \"{id}\" has no diagram information (BPMNDI)."),
            "Open and save the file in a modeler, or run `casen bpmn layout`, to draw it.",
            process_id,
            &[id],
        );
    };
    fn lanes(
        list: &[BpmnLane],
        process_id: &str,
        r: &mut Report,
        missing: &dyn Fn(&mut Report, &str, &str),
    ) {
        for lane in list {
            missing(r, &lane.id, process_id);
            if let Some(child) = &lane.child_lane_set {
                lanes(&child.lanes, process_id, r, missing);
            }
        }
    }
    fn container(
        c: &BpmnProcessContents,
        process_id: &str,
        r: &mut Report,
        missing: &dyn Fn(&mut Report, &str, &str),
    ) {
        for el in &c.flow_elements {
            if !matches!(el, BpmnFlowElement::DataObject(_)) {
                missing(r, id(el), process_id);
            }
            if let Some(inner) = el.contents() {
                container(inner, process_id, r, missing);
            }
        }
        for flow in &c.sequence_flows {
            missing(r, &flow.id, process_id);
        }
        artifacts(
            c.text_annotations.iter().map(|a| a.id.as_str()),
            c.associations.iter().map(|a| a.id.as_str()),
            c.groups.iter().map(|g| g.id.as_str()),
            process_id,
            r,
            missing,
        );
    }
    fn artifacts<'a>(
        annotations: impl Iterator<Item = &'a str>,
        associations: impl Iterator<Item = &'a str>,
        groups: impl Iterator<Item = &'a str>,
        process_id: &str,
        r: &mut Report,
        missing: &dyn Fn(&mut Report, &str, &str),
    ) {
        for id in annotations.chain(associations).chain(groups) {
            missing(r, id, process_id);
        }
    }
    for c in &defs.collaborations {
        for p in &c.participants {
            missing(r, &p.id, &defs.id);
        }
        for f in &c.message_flows {
            missing(r, &f.id, &defs.id);
        }
        artifacts(
            c.text_annotations.iter().map(|a| a.id.as_str()),
            c.associations.iter().map(|a| a.id.as_str()),
            c.groups.iter().map(|g| g.id.as_str()),
            &defs.id,
            r,
            &missing,
        );
    }
    for p in &defs.processes {
        container(&p.contents, &p.id, r, &missing);
        if let Some(set) = &p.lane_set {
            lanes(&set.lanes, &p.id, r, &missing);
        }
    }
}

// ---------------------------------------------------------------------------
// Geometry rules
// ---------------------------------------------------------------------------

fn valid_bounds(b: Option<&BpmnBounds>) -> Option<&BpmnBounds> {
    b.filter(|b| b.x.is_finite() && b.y.is_finite() && b.width.is_finite() && b.height.is_finite())
}

/// Touching counts as a collision, as it does in bpmnlint.
fn collides(a: &BpmnBounds, b: &BpmnBounds) -> bool {
    a.x + a.width >= b.x && b.x + b.width >= a.x && a.y + a.height >= b.y && b.y + b.height >= a.y
}

fn inside(child: &BpmnBounds, parent: &BpmnBounds) -> bool {
    child.x >= parent.x
        && child.y >= parent.y
        && child.x + child.width <= parent.x + parent.width
        && child.y + child.height <= parent.y + parent.height
}

fn shape_index(defs: &BpmnDefinitions) -> HashMap<&str, &BpmnDiShape> {
    let mut shapes = HashMap::new();
    for d in &defs.diagrams {
        for shape in &d.plane.shapes {
            shapes.insert(shape.bpmn_element.as_str(), shape);
        }
    }
    shapes
}

/// Records the pairs of `(id, attachedToRef)` elements whose shapes collide.
type Pairwise<'p> = dyn Fn(&[(&str, Option<&str>)], &str, &mut IndexMap<String, String>) + 'p;

fn check_overlaps(defs: &BpmnDefinitions, r: &mut Report) {
    let shapes = shape_index(defs);
    let mut overlapping: IndexMap<String, String> = IndexMap::new();
    let mut outside: IndexMap<String, String> = IndexMap::new();
    let bounds = |id: &str| shapes.get(id).map(|s| &s.bounds);

    // (id, attachedToRef)
    let pairwise = |elements: &[(&str, Option<&str>)],
                    process_id: &str,
                    overlapping: &mut IndexMap<String, String>| {
        for (i, a) in elements.iter().enumerate() {
            for b in &elements[i + 1..] {
                // A boundary event sits on its host by design.
                if a.1 == Some(b.0) || b.1 == Some(a.0) {
                    continue;
                }
                let (Some(ba), Some(bb)) = (valid_bounds(bounds(a.0)), valid_bounds(bounds(b.0)))
                else {
                    continue;
                };
                if !collides(ba, bb) {
                    continue;
                }
                overlapping.insert(a.0.to_owned(), process_id.to_owned());
                overlapping.insert(b.0.to_owned(), process_id.to_owned());
            }
        }
    };

    struct Ctx<'a, 'b> {
        shapes: &'b HashMap<&'a str, &'a BpmnDiShape>,
        overlapping: IndexMap<String, String>,
        outside: IndexMap<String, String>,
    }
    fn container<'a>(
        c: &'a BpmnProcessContents,
        process_id: &str,
        parent: Option<&BpmnBounds>,
        ctx: &mut Ctx<'a, '_>,
        pairwise: &Pairwise,
    ) {
        let drawn: Vec<&BpmnFlowElement> = c
            .flow_elements
            .iter()
            .filter(|el| ctx.shapes.contains_key(id(el)))
            .collect();
        let pairs: Vec<(&str, Option<&str>)> = drawn
            .iter()
            .map(|el| {
                let attached = match el {
                    BpmnFlowElement::BoundaryEvent(b) => Some(b.attached_to_ref.as_str()),
                    _ => None,
                };
                (id(el), attached)
            })
            .collect();
        pairwise(&pairs, process_id, &mut ctx.overlapping);
        for el in &drawn {
            // Data store references may sit outside their parent for historical reasons.
            if matches!(el, BpmnFlowElement::DataStoreReference(_)) {
                continue;
            }
            let b = valid_bounds(ctx.shapes.get(id(el)).map(|s| &s.bounds));
            if let (Some(b), Some(p)) = (b, valid_bounds(parent)) {
                if !inside(b, p) {
                    ctx.outside.insert(id(el).to_owned(), process_id.to_owned());
                }
            }
        }
        for el in &c.flow_elements {
            let Some(inner) = el.contents() else { continue };
            let shape = ctx.shapes.get(id(el)).copied();
            let parent = shape
                .filter(|s| s.is_expanded == Some(true))
                .map(|s| &s.bounds);
            container(inner, process_id, parent, ctx, pairwise);
        }
    }

    let mut participant_bounds: HashMap<&str, &BpmnBounds> = HashMap::new();
    for c in &defs.collaborations {
        let pairs: Vec<(&str, Option<&str>)> = c
            .participants
            .iter()
            .map(|p| (p.id.as_str(), None))
            .collect();
        pairwise(&pairs, &defs.id, &mut overlapping);
        for p in &c.participants {
            if let (Some(pr), Some(b)) = (
                p.process_ref.as_deref().filter(|s| !s.is_empty()),
                bounds(&p.id),
            ) {
                participant_bounds.insert(pr, b);
            }
        }
    }
    let mut ctx = Ctx {
        shapes: &shapes,
        overlapping: std::mem::take(&mut overlapping),
        outside: std::mem::take(&mut outside),
    };
    for p in &defs.processes {
        container(
            &p.contents,
            &p.id,
            participant_bounds.get(p.id.as_str()).copied(),
            &mut ctx,
            &pairwise,
        );
    }
    for (id, process_id) in &ctx.overlapping {
        r.add(
            "pattern/overlapping-elements",
            format!("Element \"{id}\" overlaps another element."),
            "Move the shapes apart so neither hides the other.",
            process_id,
            &[id],
        );
    }
    for (id, process_id) in &ctx.outside {
        r.add(
            "pattern/overlapping-elements",
            format!("Element \"{id}\" lies outside its parent's boundary."),
            "Move it inside the pool or sub-process it belongs to.",
            process_id,
            &[id],
        );
    }
}

#[derive(Clone, Copy)]
struct Size {
    width: Option<f64>,
    height: Option<f64>,
}

fn size_type(el: &BpmnFlowElement) -> Option<&'static str> {
    if is_sub_container(el) {
        return Some("bpmn:SubProcess");
    }
    if matches!(el, BpmnFlowElement::CallActivity(_)) {
        return Some("bpmn:CallActivity");
    }
    if is_task(el) {
        return Some("bpmn:Task");
    }
    if is_gateway(el) {
        return Some("bpmn:Gateway");
    }
    if is_event(el) {
        return Some("bpmn:Event");
    }
    match el {
        BpmnFlowElement::DataObjectReference(_) => Some("bpmn:DataObjectReference"),
        BpmnFlowElement::DataStoreReference(_) => Some("bpmn:DataStoreReference"),
        _ => None,
    }
}

/// `{ ...DEFAULT_SIZES, ...overrides }[ty]`: `None` when the entry is missing or (for
/// `object_only`) not an object.
fn size_for(
    ty: &str,
    overrides: Option<&IndexMap<String, Json>>,
    object_only: bool,
) -> Option<Size> {
    if let Some(v) = overrides.and_then(|o| o.get(ty)) {
        let num = |m: &IndexMap<String, Json>, k: &str| match m.get(k) {
            Some(Json::Num(n)) => Some(*n),
            _ => None,
        };
        return match v {
            Json::Obj(m) => Some(Size {
                width: num(m, "width"),
                height: num(m, "height"),
            }),
            Json::Arr(_) => Some(Size {
                width: None,
                height: None,
            }),
            Json::Null => None,
            _ if object_only => None,
            _ => Some(Size {
                width: None,
                height: None,
            }),
        };
    }
    spec::standard_size_defaults()
        .iter()
        .find(|d| d.bpmn_type == ty)
        .map(|d| Size {
            width: Some(d.width as f64),
            height: Some(d.height as f64),
        })
}

fn check_standard_sizes(
    defs: &BpmnDefinitions,
    scopes: &[Scope],
    options: Option<&Json>,
    r: &mut Report,
) {
    let overrides = match options {
        Some(Json::Obj(m)) => Some(m),
        _ => None,
    };
    let mut elements: HashMap<&str, (&BpmnFlowElement, &str)> = HashMap::new();
    for s in scopes {
        for el in &s.contents.flow_elements {
            elements.insert(id(el), (el, s.process_id));
        }
    }
    let mut participants = HashMap::new();
    for c in &defs.collaborations {
        for p in &c.participants {
            participants.insert(p.id.as_str(), p);
        }
    }
    for d in &defs.diagrams {
        for shape in &d.plane.shapes {
            let mut process_id = defs.id.as_str();
            let expected = if let Some(p) = participants.get(shape.bpmn_element.as_str()) {
                // A pool with content follows its content; an empty one has one fixed breadth.
                if p.process_ref.as_deref().is_some_and(|s| !s.is_empty()) {
                    continue;
                }
                let size = size_for("bpmn:Participant", overrides, false);
                let horizontal = shape.is_horizontal != Some(false);
                let value = size.and_then(|s| if horizontal { s.height } else { s.width });
                let Some(value) = value else { continue };
                if horizontal {
                    Size {
                        width: None,
                        height: Some(value),
                    }
                } else {
                    Size {
                        width: Some(value),
                        height: None,
                    }
                }
            } else {
                let Some((el, pid)) = elements.get(shape.bpmn_element.as_str()) else {
                    continue;
                };
                if is_sub_container(el) && shape.is_expanded == Some(true) {
                    continue;
                }
                let Some(size) = size_type(el).and_then(|t| size_for(t, overrides, true)) else {
                    continue;
                };
                process_id = pid;
                size
            };
            let (width, height) = (shape.bounds.width, shape.bounds.height);
            let width_off = expected.width.is_some_and(|w| w != width);
            let height_off = expected.height.is_some_and(|h| h != height);
            if !width_off && !height_off {
                continue;
            }
            let shown = |v: Option<f64>| v.map_or("undefined".to_owned(), number_to_string);
            let want = match (expected.width, expected.height) {
                (w, None) => format!("width {}", shown(w)),
                (None, h) => format!("height {}", shown(h)),
                (w, h) => format!("{}x{}", shown(w), shown(h)),
            };
            r.add(
                "pattern/non-standard-size",
                format!(
                    "Element \"{}\" is {}x{}; the standard size is {want}.",
                    shape.bpmn_element,
                    number_to_string(width),
                    number_to_string(height)
                ),
                "Resize it to the standard size so diagrams across the project read alike.",
                process_id,
                &[&shape.bpmn_element],
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/// Runs the native equivalents of the given bpmnlint rules (name → options, in config
/// order). Findings come back at `warning`; the caller applies the configured severity.
pub fn analyze_bpmnlint_rules(
    defs: &BpmnDefinitions,
    rules: &IndexMap<String, Option<Json>>,
    categories: Option<&[Category]>,
) -> Vec<Finding> {
    let mut findings = vec![];
    let scopes = all_scopes(defs);
    for (name, options) in rules {
        if !NATIVE_BPMNLINT_RULES.contains(&name.as_str()) {
            continue;
        }
        let Some(category) = spec::lint_rule(name)
            .and_then(|r| r.category)
            .map(Category::from)
        else {
            continue;
        };
        if categories.is_some_and(|c| !c.contains(&category)) {
            continue;
        }
        let mut report = Report {
            category,
            findings: &mut findings,
        };
        run_rule(name, defs, &scopes, options.as_ref(), &mut report);
    }
    findings
}
