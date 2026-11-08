//! Port of `bpmn-serializer.ts`: the model becomes an `XmlElement` tree, which `serialize_xml`
//! writes. Attribute order follows JS object semantics: assigning an existing key keeps its
//! position, which is what `IndexMap::insert` does.

use crate::model::*;
use crate::number::js_number_to_string;
use bpmnkit_xml::{serialize_xml, Attrs, XmlElement};
use indexmap::IndexSet;

const BPMN_NS: &str = "http://www.omg.org/spec/BPMN/20100524/MODEL";
const BPMNDI_NS: &str = "http://www.omg.org/spec/BPMN/20100524/DI";
const DC_NS: &str = "http://www.omg.org/spec/DD/20100524/DC";
const DI_NS: &str = "http://www.omg.org/spec/DD/20100524/DI";

/// URIs for the extension prefixes a document can acquire after it was parsed.
///
/// Scoped deliberately to extension namespaces: the ones that arrive on content the
/// serializer keeps verbatim, where nothing else is in a position to declare them. The
/// structural prefixes (`bpmn`, `bpmndi`, `dc`, `di`) are absent on purpose; repairing a
/// missing one here would change the model a round trip produces.
const KNOWN_NAMESPACE_URIS: &[(&str, &str)] = &[
    ("zeebe", "http://camunda.org/schema/zeebe/1.0"),
    ("camunda", "http://camunda.org/schema/1.0/bpmn"),
    ("modeler", "http://camunda.org/schema/modeler/1.0"),
    ("bioc", "http://bpmn.io/schema/bpmn/biocolor/1.0"),
    (
        "color",
        "http://www.omg.org/spec/BPMN/non-normative/color/1.0",
    ),
    // Not an extension, but `xsi:type` rides on content the serializer copies (condition
    // expressions, timer values) and the builder can add it to a parsed document that never
    // declared xsi.
    ("xsi", "http://www.w3.org/2001/XMLSchema-instance"),
];

/// The prefix a document binds `uri` to: `""` when it is the default namespace, otherwise the
/// first named prefix. The default wins when a document binds both: models from other tools
/// often put BPMN in the default namespace and add a named binding they never use, and
/// writing their elements the way they spelled them keeps the file recognisable.
fn ns_prefix<'a>(namespaces: &'a Attrs, uri: &str) -> Option<&'a str> {
    if namespaces.get("").is_some_and(|u| u == uri) {
        return Some("");
    }
    namespaces
        .iter()
        .find(|(_, u)| *u == uri)
        .map(|(p, _)| p.as_str())
}

/// What goes in front of a local name: `"bpmn:"`, or `""` for the default namespace.
fn qualifier(ns: &Attrs, uri: &str, fallback: &str) -> String {
    match ns_prefix(ns, uri).unwrap_or(fallback) {
        "" => String::new(),
        p => format!("{p}:"),
    }
}

/// Qualifiers for the four structural namespaces, resolved once per document.
struct Prefixes {
    bp: String,
    bdi: String,
    dc: String,
    di: String,
}

fn el(
    name: String,
    attributes: Attrs,
    children: Vec<XmlElement>,
    text: Option<String>,
) -> XmlElement {
    XmlElement {
        name,
        attributes,
        children,
        text,
    }
}

fn leaf(name: String, attributes: Attrs, text: &str) -> XmlElement {
    el(name, attributes, Vec::new(), Some(text.to_owned()))
}

/// Modelled attributes followed by the ones the parser kept verbatim.
fn with_unknown(mut attrs: Attrs, unknown: Option<&Attrs>) -> Attrs {
    if let Some(u) = unknown {
        for (k, v) in u {
            attrs.insert(k.clone(), v.clone());
        }
    }
    attrs
}

/// `{ id, ...unknown }`.
fn id_then(id: &str, unknown: &Attrs) -> Attrs {
    let mut attrs = Attrs::new();
    attrs.insert("id".into(), id.to_owned());
    with_unknown(attrs, Some(unknown))
}

/// JS truthiness of an optional string: `undefined` and `""` are both falsy.
fn truthy(s: &Option<String>) -> Option<&str> {
    s.as_deref().filter(|s| !s.is_empty())
}

fn set(attrs: &mut Attrs, key: &str, value: &Option<String>) {
    if let Some(v) = value {
        attrs.insert(key.to_owned(), v.clone());
    }
}

fn set_truthy(attrs: &mut Attrs, key: &str, value: &Option<String>) {
    if let Some(v) = truthy(value) {
        attrs.insert(key.to_owned(), v.to_owned());
    }
}

