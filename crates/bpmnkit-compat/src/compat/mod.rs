//! `camunda-compat.ts`, `camunda-compat-feel.ts`, `camunda-compat-data.ts`: what
//! Camunda Modeler reports through `bpmnlint-plugin-camunda-compat` when a diagram
//! uses something its target Camunda 8 version cannot run. Findings are
//! `compat/<plugin rule>`, category `deploy`; the tables are `bpmnkit_spec::compat`.
//!
//! The `.bpmnlintrc` side (`splitCamundaCompatConfig`, `applyCamundaCompatConfig`)
//! lives in `bpmnkit-lint`, next to the bpmnlint config it reads.

mod agent;
mod contents;
pub mod feel;
mod no_loop;
pub mod pattern;

use crate::finding::{Category, Finding, FindingData, Severity};
use bpmnkit_bpmn::{
    Attrs, BpmnDefinitions, BpmnEventDefinition, BpmnFlowElement,
    BpmnMultiInstanceLoopCharacteristics, BpmnProcess, BpmnSequenceFlow, XmlElement,
};
use bpmnkit_spec::compat::{
    element_since, feature, implementation_since, rule, timer_since, CamundaVersion,
    ImplementationKind, RuleSeverity, TimerProperty, CRON_TIMER_SINCE, TIMER_SUPPORT,
};
use indexmap::IndexMap;
use pattern::{is_cron, is_iso_cycle, is_iso_date, is_iso_duration, is_js_space, js_trim};
use std::collections::{HashMap, HashSet};

pub use bpmnkit_spec::compat::CamundaVersion as CamundaCompatVersion;

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

fn newest() -> CamundaVersion {
    *CamundaVersion::ALL.last().expect("versions")
}

/// `normalizeCamundaVersion`: `"8.6.2"` → 8.6. A Camunda 8 version newer than the
/// tables is checked as the newest they know; anything else is `None`.
pub fn normalize_camunda_version(raw: Option<&str>) -> Option<CamundaVersion> {
    let s = raw.unwrap_or("").trim_start_matches(is_js_space);
    let digits = |s: &str| s.find(|c: char| !c.is_ascii_digit()).unwrap_or(s.len());
    let n = digits(s);
    if n == 0 {
        return None;
    }
    let rest = s[n..].strip_prefix('.')?;
    let m = digits(rest);
    if m == 0 {
        return None;
    }
    let major = pattern::digits_value(&s[..n]);
    let minor = pattern::digits_value(&rest[..m]);
    CamundaVersion::parse(&format!("{major}.{minor}"))
        .or_else(|| (major == 8 && minor > 10).then(newest))
}

/// `targetCamundaVersion`: the version from `modeler:executionPlatform` (a Camunda
/// Cloud platform) and `modeler:executionPlatformVersion`.
pub fn target_camunda_version(definitions: &BpmnDefinitions) -> Option<CamundaVersion> {
    let attrs = &definitions.unknown_attributes;
    let platform = attrs.get("modeler:executionPlatform")?;
    if !platform.to_lowercase().contains("cloud") {
        return None;
    }
    normalize_camunda_version(
        attrs
            .get("modeler:executionPlatformVersion")
            .map(String::as_str),
    )
}

/// `FEATURE_SINCE[key]`.
fn since(key: &str) -> CamundaVersion {
    feature(key)
        .unwrap_or_else(|| panic!("FEATURE_SINCE.{key}"))
        .since
}

fn v(s: &str) -> CamundaVersion {
    CamundaVersion::parse(s).unwrap_or_else(|| panic!("version {s}"))
}

// ---------------------------------------------------------------------------
// Model helpers
// ---------------------------------------------------------------------------

type El = BpmnFlowElement;

fn is_container(el: &El) -> bool {
    el.contents().is_some()
}

fn flow_elements(el: &El) -> &[El] {
    el.contents().map_or(&[], |c| &c.flow_elements)
}

fn is_event_sub_process(el: Option<&El>) -> bool {
    match el {
        Some(El::EventSubProcess(_)) => true,
        Some(El::SubProcess(s)) => s.triggered_by_event == Some(true),
        _ => false,
    }
}

fn is_catch_event(t: &str) -> bool {
    matches!(t, "startEvent" | "intermediateCatchEvent" | "boundaryEvent")
}

fn is_throw_event(t: &str) -> bool {
    matches!(t, "intermediateThrowEvent" | "endEvent")
}

fn is_task(t: &str) -> bool {
    matches!(
        t,
        "task"
            | "serviceTask"
            | "scriptTask"
            | "userTask"
            | "sendTask"
            | "receiveTask"
            | "businessRuleTask"
            | "manualTask"
    )
}

fn is_activity(t: &str) -> bool {
    is_task(t)
        || matches!(
            t,
            "callActivity" | "subProcess" | "adHocSubProcess" | "eventSubProcess" | "transaction"
        )
}

fn event_definitions(el: &El) -> &[BpmnEventDefinition] {
    match el {
        El::StartEvent(e) => &e.event_definitions,
        El::EndEvent(e) | El::IntermediateCatchEvent(e) | El::IntermediateThrowEvent(e) => {
            &e.event_definitions
        }
        El::BoundaryEvent(e) => &e.event_definitions,
        _ => &[],
    }
}

fn event_definition(el: &El) -> Option<&BpmnEventDefinition> {
    event_definitions(el).first()
}

fn definition_type(def: &BpmnEventDefinition) -> &'static str {
    use BpmnEventDefinition::*;
    match def {
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

fn loop_of(el: &El) -> Option<&BpmnMultiInstanceLoopCharacteristics> {
    match el {
        El::Task(a)
        | El::ServiceTask(a)
        | El::ScriptTask(a)
        | El::UserTask(a)
        | El::BusinessRuleTask(a)
        | El::ManualTask(a)
        | El::CallActivity(a) => a.loop_characteristics.as_ref(),
        El::SendTask(t) | El::ReceiveTask(t) => t.loop_characteristics.as_ref(),
        El::SubProcess(s) => s.loop_characteristics.as_ref(),
        El::AdHocSubProcess(s) => s.loop_characteristics.as_ref(),
        El::Transaction(s) => s.loop_characteristics.as_ref(),
        _ => None,
    }
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    c.next()
        .map(|f| f.to_uppercase().chain(c).collect())
        .unwrap_or_default()
}

fn bpmn_type(el: &El) -> String {
    match el {
        El::EventSubProcess(_) => "bpmn:SubProcess".into(),
        _ => format!("bpmn:{}", capitalize(el.type_name())),
    }
}

fn bpmn_event_definition_type(def: &BpmnEventDefinition) -> String {
    format!("bpmn:{}EventDefinition", capitalize(definition_type(def)))
}

fn zeebe<'x>(ext: &'x [XmlElement], name: &str) -> Vec<&'x XmlElement> {
    ext.iter()
        .filter(|e| e.name.strip_prefix("zeebe:") == Some(name))
        .collect()
}

fn children<'x>(parent: Option<&'x XmlElement>, name: &str) -> Vec<&'x XmlElement> {
    parent.map_or(vec![], |p| zeebe(&p.children, name))
}

fn attr<'x>(x: Option<&'x XmlElement>, name: &str) -> Option<&'x str> {
    x.and_then(|x| x.attributes.get(name)).map(String::as_str)
}