fn bool_str(b: bool) -> String {
    if b { "true" } else { "false" }.to_owned()
}

// ---------------------------------------------------------------------------
// Event definitions
// ---------------------------------------------------------------------------

fn event_definitions(defs: &[BpmnEventDefinition], bp: &str) -> Vec<XmlElement> {
    defs.iter().map(|d| event_definition(d, bp)).collect()
}

fn event_definition(d: &BpmnEventDefinition, bp: &str) -> XmlElement {
    let mut attrs = Attrs::new();
    let (tag, unknown, children) = match d {
        BpmnEventDefinition::Timer(t) => {
            set_truthy(&mut attrs, "id", &t.id);
            let mut children = Vec::new();
            for (tag, value, a) in [
                (
                    "timeDuration",
                    &t.time_duration,
                    &t.time_duration_attributes,
                ),
                ("timeDate", &t.time_date, &t.time_date_attributes),
                ("timeCycle", &t.time_cycle, &t.time_cycle_attributes),
            ] {
                if let Some(v) = value {
                    children.push(leaf(format!("{bp}{tag}"), a.clone().unwrap_or_default(), v));
                }
            }
            ("timerEventDefinition", &t.unknown_attributes, children)
        }
        BpmnEventDefinition::Error(e) => {
            set_truthy(&mut attrs, "id", &e.id);
            set_truthy(&mut attrs, "errorRef", &e.error_ref);
            ("errorEventDefinition", &e.unknown_attributes, Vec::new())
        }
        BpmnEventDefinition::Escalation(e) => {
            set_truthy(&mut attrs, "id", &e.id);
            set_truthy(&mut attrs, "escalationRef", &e.escalation_ref);
            (
                "escalationEventDefinition",
                &e.unknown_attributes,
                Vec::new(),
            )
        }
        BpmnEventDefinition::Message(m) => {
            set_truthy(&mut attrs, "id", &m.id);
            set_truthy(&mut attrs, "messageRef", &m.message_ref);
            (
                "messageEventDefinition",
                &m.unknown_attributes,
                extension_elements(m.extension_elements.as_deref().unwrap_or(&[]), bp),
            )
        }
        BpmnEventDefinition::Signal(s) => {
            set_truthy(&mut attrs, "id", &s.id);
            set_truthy(&mut attrs, "signalRef", &s.signal_ref);
            ("signalEventDefinition", &s.unknown_attributes, Vec::new())
        }
        BpmnEventDefinition::Conditional(c) => {
            set_truthy(&mut attrs, "id", &c.id);
            let mut children =
                extension_elements(c.extension_elements.as_deref().unwrap_or(&[]), bp);
            if let Some(cond) = &c.condition {
                children.push(leaf(
                    format!("{bp}condition"),
                    c.condition_attributes.clone().unwrap_or_default(),
                    cond,
                ));
            }
            (
                "conditionalEventDefinition",
                &c.unknown_attributes,
                children,
            )
        }
        BpmnEventDefinition::Link(l) => {
            set_truthy(&mut attrs, "id", &l.id);
            // BPMN20.xsd requires `name`; an empty one is left for the validator to name.
            attrs.insert("name".into(), l.name.clone().unwrap_or_default());
            ("linkEventDefinition", &l.unknown_attributes, Vec::new())
        }
        BpmnEventDefinition::Cancel(c) => {
            set_truthy(&mut attrs, "id", &c.id);
            ("cancelEventDefinition", &c.unknown_attributes, Vec::new())
        }
        BpmnEventDefinition::Terminate(t) => {
            set_truthy(&mut attrs, "id", &t.id);
            (
                "terminateEventDefinition",
                &t.unknown_attributes,
                Vec::new(),
            )
        }
        BpmnEventDefinition::Compensate(c) => {
            set_truthy(&mut attrs, "id", &c.id);
            set_truthy(&mut attrs, "activityRef", &c.activity_ref);
            (
                "compensateEventDefinition",
                &c.unknown_attributes,
                Vec::new(),
            )
        }
    };
    el(
        format!("{bp}{tag}"),
        with_unknown(attrs, unknown.as_ref()),
        children,
        None,
    )
}

// ---------------------------------------------------------------------------
// Extension elements and shared children
// ---------------------------------------------------------------------------

fn extension_elements(extensions: &[XmlElement], bp: &str) -> Vec<XmlElement> {
    if extensions.is_empty() {
        return Vec::new();
    }
    vec![el(
        format!("{bp}extensionElements"),
        Attrs::new(),
        extensions.to_vec(),
        None,
    )]
}

/// The `documentation` and `extensionElements` children shared by every BPMN base element, in
/// the order the schema declares them.
fn base_children(
    documentation: &Option<String>,
    documentation_attributes: &Option<Attrs>,
    extensions: &[XmlElement],
    bp: &str,
) -> Vec<XmlElement> {
    let mut children = Vec::new();
    if let Some(d) = documentation {
        children.push(leaf(
            format!("{bp}documentation"),
            documentation_attributes.clone().unwrap_or_default(),
            d,
        ));
    }
    children.extend(extension_elements(extensions, bp));
    children
}

fn ext_slice(e: &Option<Vec<XmlElement>>) -> &[XmlElement] {
    e.as_deref().unwrap_or(&[])
}

fn property(p: &BpmnProperty, bp: &str) -> XmlElement {
    let mut attrs = p.unknown_attributes.clone();
    set(&mut attrs, "id", &p.id);
    set(&mut attrs, "name", &p.name);
    set(&mut attrs, "itemSubjectRef", &p.item_subject_ref);
    el(format!("{bp}property"), attrs, Vec::new(), None)
}

fn data_association(a: &BpmnDataAssociation, tag: &str, bp: &str) -> XmlElement {
    let mut attrs = a.unknown_attributes.clone();
    set(&mut attrs, "id", &a.id);
    let mut children = base_children(
        &a.documentation,
        &a.documentation_attributes,
        ext_slice(&a.extension_elements),
        bp,
    );
    for r in &a.source_refs {
        children.push(leaf(format!("{bp}sourceRef"), Attrs::new(), r));
    }
    if let Some(t) = &a.target_ref {
        children.push(leaf(format!("{bp}targetRef"), Attrs::new(), t));
    }
    children.extend(a.unknown_children.iter().cloned());
    el(format!("{bp}{tag}"), attrs, children, None)
}

fn condition(tag: &str, c: &BpmnConditionExpression, bp: &str) -> XmlElement {
    leaf(format!("{bp}{tag}"), c.attributes.clone(), &c.text)
}

fn loop_characteristics(
    lc: &Option<BpmnMultiInstanceLoopCharacteristics>,
    bp: &str,
) -> Vec<XmlElement> {
    let Some(lc) = lc else { return Vec::new() };
    let mut attrs = Attrs::new();
    set(&mut attrs, "id", &lc.id);
    if lc.is_sequential == Some(true) {
        attrs.insert("isSequential".into(), "true".into());
    }
    let mut children = extension_elements(&lc.extension_elements, bp);
    if let Some(c) = &lc.loop_cardinality {
        children.push(condition("loopCardinality", c, bp));
    }
    if let Some(c) = &lc.completion_condition {
        children.push(condition("completionCondition", c, bp));
    }
    children.extend(lc.unknown_children.iter().cloned());
    vec![el(
        format!("{bp}multiInstanceLoopCharacteristics"),
        with_unknown(attrs, lc.unknown_attributes.as_ref()),
        children,
        None,
    )]
}

// ---------------------------------------------------------------------------
// Flow elements
// ---------------------------------------------------------------------------

fn flow_refs(refs: &[String], tag: &str, bp: &str) -> Vec<XmlElement> {
    let name = format!("{bp}{tag}");
    refs.iter()
        .map(|r| leaf(name.clone(), Attrs::new(), r))
        .collect()
}

/// An element name without its namespace prefix.
fn local_name(name: &str) -> &str {
    name.split_once(':').map_or(name, |(_, local)| local)
}

/// Event children (tCatchEvent / tThrowEvent) that precede the data associations.
const EVENT_DATA: [&str; 2] = ["dataInput", "dataOutput"];

/// Process children of tCallableElement and tProcess that precede the lane set and flow elements.
const PROCESS_HEAD: [&str; 6] = [
    "supportedInterfaceRef",
    "ioSpecification",
    "ioBinding",
    "auditing",
    "monitoring",
    "property",
];