fn is_empty(value: Option<&str>) -> bool {
    value.is_none_or(str::is_empty)
}

fn name_or_id<'e>(name: &'e Option<String>, id: &'e str) -> &'e str {
    name.as_deref().unwrap_or(id)
}

/// `name || id`.
fn name_else_id<'e>(name: &'e Option<String>, id: &'e str) -> &'e str {
    name.as_deref().filter(|n| !n.is_empty()).unwrap_or(id)
}

fn type_label(t: &str) -> &'static str {
    match t {
        "startEvent" => "start event",
        "endEvent" => "end event",
        "intermediateThrowEvent" => "intermediate throw event",
        "intermediateCatchEvent" => "intermediate catch event",
        "boundaryEvent" => "boundary event",
        "task" => "task",
        "serviceTask" => "service task",
        "scriptTask" => "script task",
        "userTask" => "user task",
        "sendTask" => "send task",
        "receiveTask" => "receive task",
        "businessRuleTask" => "business rule task",
        "manualTask" => "manual task",
        "callActivity" => "call activity",
        "exclusiveGateway" => "exclusive gateway",
        "parallelGateway" => "parallel gateway",
        "inclusiveGateway" => "inclusive gateway",
        "eventBasedGateway" => "event-based gateway",
        "complexGateway" => "complex gateway",
        "subProcess" => "sub-process",
        "adHocSubProcess" => "ad-hoc sub-process",
        "eventSubProcess" => "event sub-process",
        "transaction" => "transaction",
        "dataObject" => "data object",
        "dataObjectReference" => "data object reference",
        _ => "data store reference",
    }
}

/// `Signal end event "Notify"`: the event definition, the type, then the name.
fn describe(el: &El, with_definition: bool) -> String {
    let def = if with_definition {
        event_definition(el)
    } else {
        None
    };
    let t = type_label(el.type_name());
    let label = match def {
        Some(d) => format!("{} {t}", definition_type(d)),
        None if matches!(el, El::SubProcess(s) if s.triggered_by_event == Some(true)) => {
            "event sub-process".into()
        }
        None => t.into(),
    };
    let b = el.base();
    format!("{} \"{}\"", capitalize(&label), name_or_id(&b.name, &b.id))
}

// ---------------------------------------------------------------------------
// Analysis context
// ---------------------------------------------------------------------------

/// An element and the sub-process it sits in (`None`: the process itself).
#[derive(Clone, Copy)]
struct Located<'a, T> {
    el: &'a T,
    parent: Option<&'a El>,
}

struct Ctx<'a> {
    version: CamundaVersion,
    definitions: &'a BpmnDefinitions,
    process: &'a BpmnProcess,
    findings: Vec<Finding>,
    /// Sub-processes seen, for the diagram-interchange `collapsed-subprocess` check.
    sub_process_ids: HashSet<&'a str>,
    /// Every flow element of the process, nested ones included, in document order.
    elements: IndexMap<&'a str, Located<'a, El>>,
    /// Every sequence flow of the process, nested ones included.
    flows: IndexMap<&'a str, Located<'a, BpmnSequenceFlow>>,
}

impl<'a> Ctx<'a> {
    fn report(&mut self, rule_name: &str, element_id: &str, message: String, suggestion: &str) {
        let Some(r) = rule(rule_name).filter(|r| r.enabled_in(self.version)) else {
            return;
        };
        let severity = match r.severity {
            RuleSeverity::Error => Severity::Error,
            RuleSeverity::Warn => Severity::Warning,
        };
        self.findings.push(Finding::new(FindingData {
            id: format!("compat/{rule_name}"),
            category: Category::Deploy,
            severity,
            message,
            suggestion: suggestion.to_string(),
            process_id: self.process.id.clone(),
            element_ids: vec![element_id.to_string()],
            produces: None,
            consumes: None,
            bpmnlint_rule: None,
        }));
    }

    fn at_least(&self, since: CamundaVersion) -> bool {
        self.version >= since
    }

    fn targets(&self) -> String {
        format!("this model targets Camunda {}", self.version.as_str())
    }

    fn locate(
        &mut self,
        elements: &'a [El],
        flows: &'a [BpmnSequenceFlow],
        parent: Option<&'a El>,
    ) {
        for flow in flows {
            self.flows
                .insert(flow.id.as_str(), Located { el: flow, parent });
        }
        for el in elements {
            self.elements
                .insert(el.base().id.as_str(), Located { el, parent });
            if let Some(c) = el.contents() {
                self.locate(&c.flow_elements, &c.sequence_flows, Some(el));
            }
        }
    }

    fn parent_of(&self, id: &str) -> Option<&'a El> {
        self.elements.get(id).and_then(|l| l.parent)
    }
}

fn raise(since: CamundaVersion) -> String {
    format!(
        "Target Camunda {} or newer (modeler:executionPlatformVersion), or remove it.",
        since.as_str()
    )
}

/// `analyzeCamundaCompat`: `compat/*` findings against `version` (e.g. `"8.6"` or
/// `"8.6.2"`), or the model's `modeler:executionPlatformVersion` when `None`; none
/// when there is no Camunda 8 target. From 8.2 on, non-executable processes are
/// skipped, as Modeler skips them.
pub fn analyze_camunda_compat(
    definitions: &BpmnDefinitions,
    version: Option<&str>,
) -> Vec<Finding> {
    each_process(definitions, version, &mut |ctx| {
        let c = &ctx.process.contents;
        check_process(ctx);
        check_scope(ctx, &c.flow_elements, &c.sequence_flows, None);
        check_collapsed(ctx);
        contents::check_contents(ctx);
    })
}

/// Only the `compat/no-loop` findings of [`analyze_camunda_compat`], in the same
/// order. reebe needs no other rule at deploy time; calling this instead keeps the
/// other rules' code out of its browser build.
pub fn find_straight_through_loops(
    definitions: &BpmnDefinitions,
    version: Option<&str>,
) -> Vec<Finding> {
    each_process(definitions, version, &mut no_loop::check_no_loop)
}

/// Runs `check` on a fresh [`Ctx`] for every process the target version checks.
/// `dyn`: one copy of the loop for both callers.
fn each_process(
    definitions: &BpmnDefinitions,
    version: Option<&str>,
    check: &mut dyn FnMut(&mut Ctx),
) -> Vec<Finding> {
    let target = match version {
        Some(v) => normalize_camunda_version(Some(v)),
        None => target_camunda_version(definitions),
    };
    let Some(target) = target else {
        return vec![];
    };
    let mut findings = vec![];
    for process in &definitions.processes {
        if target >= v("8.2") && process.is_executable != Some(true) {
            continue;
        }
        let mut ctx = Ctx {
            version: target,
            definitions,
            process,
            findings: vec![],
            sub_process_ids: HashSet::new(),
            elements: IndexMap::new(),
            flows: IndexMap::new(),
        };
        let c = &process.contents;
        ctx.locate(&c.flow_elements, &c.sequence_flows, None);
        check(&mut ctx);
        findings.append(&mut ctx.findings);
    }
    findings
}

fn check_process(ctx: &mut Ctx) {
    let process = ctx.process;
    let ext = &process.extension_elements;
    let label = format!("Process \"{}\"", name_or_id(&process.name, &process.id));
    check_listeners(ctx, &process.id, ext, &label, true, false);
    check_template(ctx, &process.id, &process.unknown_attributes, &label);
    check_no_extension(
        ctx,
        "no-zeebe-properties",
        &process.id,
        ext,
        "properties",
        "Process",
    );

    if let Some(version_tag) = zeebe(ext, "versionTag").first() {
        let s = since("versionTag");
        let m = format!(
            "{label} has a zeebe:versionTag, which needs Camunda {} or newer; {}.",
            s.as_str(),
            ctx.targets()
        );
        ctx.report("no-version-tag", &process.id, m, &raise(s));
        if is_empty(attr(Some(version_tag), "value")) {
            ctx.report(
                "version-tag",
                &process.id,
                format!("{label} has a zeebe:versionTag with no value."),
                "Set the version tag, or remove it.",
            );
        }
    }

    let none_starts: Vec<&El> = process
        .contents
        .flow_elements
        .iter()
        .filter(|el| matches!(el, El::StartEvent(s) if s.event_definitions.is_empty()))
        .collect();
    if none_starts.len() > 1 {
        for start in &none_starts {
            let m = format!(
                "{} is one of {} blank start events in process \"{}\"; Camunda allows one.",
                describe(start, true),
                none_starts.len(),
                name_or_id(&process.name, &process.id)
            );
            ctx.report(
                "no-multiple-none-start-events",
                &start.base().id,
                m,
                "Keep one blank start event and give the others an event definition.",
            );
        }
    }
}

fn check_collapsed(ctx: &mut Ctx) {
    let s = since("collapsedSubProcess").as_str();
    for diagram in &ctx.definitions.diagrams {
        for shape in &diagram.plane.shapes {
            if !ctx.sub_process_ids.contains(shape.bpmn_element.as_str())
                || shape.is_expanded == Some(true)
            {
                continue;
            }
            let m = format!(
                "Sub-process \"{}\" is drawn collapsed, which needs Camunda {s} or newer; {}.",
                shape.bpmn_element,
                ctx.targets()
            );
            ctx.report(
                "collapsed-subprocess",
                &shape.bpmn_element,
                m,
                &format!("Expand the sub-process, or target Camunda {s} or newer."),
            );
        }
    }
}

type Scope<'a> = HashMap<&'a str, &'a El>;

fn check_scope<'a>(
    ctx: &mut Ctx<'a>,
    elements: &'a [El],
    flows: &'a [BpmnSequenceFlow],
    parent: Option<&'a El>,
) {
    let by_id: Scope<'a> = elements
        .iter()
        .map(|el| (el.base().id.as_str(), el))
        .collect();
    let mut outgoing: HashMap<&str, usize> = HashMap::new();
    for flow in flows {
        *outgoing.entry(flow.source_ref.as_str()).or_default() += 1;
    }
    for el in elements {
        check_element(ctx, el, parent, &by_id, flows);
        if let Some(c) = el.contents() {
            ctx.sub_process_ids.insert(el.base().id.as_str());
            check_scope(ctx, &c.flow_elements, &c.sequence_flows, Some(el));
        }
    }
    check_sequence_flows(ctx, &by_id, flows, &outgoing);
}

fn check_sequence_flows(
    ctx: &mut Ctx,
    by_id: &Scope,
    flows: &[BpmnSequenceFlow],
    outgoing: &HashMap<&str, usize>,
) {
    for flow in flows {
        let Some(source) = by_id.get(flow.source_ref.as_str()) else {
            continue;
        };
        let default = match source {
            El::ExclusiveGateway(g) | El::InclusiveGateway(g) => Some(&g.default),
            _ => None,
        };
        let name = name_or_id(&flow.name, &flow.id);
        if let Some(default) = default {
            let siblings = outgoing
                .get(source.base().id.as_str())
                .copied()
                .unwrap_or(0);
            if siblings > 1
                && default.as_deref() != Some(flow.id.as_str())
                && flow.condition_expression.is_none()
            {
                let m = format!(
                    "Sequence flow \"{name}\" leaves {} without a condition and is not its default flow.",
                    describe(source, true)
                );
                ctx.report(
                    "sequence-flow-condition",
                    &flow.id,
                    m,
                    "Add a condition expression, or make it the gateway's default flow.",
                );
            }
        } else if flow.condition_expression.is_some() {
            ctx.report(
                "sequence-flow-condition",
                &flow.id,
                format!("Sequence flow \"{name}\" has a condition, but only flows leaving an exclusive or inclusive gateway may."),
                "Remove the condition, or route the flow through a gateway.",
            );
        }
    }
}

fn check_element<'a>(
    ctx: &mut Ctx<'a>,
    el: &'a El,
    parent: Option<&'a El>,
    scope: &Scope<'a>,
    flows: &'a [BpmnSequenceFlow],
) {
    let id = el.base().id.as_str();
    if check_element_type(ctx, el) {
        check_implementation(ctx, el);
    }
    check_timer(ctx, el, parent);
    check_references(ctx, el, parent);
    check_extensions(ctx, el);
    check_loop(ctx, el);
    check_forms(ctx, el);

    let joined = if matches!(el, El::InclusiveGateway(_)) {
        flows.iter().filter(|f| f.target_ref == id).count()
    } else {
        0
    };
    if joined > 1 {
        let m = format!(
            "{} joins {joined} flows; Camunda {} only runs inclusive gateways that fork, joining needs Camunda 8.6 or newer.",
            describe(el, true),
            ctx.version.as_str()
        );
        ctx.report(
            "inclusive-gateway",
            id,
            m,
            "Give it a single incoming flow, or target Camunda 8.6 or newer.",
        );
    }

    if matches!(el, El::ReceiveTask(_)) {
        let from_event_gateway = flows.iter().any(|f| {
            f.target_ref == id
                && matches!(
                    scope.get(f.source_ref.as_str()),
                    Some(El::EventBasedGateway(_))
                )
        });
        if from_event_gateway {
            ctx.report(
                "event-based-gateway-target",
                id,
                format!(
                    "{} follows an event-based gateway; Camunda only accepts catch events there.",
                    describe(el, true)
                ),
                "Replace the receive task with a message intermediate catch event.",
            );
        }
    }

    let def = event_definition(el);
    if let (El::BoundaryEvent(b), Some(BpmnEventDefinition::Escalation(_))) = (el, def) {
        if let Some(host) = scope.get(b.attached_to_ref.as_str()) {
            if is_task(host.type_name()) {
                let m = format!(
                    "{} is attached to {}; a task cannot throw an escalation, so Camunda does not allow it there.",
                    describe(el, true),
                    describe(host, false)
                );
                ctx.report(
                    "escalation-boundary-event-attached-to-ref",
                    id,
                    m,
                    "Attach it to a sub-process or call activity instead.",
                );
            }
        }
    }

    if let (true, Some(BpmnEventDefinition::Compensate(c))) = (is_throw_event(el.type_name()), def)
    {
        let wait = c
            .unknown_attributes
            .as_ref()
            .and_then(|a| a.get("waitForCompletion"));
        if wait.map(String::as_str) == Some("false") {
            ctx.report(
                "wait-for-completion",
                id,
                format!(
                    "{} sets waitForCompletion=\"false\"; Camunda always waits for compensation to complete.",
                    describe(el, true)
                ),
                "Remove waitForCompletion, or set it to \"true\".",
            );
        }
    }

    if matches!(el, El::AdHocSubProcess(_)) {
        check_ad_hoc(ctx, el);
    }

    if let (El::StartEvent(start), Some(parent)) = (el, parent) {
        if matches!(def, Some(BpmnEventDefinition::Signal(_))) {
            let s = since("signalEventSubProcess");
            let m = format!(
                "{} starts a sub-process, which needs Camunda {} or newer; {}.",
                describe(el, true),
                s.as_str(),
                ctx.targets()
            );
            ctx.report("no-signal-event-sub-process", id, m, &raise(s));
        }
        if start.is_interrupting != Some(false) && is_event_sub_process(Some(parent)) {
            let grandparent =
                find_parent(&ctx.process.contents.flow_elements, &parent.base().id, None);
            if let Some(gp @ El::AdHocSubProcess(_)) = grandparent {
                let m = format!(
                    "{} interrupts an event sub-process inside ad-hoc sub-process \"{}\"; Camunda only allows non-interrupting ones there.",
                    describe(el, true),
                    name_or_id(&gp.base().name, &gp.base().id)
                );
                ctx.report(
                    "no-interrupting-event-subprocess",
                    id,
                    m,
                    "Set isInterrupting=\"false\".",
                );
            }
        }
    }
}