fn flow_element(fe: &BpmnFlowElement, p: &Prefixes) -> XmlElement {
    let bp = p.bp.as_str();
    let base = fe.base();
    let mut attrs = id_then(&base.id, &base.unknown_attributes);
    set(&mut attrs, "name", &base.name);
    if base.is_for_compensation == Some(true) {
        attrs.insert("isForCompensation".into(), "true".into());
    }

    let mut children = Vec::new();
    if let Some(d) = &base.documentation {
        children.push(leaf(
            format!("{bp}documentation"),
            base.documentation_attributes.clone().unwrap_or_default(),
            d,
        ));
    }
    children.extend(extension_elements(&base.extension_elements, bp));
    children.extend(flow_refs(&base.incoming, "incoming", bp));
    children.extend(flow_refs(&base.outgoing, "outgoing", bp));
    // Unmodelled children the schema places between the modelled ones go there: an
    // activity's `ioSpecification` precedes its properties, and an event's data inputs and
    // outputs precede its data associations; Zeebe's XSD stage rejects any other order.
    let unknown = &base.unknown_children;
    children.extend(
        unknown
            .iter()
            .filter(|c| local_name(&c.name) == "ioSpecification")
            .cloned(),
    );
    for property_ in &base.properties {
        children.push(property(property_, bp));
    }
    children.extend(
        unknown
            .iter()
            .filter(|c| EVENT_DATA.contains(&local_name(&c.name)))
            .cloned(),
    );
    for a in &base.data_input_associations {
        children.push(data_association(a, "dataInputAssociation", bp));
    }
    for a in &base.data_output_associations {
        children.push(data_association(a, "dataOutputAssociation", bp));
    }
    children.extend(
        unknown
            .iter()
            .filter(|c| {
                let name = local_name(&c.name);
                name != "ioSpecification" && !EVENT_DATA.contains(&name)
            })
            .cloned(),
    );

    use BpmnFlowElement::*;
    match fe {
        StartEvent(e) => {
            if e.is_interrupting == Some(false) {
                attrs.insert("isInterrupting".into(), "false".into());
            }
            children.extend(event_definitions(&e.event_definitions, bp));
        }
        EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => {
            children.extend(event_definitions(&e.event_definitions, bp));
        }
        BoundaryEvent(e) => {
            attrs.insert("attachedToRef".into(), e.attached_to_ref.clone());
            if let Some(c) = e.cancel_activity {
                attrs.insert("cancelActivity".into(), bool_str(c));
            }
            children.extend(event_definitions(&e.event_definitions, bp));
        }
        Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
        | ManualTask(a) | CallActivity(a) => {
            children.extend(loop_characteristics(&a.loop_characteristics, bp));
        }
        SendTask(t) | ReceiveTask(t) => {
            set_truthy(&mut attrs, "messageRef", &t.message_ref);
            children.extend(loop_characteristics(&t.loop_characteristics, bp));
        }
        AdHocSubProcess(s) => {
            if let Some(c) = s.cancel_remaining_instances {
                attrs.insert("cancelRemainingInstances".into(), bool_str(c));
            }
            children.extend(loop_characteristics(&s.loop_characteristics, bp));
            children.extend(process_contents(&s.contents, p));
            if let Some(c) = &s.completion_condition {
                children.push(condition("completionCondition", c, bp));
            }
        }
        SubProcess(s) => {
            if let Some(t) = s.triggered_by_event {
                attrs.insert("triggeredByEvent".into(), bool_str(t));
            }
            children.extend(loop_characteristics(&s.loop_characteristics, bp));
            children.extend(process_contents(&s.contents, p));
        }
        EventSubProcess(s) => {
            // BPMN has no eventSubProcess element: it is a subProcess triggered by an event.
            attrs.insert("triggeredByEvent".into(), "true".into());
            children.extend(process_contents(&s.contents, p));
        }
        Transaction(s) => {
            children.extend(loop_characteristics(&s.loop_characteristics, bp));
            children.extend(process_contents(&s.contents, p));
        }
        ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => {
            set(&mut attrs, "default", &g.default);
        }
        ParallelGateway(_) | EventBasedGateway(_) => {}
        DataObject(d) => {
            if d.is_collection == Some(true) {
                attrs.insert("isCollection".into(), "true".into());
            }
        }
        DataObjectReference(d) => {
            // BPMN20.xsd allows isCollection only on dataObject; Zeebe rejects it here.
            set(&mut attrs, "dataObjectRef", &d.data_object_ref);
        }
        DataStoreReference(d) => set(&mut attrs, "dataStoreRef", &d.data_store_ref),
    }

    let tag = match fe {
        EventSubProcess(_) => "subProcess",
        _ => fe.type_name(),
    };
    el(format!("{bp}{tag}"), attrs, children, None)
}