fn find_parent<'a>(elements: &'a [El], child_id: &str, parent: Option<&'a El>) -> Option<&'a El> {
    for el in elements {
        if el.base().id == child_id {
            return parent;
        }
        if is_container(el) {
            if let Some(found) = find_parent(flow_elements(el), child_id, Some(el)) {
                return Some(found);
            }
        }
    }
    None
}

/// `element-type`. Returns whether the target version runs the element.
fn check_element_type(ctx: &mut Ctx, el: &El) -> bool {
    let def = event_definition(el).map(bpmn_event_definition_type);
    let id = el.base().id.as_str();
    match element_since(&bpmn_type(el), def.as_deref()) {
        None => {
            ctx.report(
                "element-type",
                id,
                format!(
                    "{} is not supported by any Camunda 8 version.",
                    describe(el, true)
                ),
                "Model it with an element Camunda 8 executes.",
            );
            false
        }
        Some(s) if !ctx.at_least(s) => {
            let m = format!(
                "{} needs Camunda {} or newer; {}.",
                describe(el, true),
                s.as_str(),
                ctx.targets()
            );
            ctx.report("element-type", id, m, &raise(s));
            false
        }
        Some(_) => true,
    }
}

const KINDS: [(ImplementationKind, &str, &[&str]); 3] = [
    (
        ImplementationKind::CalledDecision,
        "calledDecision",
        &["decisionId", "resultVariable"],
    ),
    (
        ImplementationKind::Script,
        "script",
        &["expression", "resultVariable"],
    ),
    (
        ImplementationKind::TaskDefinition,
        "taskDefinition",
        &["type"],
    ),
];

fn implementation_since_of(kind: ImplementationKind, el: &El) -> Option<CamundaVersion> {
    let def = event_definition(el).map(bpmn_event_definition_type);
    implementation_since(kind, &bpmn_type(el), def.as_deref())
}

/// `implementation`: how the task is carried out, and when that was introduced.
fn check_implementation(ctx: &mut Ctx, el: &El) {
    let def = event_definition(el);
    if is_throw_event(el.type_name()) && def.is_none() {
        return;
    }
    let ext = &el.base().extension_elements;
    let id = el.base().id.as_str();
    let label = describe(el, true);
    let present: Vec<_> = KINDS
        .iter()
        .filter(|(_, name, _)| !zeebe(ext, name).is_empty())
        .collect();

    if let [(kind, name, properties)] = present.as_slice() {
        let s = implementation_since_of(*kind, el);
        match s {
            None => {
                ctx.report(
                    "implementation",
                    id,
                    format!("{label} has a zeebe:{name}, which Camunda does not allow on it."),
                    &format!("Remove the zeebe:{name}."),
                );
                return;
            }
            Some(s) if !ctx.at_least(s) => {
                let m = format!(
                    "{label} has a zeebe:{name}, which needs Camunda {} or newer here; {}.",
                    s.as_str(),
                    ctx.targets()
                );
                ctx.report("implementation", id, m, &raise(s));
                return;
            }
            Some(_) => {}
        }
        let x = zeebe(ext, name).first().copied();
        let missing: Vec<&str> = properties
            .iter()
            .copied()
            .filter(|p| is_empty(attr(x, p)))
            .collect();
        for property in &missing {
            ctx.report(
                "implementation",
                id,
                format!("{label} has a zeebe:{name} with no {property}."),
                &format!("Set {property} on the zeebe:{name}."),
            );
        }
        if !missing.is_empty() {
            return;
        }
    }

    let allowed: Vec<_> = KINDS
        .iter()
        .filter(|(kind, _, _)| implementation_since_of(*kind, el).is_some_and(|s| ctx.at_least(s)))
        .collect();
    if allowed.is_empty() || matches!(el, El::AdHocSubProcess(_)) {
        return;
    }
    let count: usize = allowed
        .iter()
        .map(|(_, name, _)| zeebe(ext, name).len())
        .sum();
    if count != 1 {
        let names = allowed
            .iter()
            .map(|(_, name, _)| format!("zeebe:{name}"))
            .collect::<Vec<_>>()
            .join(" or ");
        let m = if count == 0 {
            format!("{label} has no implementation; Camunda needs a {names}.")
        } else {
            format!("{label} has {count} implementations; Camunda needs exactly one {names}.")
        };
        let suggestion = if allowed
            .iter()
            .any(|(k, _, _)| *k == ImplementationKind::TaskDefinition)
        {
            "Set a job type (zeebe:taskDefinition).".to_string()
        } else {
            format!("Add one {names}.")
        };
        ctx.report("implementation", id, m, &suggestion);
    }
}

const TIMER_PROPERTIES: [(TimerProperty, &str); 3] = [
    (TimerProperty::TimeCycle, "timeCycle"),
    (TimerProperty::TimeDate, "timeDate"),
    (TimerProperty::TimeDuration, "timeDuration"),
];