fn sequence_flow(sf: &BpmnSequenceFlow, bp: &str) -> XmlElement {
    let mut attrs = Attrs::new();
    attrs.insert("id".into(), sf.id.clone());
    attrs.insert("sourceRef".into(), sf.source_ref.clone());
    attrs.insert("targetRef".into(), sf.target_ref.clone());
    let mut attrs = with_unknown(attrs, Some(&sf.unknown_attributes));
    set(&mut attrs, "name", &sf.name);

    let mut children = base_children(
        &sf.documentation,
        &sf.documentation_attributes,
        &sf.extension_elements,
        bp,
    );
    if let Some(c) = &sf.condition_expression {
        children.push(condition("conditionExpression", c, bp));
    }
    children.extend(sf.unknown_children.iter().cloned());
    el(format!("{bp}sequenceFlow"), attrs, children, None)
}

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

fn category(c: &BpmnCategory, bp: &str) -> XmlElement {
    let mut attrs = c.unknown_attributes.clone();
    set(&mut attrs, "id", &c.id);
    set(&mut attrs, "name", &c.name);
    let children = c
        .category_values
        .iter()
        .map(|v| {
            let mut a = id_then(&v.id, &v.unknown_attributes);
            set(&mut a, "value", &v.value);
            el(format!("{bp}categoryValue"), a, Vec::new(), None)
        })
        .collect();
    el(format!("{bp}category"), attrs, children, None)
}

fn text_annotation(t: &BpmnTextAnnotation, bp: &str) -> XmlElement {
    let mut children = base_children(
        &t.documentation,
        &t.documentation_attributes,
        ext_slice(&t.extension_elements),
        bp,
    );
    if let Some(text) = &t.text {
        children.push(leaf(format!("{bp}text"), Attrs::new(), text));
    }
    el(
        format!("{bp}textAnnotation"),
        id_then(&t.id, &t.unknown_attributes),
        children,
        None,
    )
}

fn association(a: &BpmnAssociation, bp: &str) -> XmlElement {
    let mut attrs = Attrs::new();
    attrs.insert("id".into(), a.id.clone());
    attrs.insert("sourceRef".into(), a.source_ref.clone());
    attrs.insert("targetRef".into(), a.target_ref.clone());
    let mut attrs = with_unknown(attrs, Some(&a.unknown_attributes));
    set(&mut attrs, "associationDirection", &a.association_direction);
    let children = base_children(
        &a.documentation,
        &a.documentation_attributes,
        ext_slice(&a.extension_elements),
        bp,
    );
    el(format!("{bp}association"), attrs, children, None)
}

fn group(g: &BpmnGroup, bp: &str) -> XmlElement {
    let mut attrs = id_then(&g.id, &g.unknown_attributes);
    set(&mut attrs, "categoryValueRef", &g.category_value_ref);
    let children = base_children(
        &g.documentation,
        &g.documentation_attributes,
        ext_slice(&g.extension_elements),
        bp,
    );
    el(format!("{bp}group"), attrs, children, None)
}

fn process_contents(c: &BpmnProcessContents, p: &Prefixes) -> Vec<XmlElement> {
    let bp = p.bp.as_str();
    let mut children = Vec::new();
    children.extend(c.flow_elements.iter().map(|fe| flow_element(fe, p)));
    children.extend(c.sequence_flows.iter().map(|sf| sequence_flow(sf, bp)));
    children.extend(c.text_annotations.iter().map(|t| text_annotation(t, bp)));
    children.extend(c.associations.iter().map(|a| association(a, bp)));
    children.extend(c.groups.iter().map(|g| group(g, bp)));
    children
}

// ---------------------------------------------------------------------------
// Lanes, process, collaboration
// ---------------------------------------------------------------------------

fn lane(l: &BpmnLane, bp: &str) -> XmlElement {
    let mut attrs = id_then(&l.id, &l.unknown_attributes);
    set(&mut attrs, "name", &l.name);
    let mut children = base_children(
        &l.documentation,
        &l.documentation_attributes,
        ext_slice(&l.extension_elements),
        bp,
    );
    children.extend(flow_refs(&l.flow_node_refs, "flowNodeRef", bp));
    if let Some(ls) = &l.child_lane_set {
        children.push(lane_set(ls, bp, "childLaneSet"));
    }
    el(format!("{bp}lane"), attrs, children, None)
}

/// `tag` is `childLaneSet` inside a lane: BPMN names the nested set differently.
fn lane_set(ls: &BpmnLaneSet, bp: &str, tag: &str) -> XmlElement {
    let mut attrs = ls.unknown_attributes.clone().unwrap_or_default();
    set_truthy(&mut attrs, "id", &ls.id);
    set(&mut attrs, "name", &ls.name);
    let children = ls.lanes.iter().map(|l| lane(l, bp)).collect();
    el(format!("{bp}{tag}"), attrs, children, None)
}