/// `timer`: which timer properties the event takes, and whether the value parses.
fn check_timer(ctx: &mut Ctx, el: &El, parent: Option<&El>) {
    let Some(BpmnEventDefinition::Timer(def)) = event_definition(el) else {
        return;
    };
    let bt = bpmn_type(el);
    if !TIMER_SUPPORT.iter().any(|e| e.event_type == bt) {
        return;
    }
    let interrupting = match el {
        El::BoundaryEvent(b) => b.cancel_activity != Some(false),
        El::StartEvent(s) => s.is_interrupting != Some(false),
        _ => true,
    };
    let in_esp = is_event_sub_process(parent);
    let since_of = |p: TimerProperty| timer_since(&bt, p, interrupting, in_esp);
    let value_of = |p: TimerProperty| match p {
        TimerProperty::TimeCycle => def.time_cycle.as_deref(),
        TimerProperty::TimeDate => def.time_date.as_deref(),
        TimerProperty::TimeDuration => def.time_duration.as_deref(),
    };
    let id = el.base().id.as_str();
    let label = describe(el, true);

    let Some(&(property, name)) = TIMER_PROPERTIES
        .iter()
        .find(|(p, _)| value_of(*p).is_some())
    else {
        let allowed: Vec<&str> = TIMER_PROPERTIES
            .iter()
            .filter(|(p, _)| since_of(*p).is_some_and(|s| ctx.at_least(s)))
            .map(|(_, n)| *n)
            .collect();
        ctx.report(
            "timer",
            id,
            format!(
                "{label} has no timer value; set one of {}.",
                allowed.join(", ")
            ),
            "Set when the timer fires.",
        );
        return;
    };

    match since_of(property) {
        None => {
            ctx.report(
                "timer",
                id,
                format!("{label} uses {name}, which Camunda does not allow on this event."),
                "Use another kind of timer.",
            );
            return;
        }
        Some(s) if !ctx.at_least(s) => {
            let m = format!(
                "{label} uses {name}, which needs Camunda {} or newer on this event; {}.",
                s.as_str(),
                ctx.targets()
            );
            ctx.report("timer", id, m, &raise(s));
            return;
        }
        Some(_) => {}
    }

    let value = js_trim(value_of(property).unwrap_or(""));
    if value.is_empty() {
        ctx.report(
            "timer",
            id,
            format!("{label} has an empty {name}."),
            "Set a timer value.",
        );
        return;
    }
    if value.starts_with('=') {
        return;
    }
    if property == TimerProperty::TimeCycle && !is_iso_cycle(value) && is_cron(value) {
        if !ctx.at_least(CRON_TIMER_SINCE) {
            let m = format!(
                "{label} uses a cron expression, which needs Camunda {} or newer; {}.",
                CRON_TIMER_SINCE.as_str(),
                ctx.targets()
            );
            ctx.report(
                "timer",
                id,
                m,
                "Use an ISO 8601 repeating interval (R/PT1H), or target Camunda 8.1 or newer.",
            );
        }
        return;
    }
    let (valid, expected) = match property {
        TimerProperty::TimeCycle => (
            is_iso_cycle(value),
            "an ISO 8601 repeating interval (R3/PT10M) or a cron expression",
        ),
        TimerProperty::TimeDate => (
            is_iso_date(value),
            "an ISO 8601 date-time (2026-01-01T09:00:00Z)",
        ),
        TimerProperty::TimeDuration => (is_iso_duration(value), "an ISO 8601 duration (PT15M)"),
    };
    if !valid {
        ctx.report(
            "timer",
            id,
            format!("{label} has {name} \"{value}\", which is not {expected}."),
            &format!("Write {expected}, or a FEEL expression starting with \"=\"."),
        );
    }
}

/// The `messageRef` of a receive task or message event.
fn message_ref(el: &El) -> Option<&str> {
    match (el, event_definition(el)) {
        (El::ReceiveTask(t), _) => t.message_ref.as_deref(),
        (_, Some(BpmnEventDefinition::Message(m))) => m.message_ref.as_deref(),
        _ => None,
    }
}

/// Message, error, escalation and signal references, and their codes and names.
fn check_references(ctx: &mut Ctx, el: &El, parent: Option<&El>) {
    let def = event_definition(el);
    let t = el.type_name();
    let is_catch = is_catch_event(t);
    let is_throw = is_throw_event(t);
    let definitions = ctx.definitions;
    let id = el.base().id.as_str();
    let label = describe(el, true);
    let is_receive = matches!(el, El::ReceiveTask(_));

    let takes_message = is_receive || matches!(def, Some(BpmnEventDefinition::Message(_)));
    if takes_message {
        let message_ref = message_ref(el);
        let message = message_ref.and_then(|r| definitions.messages.iter().find(|m| m.id == r));
        if (is_catch || is_receive) && message.is_none() {
            let m = match message_ref {
                None => format!("{label} references no message."),
                Some(r) => format!("{label} references message \"{r}\", which does not exist."),
            };
            ctx.report(
                "message-reference",
                id,
                m,
                "Reference a bpmn:message with a name.",
            );
        } else if (is_catch || is_receive) && is_empty(message.and_then(|m| m.name.as_deref())) {
            ctx.report(
                "message-reference",
                id,
                format!(
                    "{label} references message \"{}\", which has no name.",
                    message_ref.unwrap_or("undefined")
                ),
                "Name the message — Camunda correlates on it.",
            );
        }

        // A message start event of the process itself is correlated by name alone.
        let subscribes = !(matches!(el, El::StartEvent(_)) && parent.is_none());
        if let (true, Some(message)) = (subscribes, message) {
            let on_message = zeebe(
                message.extension_elements.as_deref().unwrap_or(&[]),
                "subscription",
            );
            let on_element = zeebe(&el.base().extension_elements, "subscription")
                .first()
                .copied();
            let message_name = name_or_id(&message.name, &message.id);
            if on_message.len() != 1 {
                let key_on_element = !is_empty(attr(on_element, "correlationKey"));
                let (m, s) = if key_on_element {
                    (
                        format!("{label} carries its zeebe:subscription itself; Camunda Modeler expects it on message \"{message_name}\"."),
                        "Move the zeebe:subscription onto the bpmn:message.",
                    )
                } else {
                    (
                        format!(
                            "Message \"{message_name}\" used by {label} has no zeebe:subscription."
                        ),
                        "Add a zeebe:subscription with a correlationKey to the message.",
                    )
                };
                ctx.report("subscription", id, m, s);
            } else if is_empty(attr(on_message.first().copied(), "correlationKey")) {
                ctx.report(
                    "subscription",
                    id,
                    format!("Message \"{message_name}\" used by {label} has a zeebe:subscription with no correlationKey."),
                    "Set the correlation key.",
                );
            }
        }
    }

    if let (Some(BpmnEventDefinition::Error(d)), true) = (def, is_catch || is_throw) {
        let without_ref = since("errorCatchWithoutRef");
        let optional = is_catch && ctx.at_least(without_ref);
        let error = d
            .error_ref
            .as_deref()
            .and_then(|r| definitions.errors.iter().find(|e| e.id == r));
        match error {
            None if !optional => {
                let m = if is_catch {
                    format!(
                        "{label} references no error; catching every error needs Camunda {} or newer, {}.",
                        without_ref.as_str(),
                        ctx.targets()
                    )
                } else {
                    format!("{label} references no error.")
                };
                ctx.report(
                    "error-reference",
                    id,
                    m,
                    "Reference a bpmn:error with an error code.",
                );
            }
            None => {}
            Some(error) if is_empty(error.error_code.as_deref()) => {
                ctx.report(
                    "error-reference",
                    id,
                    format!(
                        "{label} references error \"{}\", which has no error code.",
                        name_or_id(&error.name, &error.id)
                    ),
                    "Set the error code.",
                );
            }
            Some(error) => {
                let code = error.error_code.as_deref().unwrap_or("");
                if code.starts_with('=') {
                    let before82 = !ctx.at_least(v("8.2"));
                    // Zeebe rejects catch expressions on every version (see the TS twin).
                    if before82 || is_catch {
                        let expr_since = since("errorCodeExpression");
                        let (m, s) = if is_catch {
                            (
                                format!("{label} catches error code \"{code}\", an expression, which Camunda {} does not support in a catch event.", ctx.version.as_str()),
                                "Use a static error code.".to_string(),
                            )
                        } else {
                            (
                                format!(
                                    "{label} throws error code \"{code}\", an expression, which needs Camunda {} or newer; {}.",
                                    expr_since.as_str(),
                                    ctx.targets()
                                ),
                                raise(expr_since),
                            )
                        };
                        ctx.report("no-expression", id, m, &s);
                    }
                }
            }
        }
    }

    if let (Some(BpmnEventDefinition::Escalation(d)), true) = (def, is_catch || is_throw) {
        let escalation = d
            .escalation_ref
            .as_deref()
            .and_then(|r| definitions.escalations.iter().find(|e| e.id == r));
        match escalation {
            None if is_throw => ctx.report(
                "escalation-reference",
                id,
                format!("{label} references no escalation."),
                "Reference a bpmn:escalation with an escalation code.",
            ),
            None => {}
            Some(e) if is_empty(e.escalation_code.as_deref()) => ctx.report(
                "escalation-reference",
                id,
                format!(
                    "{label} references escalation \"{}\", which has no escalation code.",
                    name_or_id(&e.name, &e.id)
                ),
                "Set the escalation code.",
            ),
            Some(e) => {
                let code = e.escalation_code.as_deref().unwrap_or("");
                if is_catch && code.starts_with('=') && ctx.at_least(v("8.2")) {
                    ctx.report(
                        "no-expression",
                        id,
                        format!("{label} catches escalation code \"{code}\", an expression, which Camunda {} does not support in a catch event.", ctx.version.as_str()),
                        "Use a static escalation code.",
                    );
                }
            }
        }
    }

    if let (Some(BpmnEventDefinition::Signal(d)), true) = (def, is_catch || is_throw) {
        let signal = d
            .signal_ref
            .as_deref()
            .and_then(|r| definitions.signals.iter().find(|s| s.id == r));
        match signal {
            None => ctx.report(
                "signal-reference",
                id,
                format!("{label} references no signal."),
                "Reference a bpmn:signal with a name.",
            ),
            Some(s) if is_empty(s.name.as_deref()) => ctx.report(
                "signal-reference",
                id,
                format!("{label} references signal \"{}\", which has no name.", s.id),
                "Name the signal — Camunda broadcasts on it.",
            ),
            Some(_) => {}
        }
    }
}