fn process(pr: &BpmnProcess, p: &Prefixes) -> XmlElement {
    let bp = p.bp.as_str();
    let mut attrs = id_then(&pr.id, &pr.unknown_attributes);
    set(&mut attrs, "name", &pr.name);
    if let Some(executable) = pr.is_executable {
        attrs.insert("isExecutable".into(), executable.to_string());
    }
    let mut children = base_children(
        &pr.documentation,
        &pr.documentation_attributes,
        &pr.extension_elements,
        bp,
    );
    let head = |c: &&XmlElement| PROCESS_HEAD.contains(&local_name(&c.name));
    children.extend(pr.unknown_children.iter().filter(head).cloned());
    if let Some(ls) = &pr.lane_set {
        children.push(lane_set(ls, bp, "laneSet"));
    }
    children.extend(process_contents(&pr.contents, p));
    children.extend(pr.unknown_children.iter().filter(|c| !head(c)).cloned());
    el(format!("{bp}process"), attrs, children, None)
}

fn participant(pa: &BpmnParticipant, bp: &str) -> XmlElement {
    let mut attrs = id_then(&pa.id, &pa.unknown_attributes);
    set(&mut attrs, "name", &pa.name);
    set(&mut attrs, "processRef", &pa.process_ref);
    let children = base_children(
        &pa.documentation,
        &pa.documentation_attributes,
        ext_slice(&pa.extension_elements),
        bp,
    );
    el(format!("{bp}participant"), attrs, children, None)
}

fn message_flow(mf: &BpmnMessageFlow, bp: &str) -> XmlElement {
    let mut attrs = Attrs::new();
    attrs.insert("id".into(), mf.id.clone());
    attrs.insert("sourceRef".into(), mf.source_ref.clone());
    attrs.insert("targetRef".into(), mf.target_ref.clone());
    let mut attrs = with_unknown(attrs, Some(&mf.unknown_attributes));
    set(&mut attrs, "name", &mf.name);
    set(&mut attrs, "messageRef", &mf.message_ref);
    let children = base_children(
        &mf.documentation,
        &mf.documentation_attributes,
        ext_slice(&mf.extension_elements),
        bp,
    );
    el(format!("{bp}messageFlow"), attrs, children, None)
}

fn collaboration(c: &BpmnCollaboration, bp: &str) -> XmlElement {
    // A collaboration has no `documentation` field: only its extensions come out first.
    let mut children = extension_elements(&c.extension_elements, bp);
    children.extend(c.participants.iter().map(|p| participant(p, bp)));
    children.extend(c.message_flows.iter().map(|m| message_flow(m, bp)));
    children.extend(c.text_annotations.iter().map(|t| text_annotation(t, bp)));
    children.extend(c.associations.iter().map(|a| association(a, bp)));
    children.extend(c.groups.iter().map(|g| group(g, bp)));
    children.extend(c.unknown_children.iter().cloned());
    let mut attrs = id_then(&c.id, &c.unknown_attributes);
    set(&mut attrs, "name", &c.name);
    el(format!("{bp}collaboration"), attrs, children, None)
}

// ---------------------------------------------------------------------------
// Root elements
// ---------------------------------------------------------------------------

/// `{ ...unknown, id, name, code }`: for these four the unknown attributes come first.
fn root_element_attrs(
    unknown: &Attrs,
    id: &str,
    name: &Option<String>,
    code: Option<(&str, &Option<String>)>,
) -> Attrs {
    let mut attrs = unknown.clone();
    attrs.insert("id".into(), id.to_owned());
    set(&mut attrs, "name", name);
    if let Some((key, value)) = code {
        set(&mut attrs, key, value);
    }
    attrs
}

fn error(e: &BpmnError, bp: &str) -> XmlElement {
    let attrs = root_element_attrs(
        &e.unknown_attributes,
        &e.id,
        &e.name,
        Some(("errorCode", &e.error_code)),
    );
    let children = base_children(
        &e.documentation,
        &e.documentation_attributes,
        ext_slice(&e.extension_elements),
        bp,
    );
    el(format!("{bp}error"), attrs, children, None)
}

fn escalation(e: &BpmnEscalation, bp: &str) -> XmlElement {
    let attrs = root_element_attrs(
        &e.unknown_attributes,
        &e.id,
        &e.name,
        Some(("escalationCode", &e.escalation_code)),
    );
    let children = base_children(
        &e.documentation,
        &e.documentation_attributes,
        ext_slice(&e.extension_elements),
        bp,
    );
    el(format!("{bp}escalation"), attrs, children, None)
}