fn no_extension_since(rule_name: &str) -> CamundaVersion {
    since(match rule_name {
        "no-zeebe-properties" => "zeebeProperties",
        "no-task-schedule" => "taskSchedule",
        "no-zeebe-user-task" => "zeebeUserTask",
        "no-priority-definition" => "priorityDefinition",
        "no-task-listeners" => "taskListeners",
        _ => "jobPriorityDefinition",
    })
}

fn check_no_extension(
    ctx: &mut Ctx,
    rule_name: &str,
    element_id: &str,
    ext: &[XmlElement],
    name: &str,
    label: &str,
) {
    if zeebe(ext, name).is_empty() {
        return;
    }
    let s = no_extension_since(rule_name);
    let m = format!(
        "{label} has a zeebe:{name}, which needs Camunda {} or newer; {}.",
        s.as_str(),
        ctx.targets()
    );
    ctx.report(rule_name, element_id, m, &raise(s));
}

/// Execution listeners: present at all, then their event types, types and headers.
fn check_listeners(
    ctx: &mut Ctx,
    element_id: &str,
    ext: &[XmlElement],
    label: &str,
    is_process: bool,
    multi_instance: bool,
) {
    let Some(container) = zeebe(ext, "executionListeners").first().copied() else {
        return;
    };
    let gate = |ctx: &mut Ctx, rule_name: &str, what: &str, key: &str| {
        let s = since(key);
        let m = format!(
            "{label} has {what}, which need{} Camunda {} or newer; {}.",
            if what.ends_with("listeners") || what.ends_with("headers") {
                ""
            } else {
                "s"
            },
            s.as_str(),
            ctx.targets()
        );
        ctx.report(rule_name, element_id, m, &raise(s));
    };
    gate(
        ctx,
        "no-execution-listeners",
        "execution listeners",
        "executionListeners",
    );

    let mut seen: HashSet<(Option<&str>, Option<&str>)> = HashSet::new();
    for listener in children(Some(container), "executionListener") {
        let event_type = attr(Some(listener), "eventType");
        let job_type = attr(Some(listener), "type");
        if is_empty(job_type) {
            ctx.report(
                "execution-listener",
                element_id,
                format!("{label} has an execution listener with no job type."),
                "Set the listener's type.",
            );
        }
        let key = (Some(event_type.unwrap_or("")), Some(job_type.unwrap_or("")));
        if !is_empty(job_type) && seen.contains(&key) {
            ctx.report(
                "duplicate-execution-listeners",
                element_id,
                format!(
                    "{label} has two \"{}\" execution listeners of type \"{}\".",
                    event_type.unwrap_or("undefined"),
                    job_type.unwrap_or("undefined")
                ),
                "Remove the duplicate listener.",
            );
        }
        seen.insert(key);
        if !children(Some(listener), "taskHeaders").is_empty() {
            gate(
                ctx,
                "no-execution-listener-headers",
                "an execution listener with headers",
                "executionListenerHeaders",
            );
        }
        if event_type == Some("beforeAll") {
            gate(
                ctx,
                "no-before-all-execution-listener",
                "a \"beforeAll\" execution listener",
                "beforeAllExecutionListener",
            );
            if !multi_instance {
                ctx.report(
                    "before-all-execution-listener",
                    element_id,
                    format!(
                        "{label} has a \"beforeAll\" execution listener but is not multi-instance."
                    ),
                    "Use \"start\", or make the element multi-instance.",
                );
            }
        }
        if event_type == Some("cancel") {
            gate(
                ctx,
                "no-cancel-execution-listener",
                "a \"cancel\" execution listener",
                "cancelExecutionListener",
            );
            if !is_process {
                ctx.report(
                    "cancel-execution-listener",
                    element_id,
                    format!("{label} has a \"cancel\" execution listener; Camunda only allows those on a process."),
                    "Move the listener to the process.",
                );
            }
        }
    }
}

fn check_template(ctx: &mut Ctx, element_id: &str, attributes: &Attrs, label: &str) {
    let template = attributes.get("zeebe:modelerTemplate").map(String::as_str);
    if is_empty(template) {
        return;
    }
    let s = since("modelerTemplate");
    let m = format!(
        "{label} applies element template \"{}\", which needs Camunda {} or newer; {}.",
        template.unwrap_or(""),
        s.as_str(),
        ctx.targets()
    );
    ctx.report("no-template", element_id, m, &raise(s));
}

fn gate_report(ctx: &mut Ctx, rule_name: &str, id: &str, what: String, key: &str) {
    let s = since(key);
    let m = format!(
        "{what}, which needs Camunda {} or newer; {}.",
        s.as_str(),
        ctx.targets()
    );
    ctx.report(rule_name, id, m, &raise(s));
}