fn message(m: &BpmnMessage, bp: &str) -> XmlElement {
    let mut attrs = id_then(&m.id, &m.unknown_attributes);
    set(&mut attrs, "name", &m.name);
    let children = base_children(
        &m.documentation,
        &m.documentation_attributes,
        ext_slice(&m.extension_elements),
        bp,
    );
    el(format!("{bp}message"), attrs, children, None)
}

fn signal(s: &BpmnSignal, bp: &str) -> XmlElement {
    let attrs = root_element_attrs(&s.unknown_attributes, &s.id, &s.name, None);
    let children = base_children(
        &s.documentation,
        &s.documentation_attributes,
        ext_slice(&s.extension_elements),
        bp,
    );
    el(format!("{bp}signal"), attrs, children, None)
}

// ---------------------------------------------------------------------------
// Diagram interchange
// ---------------------------------------------------------------------------

fn bounds(b: &BpmnBounds, dc: &str) -> XmlElement {
    let mut attrs = Attrs::new();
    attrs.insert("x".into(), js_number_to_string(b.x));
    attrs.insert("y".into(), js_number_to_string(b.y));
    attrs.insert("width".into(), js_number_to_string(b.width));
    attrs.insert("height".into(), js_number_to_string(b.height));
    el(format!("{dc}Bounds"), attrs, Vec::new(), None)
}

fn di_label(l: &BpmnDiLabel, bdi: &str, dc: &str) -> XmlElement {
    let children = l.bounds.iter().map(|b| bounds(b, dc)).collect();
    el(
        format!("{bdi}BPMNLabel"),
        l.unknown_attributes.clone().unwrap_or_default(),
        children,
        None,
    )
}

/// The `id` / `bpmnElement` pair of a DI element, leaving out the ones the model holds as
/// `""`: BPMN DI makes both optional, and the parser reads an absent one as empty.
fn di_refs(id: &str, bpmn_element: &str) -> Attrs {
    let mut refs = Attrs::new();
    if !id.is_empty() {
        refs.insert("id".into(), id.to_owned());
    }
    if !bpmn_element.is_empty() {
        refs.insert("bpmnElement".into(), bpmn_element.to_owned());
    }
    refs
}

fn di_shape(s: &BpmnDiShape, p: &Prefixes) -> XmlElement {
    let mut attrs = with_unknown(di_refs(&s.id, &s.bpmn_element), Some(&s.unknown_attributes));
    for (key, value) in [
        ("isMarkerVisible", s.is_marker_visible),
        ("isExpanded", s.is_expanded),
        ("isHorizontal", s.is_horizontal),
    ] {
        if let Some(v) = value {
            attrs.insert(key.into(), bool_str(v));
        }
    }
    let mut children = vec![bounds(&s.bounds, &p.dc)];
    if let Some(l) = &s.label {
        children.push(di_label(l, &p.bdi, &p.dc));
    }
    el(format!("{}BPMNShape", p.bdi), attrs, children, None)
}

fn di_edge(e: &BpmnDiEdge, p: &Prefixes) -> XmlElement {
    let attrs = with_unknown(di_refs(&e.id, &e.bpmn_element), Some(&e.unknown_attributes));
    let mut children: Vec<XmlElement> = e
        .waypoints
        .iter()
        .map(|w| {
            let mut a = w.unknown_attributes.clone().unwrap_or_default();
            a.insert("x".into(), js_number_to_string(w.x));
            a.insert("y".into(), js_number_to_string(w.y));
            el(format!("{}waypoint", p.di), a, Vec::new(), None)
        })
        .collect();
    if let Some(l) = &e.label {
        children.push(di_label(l, &p.bdi, &p.dc));
    }
    el(format!("{}BPMNEdge", p.bdi), attrs, children, None)
}

fn diagram(d: &BpmnDiagram, p: &Prefixes) -> XmlElement {
    let mut plane_children: Vec<XmlElement> =
        d.plane.shapes.iter().map(|s| di_shape(s, p)).collect();
    plane_children.extend(d.plane.edges.iter().map(|e| di_edge(e, p)));
    let plane = el(
        format!("{}BPMNPlane", p.bdi),
        with_unknown(
            di_refs(&d.plane.id, &d.plane.bpmn_element),
            d.plane.unknown_attributes.as_ref(),
        ),
        plane_children,
        None,
    );
    let mut children = vec![plane];
    children.extend(d.unknown_children.iter().cloned());
    el(
        format!("{}BPMNDiagram", p.bdi),
        with_unknown(di_refs(&d.id, ""), d.unknown_attributes.as_ref()),
        children,
        None,
    )
}

// ---------------------------------------------------------------------------
// Namespace repair
// ---------------------------------------------------------------------------