/// Zeebe extensions that are version-gated or have required properties.
fn check_extensions(ctx: &mut Ctx, el: &El) {
    let b = el.base();
    let ext = &b.extension_elements;
    let id = b.id.as_str();
    let label = describe(el, true);
    let t = el.type_name();
    check_listeners(ctx, id, ext, &label, false, loop_of(el).is_some());
    check_template(ctx, id, &b.unknown_attributes, &label);
    check_no_extension(ctx, "no-zeebe-properties", id, ext, "properties", &label);
    check_no_extension(
        ctx,
        "no-job-priority-definition",
        id,
        ext,
        "jobPriorityDefinition",
        &label,
    );

    for kind in ["calledDecision", "calledElement", "formDefinition"] {
        let holder = zeebe(ext, kind).first().copied();
        let binding = attr(holder, "bindingType");
        if holder.is_none() || is_empty(binding) {
            continue;
        }
        let binding = binding.unwrap_or("");
        if binding != "latest" {
            gate_report(
                ctx,
                "no-binding-type",
                id,
                format!("{label} binds its zeebe:{kind} by \"{binding}\""),
                "bindingType",
            );
        }
        if binding == "versionTag" && matches!(t, "businessRuleTask" | "callActivity" | "userTask")
        {
            let tag = attr(holder, "versionTag");
            let expr_since = since("decisionVersionTagExpression");
            if is_empty(tag) {
                ctx.report(
                    "version-tag",
                    id,
                    format!(
                        "{label} binds its zeebe:{kind} by version tag but sets no versionTag."
                    ),
                    "Set the version tag to bind to.",
                );
            } else if t == "businessRuleTask"
                && tag.is_some_and(|t| t.starts_with('='))
                && !ctx.at_least(expr_since)
            {
                gate_report(
                    ctx,
                    "version-tag",
                    id,
                    format!("{label} binds its decision by a version tag expression"),
                    "decisionVersionTagExpression",
                );
            }
        }
    }

    if t == "callActivity" {
        let called = zeebe(ext, "calledElement").first().copied();
        if is_empty(attr(called, "processId")) {
            ctx.report(
                "called-element",
                id,
                format!("{label} has no zeebe:calledElement processId."),
                "Set the id of the process to call.",
            );
        }
        if attr(called, "propagateAllParentVariables") == Some("false") {
            gate_report(
                ctx,
                "no-propagate-all-parent-variables",
                id,
                format!("{label} sets propagateAllParentVariables=\"false\""),
                "propagateAllParentVariablesFalse",
            );
        }
        if !is_empty(attr(called, "businessId")) {
            gate_report(
                ctx,
                "no-business-id",
                id,
                format!("{label} sets a businessId"),
                "businessId",
            );
        }
    }

    if t == "userTask" {
        check_no_extension(ctx, "no-task-schedule", id, ext, "taskSchedule", &label);
        check_no_extension(ctx, "no-zeebe-user-task", id, ext, "userTask", &label);
        check_no_extension(
            ctx,
            "no-priority-definition",
            id,
            ext,
            "priorityDefinition",
            &label,
        );
        check_no_extension(ctx, "no-task-listeners", id, ext, "taskListeners", &label);

        if !is_empty(attr(
            zeebe(ext, "assignmentDefinition").first().copied(),
            "candidateUsers",
        )) {
            gate_report(
                ctx,
                "no-candidate-users",
                id,
                format!("{label} assigns candidate users"),
                "candidateUsers",
            );
        }
        if zeebe(ext, "userTask").len() != 1 {
            ctx.report(
                "zeebe-user-task",
                id,
                format!(
                    "{label} is a job-worker user task; Camunda {} deprecates those in favour of Camunda user tasks.",
                    ctx.version.as_str()
                ),
                "Add zeebe:userTask to make it a Camunda user task.",
            );
        }

        let schedule = zeebe(ext, "taskSchedule").first().copied();
        for field in ["dueDate", "followUpDate"] {
            let Some(value) = attr(schedule, field) else {
                continue;
            };
            if value.starts_with('=') || is_iso_date(value) {
                continue;
            }
            ctx.report(
                "task-schedule",
                id,
                format!("{label} has {field} \"{value}\", which is not an ISO 8601 date-time."),
                "Write an ISO 8601 date-time (2026-01-01T09:00:00Z) or a FEEL expression starting with \"=\".",
            );
        }

        if let Some(priority) = attr(
            zeebe(ext, "priorityDefinition").first().copied(),
            "priority",
        ) {
            if !priority.starts_with('=') && !pattern::is_priority(priority) {
                ctx.report(
                    "priority-definition",
                    id,
                    format!("{label} has priority \"{priority}\"; Camunda takes a whole number from 0 to 100."),
                    "Use 0–100, or a FEEL expression starting with \"=\".",
                );
            }
        }

        for listener in children(zeebe(ext, "taskListeners").first().copied(), "taskListener") {
            if is_empty(attr(Some(listener), "type")) {
                ctx.report(
                    "task-listener",
                    id,
                    format!("{label} has a task listener with no job type."),
                    "Set the listener's type.",
                );
            }
        }
    }

    let header_holder = matches!(
        t,
        "userTask"
            | "serviceTask"
            | "businessRuleTask"
            | "scriptTask"
            | "sendTask"
            | "endEvent"
            | "intermediateThrowEvent"
            | "adHocSubProcess"
    );
    if header_holder {
        let keys: Vec<Option<&str>> =
            children(zeebe(ext, "taskHeaders").first().copied(), "header")
                .into_iter()
                .map(|h| attr(Some(h), "key"))
                .collect();
        for key in duplicates(&keys).into_iter().flatten() {
            ctx.report(
                "duplicate-task-headers",
                id,
                format!("{label} has more than one task header \"{key}\"."),
                "Remove the duplicate header.",
            );
        }
    }

    let io = zeebe(ext, "ioMapping").first().copied();
    let input_since = since("inputWithoutSource");
    for input in children(io, "input") {
        if is_empty(attr(Some(input), "target")) {
            ctx.report(
                "io-mapping",
                id,
                format!("{label} has an input mapping with no target."),
                "Set the target.",
            );
        }
        if is_empty(attr(Some(input), "source")) && !ctx.at_least(input_since) {
            let m = format!(
                "{label} has an input mapping with no source, which needs Camunda {} or newer; {}.",
                input_since.as_str(),
                ctx.targets()
            );
            ctx.report("io-mapping", id, m, "Set the source.");
        }
    }
    for output in children(io, "output") {
        for field in ["source", "target"] {
            if is_empty(attr(Some(output), field)) {
                ctx.report(
                    "io-mapping",
                    id,
                    format!("{label} has an output mapping with no {field}."),
                    &format!("Set the {field}."),
                );
            }
        }
    }
}

/// `new Set(keys.filter((k, i) => keys.indexOf(k) !== i))`, `undefined` included.
fn duplicates<'k>(keys: &[Option<&'k str>]) -> Vec<Option<&'k str>> {
    let mut out = vec![];
    for (i, key) in keys.iter().enumerate() {
        if keys.iter().position(|k| k == key) != Some(i) && !out.contains(key) {
            out.push(*key);
        }
    }
    out
}