/// Prefixes an element tree uses, and prefixes it declares, at any depth.
fn collect_prefixes(
    node: &XmlElement,
    used: &mut IndexSet<String>,
    declared: &mut IndexSet<String>,
) {
    if let Some((prefix, _)) = node.name.split_once(':') {
        used.insert(prefix.to_owned());
    }
    for key in node.attributes.keys() {
        if let Some(prefix) = key.strip_prefix("xmlns:") {
            declared.insert(prefix.to_owned());
        } else if key != "xmlns" {
            if let Some((prefix, _)) = key.split_once(':') {
                used.insert(prefix.to_owned());
            }
        }
    }
    for child in &node.children {
        collect_prefixes(child, used, declared);
    }
}

/// Declares any known extension namespace the document uses but does not announce.
///
/// A model parsed from a vendor-neutral file has no `zeebe` declaration; give one of its tasks
/// a `zeebe:taskDefinition` (what applying a connector template does) and the export would
/// otherwise carry a prefix bound to nothing, which a conforming reader may reject. A prefix
/// declared anywhere counts, since a nested element can bind `xsi` on its own and the parser
/// keeps only root-level bindings in `namespaces`.
fn declare_used_namespaces(root: &mut XmlElement) {
    let mut used = IndexSet::new();
    let mut declared = IndexSet::new();
    collect_prefixes(root, &mut used, &mut declared);
    for prefix in &used {
        if declared.contains(prefix) {
            continue;
        }
        if let Some((_, uri)) = KNOWN_NAMESPACE_URIS.iter().find(|(p, _)| p == prefix) {
            root.attributes
                .insert(format!("xmlns:{prefix}"), (*uri).to_owned());
        }
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Serializes a model to BPMN XML.
pub fn serialize_bpmn(definitions: &BpmnDefinitions) -> String {
    let ns = &definitions.namespaces;
    let p = Prefixes {
        bp: qualifier(ns, BPMN_NS, "bpmn"),
        bdi: qualifier(ns, BPMNDI_NS, "bpmndi"),
        dc: qualifier(ns, DC_NS, "dc"),
        di: qualifier(ns, DI_NS, "di"),
    };
    let bp = p.bp.as_str();

    let mut attrs = Attrs::new();
    for (prefix, uri) in ns {
        if prefix.is_empty() {
            attrs.insert("xmlns".into(), uri.clone());
        } else {
            attrs.insert(format!("xmlns:{prefix}"), uri.clone());
        }
    }
    attrs.insert("id".into(), definitions.id.clone());
    attrs.insert(
        "targetNamespace".into(),
        definitions.target_namespace.clone(),
    );
    set(&mut attrs, "exporter", &definitions.exporter);
    set(&mut attrs, "exporterVersion", &definitions.exporter_version);
    for (k, v) in &definitions.unknown_attributes {
        attrs.insert(k.clone(), v.clone());
    }

    let mut children = Vec::new();
    if let Some(d) = &definitions.documentation {
        children.push(leaf(
            format!("{bp}documentation"),
            definitions
                .documentation_attributes
                .clone()
                .unwrap_or_default(),
            d,
        ));
    }
    children.extend(definitions.categories.iter().map(|c| category(c, bp)));
    // Unmodelled children first: `import` and `extension` precede the root elements in the
    // schema, and the rest are root elements themselves, so they sit legally alongside the
    // modelled ones. `relationship` is the exception: the schema puts it after the diagrams.
    let is_relationship = |c: &&XmlElement| local_name(&c.name) == "relationship";
    children.extend(
        definitions
            .unknown_children
            .iter()
            .filter(|c| !is_relationship(c))
            .cloned(),
    );
    children.extend(definitions.escalations.iter().map(|e| escalation(e, bp)));
    children.extend(definitions.errors.iter().map(|e| error(e, bp)));
    children.extend(definitions.messages.iter().map(|m| message(m, bp)));
    children.extend(definitions.signals.iter().map(|s| signal(s, bp)));
    children.extend(
        definitions
            .collaborations
            .iter()
            .map(|c| collaboration(c, bp)),
    );
    children.extend(definitions.processes.iter().map(|pr| process(pr, &p)));
    children.extend(definitions.diagrams.iter().map(|d| diagram(d, &p)));
    children.extend(
        definitions
            .unknown_children
            .iter()
            .filter(is_relationship)
            .cloned(),
    );

    let mut root = el(format!("{bp}definitions"), attrs, children, None);
    declare_used_namespaces(&mut root);
    serialize_xml(&root)
}