/// `loop-characteristics`: only multi-instance, with an input collection.
fn check_loop(ctx: &mut Ctx, el: &El) {
    if !is_activity(el.type_name()) {
        return;
    }
    let b = el.base();
    let id = b.id.as_str();
    if b.unknown_children
        .iter()
        .any(|c| c.name.ends_with("standardLoopCharacteristics"))
    {
        ctx.report(
            "loop-characteristics",
            id,
            format!(
                "{} is a standard loop; Camunda only runs multi-instance loops.",
                describe(el, true)
            ),
            "Make it multi-instance, or model the loop with a gateway.",
        );
        return;
    }
    let Some(lp) = loop_of(el) else {
        return;
    };
    let zeebe_loop = zeebe(&lp.extension_elements, "loopCharacteristics");
    if zeebe_loop.len() != 1 {
        ctx.report(
            "loop-characteristics",
            id,
            format!(
                "{} is multi-instance without a zeebe:loopCharacteristics.",
                describe(el, true)
            ),
            "Set the input collection to iterate over.",
        );
        return;
    }
    let z = zeebe_loop.first().copied();
    if is_empty(attr(z, "inputCollection")) {
        ctx.report(
            "loop-characteristics",
            id,
            format!(
                "{} is multi-instance with no input collection.",
                describe(el, true)
            ),
            "Set the input collection to iterate over.",
        );
    }
    let no_collection = is_empty(attr(z, "outputCollection"));
    if no_collection != is_empty(attr(z, "outputElement")) {
        ctx.report(
            "loop-characteristics",
            id,
            format!(
                "{} sets {}.",
                describe(el, true),
                if no_collection {
                    "an output element but no output collection"
                } else {
                    "an output collection but no output element"
                }
            ),
            "Set both the output collection and the output element, or neither.",
        );
    }
}

/// `ad-hoc-sub-process`: contents, completion and output collection.
fn check_ad_hoc(ctx: &mut Ctx, el: &El) {
    let El::AdHocSubProcess(a) = el else {
        return;
    };
    let label = describe(el, true);
    let id = a.base.id.as_str();
    if !a
        .contents
        .flow_elements
        .iter()
        .any(|c| is_activity(c.type_name()))
    {
        ctx.report(
            "ad-hoc-sub-process",
            id,
            format!("{label} contains no activity."),
            "Add at least one task or sub-process to it.",
        );
    }
    let ad_hoc = zeebe(&a.base.extension_elements, "adHoc").first().copied();
    let s = since("adHocCompletion");
    if !ctx.at_least(s) {
        let mut used: Vec<&str> = vec![];
        if a.completion_condition.is_some() {
            used.push("a completion condition");
        }
        if a.cancel_remaining_instances == Some(false) {
            used.push("cancelRemainingInstances=\"false\"");
        }
        for name in ["outputCollection", "outputElement"] {
            if !is_empty(attr(ad_hoc, name)) {
                used.push(name);
            }
        }
        for feature in &used {
            let m = format!(
                "{label} uses {feature}, which needs Camunda {} or newer; {}.",
                s.as_str(),
                ctx.targets()
            );
            ctx.report("ad-hoc-sub-process", id, m, &raise(s));
        }
        if !used.is_empty() {
            return;
        }
    }
    if ad_hoc.is_some()
        && is_empty(attr(ad_hoc, "outputCollection")) != is_empty(attr(ad_hoc, "outputElement"))
    {
        ctx.report(
            "ad-hoc-sub-process",
            id,
            format!("{label} sets only one of outputCollection and outputElement."),
            "Set both, or neither.",
        );
    }
}

/// User task and start event forms.
fn check_forms(ctx: &mut Ctx, el: &El) {
    let is_user_task = matches!(el, El::UserTask(_));
    let is_start = matches!(el, El::StartEvent(_));
    if !is_user_task && !is_start {
        return;
    }
    let label = describe(el, true);
    let b = el.base();
    let id = b.id.as_str();
    let ext = &b.extension_elements;
    let forms = zeebe(ext, "formDefinition");
    let form = forms.first().copied();

    if is_user_task && forms.len() != 1 {
        ctx.report(
            "user-task-definition",
            id,
            format!("{label} has no zeebe:formDefinition."),
            "Link a form (formId), an external form, or an embedded form.",
        );
    }

    const EMBEDDED: &str = "camunda-forms:bpmn:";
    if let (true, Some(f)) = (is_start, form) {
        let s = since("startEventForm");
        if !ctx.at_least(s) {
            let m = format!(
                "{label} has a form, which needs Camunda {} or newer on a start event; {}.",
                s.as_str(),
                ctx.targets()
            );
            ctx.report("start-event-form", id, m, &raise(s));
            return;
        }
        if attr(Some(f), "formKey").is_some_and(|k| k.starts_with(EMBEDDED)) {
            ctx.report(
                "start-event-form-embedded",
                id,
                format!("{label} embeds its form; embedded forms on start events are deprecated."),
                "Link a deployed form by formId instead.",
            );
        }
    }
    let Some(form) = form else {
        return;
    };

    let zeebe_user_task = is_user_task && !zeebe(ext, "userTask").is_empty();
    let allowed: &[&str] = if is_start {
        &["formKey", "formId"]
    } else if zeebe_user_task {
        if !ctx.at_least(since("zeebeUserTask")) {
            return;
        }
        &["externalReference", "formId"]
    } else if ctx.at_least(since("userTaskFormId")) {
        &["formKey", "formId"]
    } else {
        if !is_empty(attr(Some(form), "formId")) {
            gate_report(
                ctx,
                "user-task-form",
                id,
                format!("{label} links a form by formId"),
                "userTaskFormId",
            );
            return;
        }
        &["formKey"]
    };
    let rule_name = if is_start {
        "start-event-form"
    } else {
        "user-task-form"
    };
    let set = allowed
        .iter()
        .filter(|a| !is_empty(attr(Some(form), a)))
        .count();
    if set != 1 {
        let list = allowed.join(", ");
        ctx.report(
            rule_name,
            id,
            format!("{label} has a zeebe:formDefinition that must set exactly one of {list}."),
            &format!("Set one of {list}."),
        );
        return;
    }

    if let Some(form_id) = attr(Some(form), "formKey").and_then(|k| k.strip_prefix(EMBEDDED)) {
        let embedded = zeebe(&ctx.process.extension_elements, "userTaskForm")
            .into_iter()
            .find(|f| attr(Some(f), "id") == Some(form_id));
        if embedded.is_some_and(|e| js_trim(e.text.as_deref().unwrap_or("")).is_empty()) {
            ctx.report(
                rule_name,
                id,
                format!("{label} embeds form \"{form_id}\", which is empty."),
                "Put the form's JSON in the zeebe:userTaskForm.",
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Existing checks
// ---------------------------------------------------------------------------

/// `isCamundaCompatFinding`.
pub fn is_camunda_compat_finding(id: &str) -> bool {
    id.starts_with("compat/")
}

/// `dedupeCamundaCompat`: drops the compatibility findings another check already
/// reports on the same element (each rule's `equivalents`), keeping the other one.
pub fn dedupe_camunda_compat(findings: Vec<Finding>) -> Vec<Finding> {
    let first = |f: &Finding| f.data.element_ids.first().cloned().unwrap_or_default();
    let reported: HashSet<(String, String)> = findings
        .iter()
        .map(|f| (f.data.id.clone(), first(f)))
        .collect();
    findings
        .into_iter()
        .filter(|f| {
            if !is_camunda_compat_finding(&f.data.id) {
                return true;
            }
            let equivalents =
                rule(&f.data.id["compat/".len()..]).map_or(&[][..], |r| r.equivalents);
            let element = first(f);
            !equivalents
                .iter()
                .any(|id| reported.contains(&(id.to_string(), element.clone())))
        })
        .collect()
}

#[cfg(test)]
mod tests;
