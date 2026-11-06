//! Port of `bpmn-parser.ts`: one streaming pass over `scan_xml`, one frame per known element.
//!
//! A frame keeps only what the model needs and hands the finished model object to its parent
//! at the end tag (`Out`), which is the Rust shape of TS's "push into the target array".
//! Unknown children are skipped by the scanner without allocation; only the content of
//! `<extensionElements>` and captured unknown subtrees is materialised as `XmlElement` trees.

use crate::model::*;
use crate::number::{js_number, js_trim};
use bpmnkit_spec::elements::{bpmn_element, BpmnTrait};
use bpmnkit_xml::{local_name, scan_xml, Attrs, Visit, XmlElement, XmlSink};
use std::fmt;

// Element kinds come from spec/elements/bpmn.json, the same data TS's parser reads.
fn has_trait(local: &str, t: BpmnTrait) -> bool {
    bpmn_element(local).is_some_and(|e| e.traits.contains(&t))
}

/// The attributes `BpmnDefinitions` models. Checked against its own list rather than
/// `KNOWN_ATTRS`, which names flow-node attributes: a `name` on `<definitions>` is not
/// modelled, so it has to travel in `unknown_attributes` or it is lost.
const DEFINITIONS_ATTRS: &[&str] = &["id", "targetNamespace", "exporter", "exporterVersion"];

/// Known attribute names on flow nodes: everything else goes to `unknown_attributes`.
const KNOWN_ATTRS: &[&str] = &[
    "id",
    "name",
    "attachedToRef",
    "cancelActivity",
    "isForCompensation",
    "sourceRef",
    "targetRef",
    "associationDirection",
    "isExecutable",
    "isMarkerVisible",
    "isExpanded",
    "isHorizontal",
    "bpmnElement",
    "errorRef",
    "escalationRef",
    "errorCode",
    "escalationCode",
    "targetNamespace",
    "exporter",
    "exporterVersion",
    "processRef",
    "messageRef",
    "dataObjectRef",
    "dataStoreRef",
    "isCollection",
    "categoryValueRef",
];

fn is_event_type(t: &str) -> bool {
    has_trait(t, BpmnTrait::Event)
}
fn is_loop_type(t: &str) -> bool {
    has_trait(t, BpmnTrait::Loop)
}
fn is_container_type(t: &str) -> bool {
    has_trait(t, BpmnTrait::Container)
}
fn is_event_definition(local: &str) -> bool {
    has_trait(local, BpmnTrait::EventDefinition)
}
fn flow_element_type(local: &str) -> Option<&'static str> {
    bpmn_element(local)
        .filter(|e| e.traits.contains(&BpmnTrait::FlowElement))
        .map(|e| e.name)
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/// A document that is not well-formed or lacks something the model requires. The message is
/// the one the TS parser throws.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError(pub String);

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for ParseError {}

type Res<T> = Result<T, ParseError>;

// ---------------------------------------------------------------------------
// Attribute helpers
// ---------------------------------------------------------------------------

/// True when `qname` is `local` or `<prefix>:<local>`.
fn has_local_name(qname: &str, local: &str) -> bool {
    match qname.find(':') {
        None => qname == local,
        Some(i) => &qname[i + 1..] == local,
    }
}

/// The attribute `name`, or failing that a namespace-qualified spelling of it.
fn attr<'a>(attrs: &'a Attrs, name: &str) -> Option<&'a str> {
    if let Some(v) = attrs.get(name) {
        return Some(v);
    }
    attrs
        .iter()
        .find(|(k, _)| k.len() > name.len() && has_local_name(k, name))
        .map(|(_, v)| v.as_str())
}

fn attr_string(attrs: &Attrs, name: &str) -> Option<String> {
    attr(attrs, name).map(str::to_owned)
}

fn attr_bool(attrs: &Attrs, name: &str) -> Option<bool> {
    attr(attrs, name).map(|v| v == "true")
}

fn required_attr(attrs: &Attrs, name: &str, element_name: &str) -> Res<String> {
    attr_string(attrs, name).ok_or_else(|| {
        ParseError(format!(
            "Missing required attribute \"{name}\" on <{element_name}>"
        ))
    })
}

/// The attributes not modelled as fields, namespace-qualified ones included.
fn unknown_attrs(attrs: &Attrs) -> Attrs {
    attrs
        .iter()
        .filter(|(key, _)| {
            let key = key.as_str();
            !(KNOWN_ATTRS.contains(&key)
                || key == "xmlns"
                || key.starts_with("xmlns:")
                || (key.contains(':') && KNOWN_ATTRS.contains(&local_name(key))))
        })
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

/// The attributes of a DI element that its model does not name, or `None` when there are none,
/// so a model built from a plain diagram carries no empty objects.
fn other_attrs(attrs: &Attrs, modelled: &[&str]) -> Option<Attrs> {
    let rest: Attrs = attrs
        .iter()
        .filter(|(k, _)| {
            !(modelled.contains(&k.as_str()) || *k == "xmlns" || k.starts_with("xmlns:"))
        })
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
    (!rest.is_empty()).then_some(rest)
}

/// A gateway models `default`, so a copy left in its unknown attributes would re-emit a stale
/// value after an edit. Activities keep theirs there: BPMN allows a default flow on any
/// activity and the model does not carry it.
fn gateway_base(mut base: BpmnFlowNodeBase) -> BpmnFlowNodeBase {
    base.unknown_attributes.shift_remove("default");
    base
}

fn parse_bounds(attrs: &Attrs) -> BpmnBounds {
    let n = |name| js_number(attr(attrs, name).unwrap_or("0"));
    BpmnBounds {
        x: n("x"),
        y: n("y"),
        width: n("width"),
        height: n("height"),
    }
}

// ---------------------------------------------------------------------------
// Frame protocol
// ---------------------------------------------------------------------------

/// Which text-bearing child a `TextFrame` reports back to its parent.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Slot {
    Incoming,
    Outgoing,
    Documentation,
    FlowNodeRef,
    Text,
    ConditionExpression,
    CompletionCondition,
    TimeDuration,
    TimeDate,
    TimeCycle,
    Condition,
    SourceRef,
    TargetRef,
    LoopCardinality,
}

/// What a finished frame hands to its parent.
enum Out {
    Done,
    Text {
        slot: Slot,
        text: Option<String>,
        attrs: Attrs,
    },
    Ext(Vec<XmlElement>),
    Unknown(XmlElement),
    Loop(BpmnMultiInstanceLoopCharacteristics),
    EventDef(BpmnEventDefinition),
    DataAssoc {
        output: bool,
        association: BpmnDataAssociation,
    },
    LaneSet(BpmnLaneSet),
    Lane(BpmnLane),
    Label(BpmnDiLabel),
    Shape(BpmnDiShape),
    Edge(BpmnDiEdge),
    Plane(PlaneParts),
    Flow(Box<BpmnFlowElement>),
    Sequence(Box<BpmnSequenceFlow>),
    Annotation(BpmnTextAnnotation),
    Association(BpmnAssociation),
    Group(BpmnGroup),
    Participant(BpmnParticipant),
    MessageFlow(BpmnMessageFlow),
    Error(BpmnError),
    Escalation(BpmnEscalation),
    Message(BpmnMessage),
    Signal(BpmnSignal),
    Category(BpmnCategory),
    Collaboration(Box<BpmnCollaboration>),
    Process(Box<BpmnProcess>),
    Diagram(Box<BpmnDiagram>),
    Definitions(Box<BpmnDefinitions>),
}

/// What the scanner does with a child element.
enum Child {
    /// The element is recognised but needs no frame, or is dropped: skip its subtree.
    Skip,
    Push(Box<dyn Frame>),
    /// The current frame (a `TreeFrame`) absorbs the element itself.
    Nested,
}

/// A frame's answer when asked for a child it might not own. `Miss` gives the attributes back
/// so the caller can still capture the element as unknown: "not part of the model" and
/// "recognised but not stored" must stay distinct.
enum Probe {
    Hit(Child),
    Miss(Attrs),
}

trait Frame {
    /// Whether this frame reads character data; the scanner skips it otherwise.
    fn wants_text(&self) -> bool {
        false
    }
    fn child(&mut self, _local: &str, _name: &str, _attrs: Attrs) -> Res<Child> {
        Ok(Child::Skip)
    }
    fn text(&mut self, _text: &str) {}
    /// A finished child's result.
    fn accept(&mut self, _out: Out) {}
    /// An end tag for an element this frame absorbed via `Child::Nested`.
    fn close(&mut self) -> bool {
        false
    }
    fn finish(self: Box<Self>) -> Res<Out>;
}

fn text_child(slot: Slot, attrs: Attrs) -> Child {
    Child::Push(Box::new(TextFrame {
        slot,
        attrs,
        value: None,
    }))
}

fn tree_child() -> Child {
    Child::Push(Box::new(TreeFrame::extensions()))
}

/// Captures an unrecognised child subtree verbatim so a round trip does not discard it. Only
/// ever called for "this element is not part of the model"; children a frame recognises but
/// chooses not to store keep returning `Child::Skip`, so nothing is captured twice.
fn capture_unknown(name: &str, attrs: Attrs) -> Child {
    Child::Push(Box::new(TreeFrame::unknown(name, attrs)))
}

/// Collects the direct character data of a leaf element; its children are skipped.
struct TextFrame {
    slot: Slot,
    attrs: Attrs,
    value: Option<String>,
}

impl Frame for TextFrame {
    fn wants_text(&self) -> bool {
        true
    }
    fn text(&mut self, text: &str) {
        self.value.get_or_insert_with(String::new).push_str(text);
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::Text {
            slot: self.slot,
            text: self.value,
            attrs: self.attrs,
        })
    }
}

/// Materialises the children of an `<extensionElements>`, or a captured unknown element, as
/// `XmlElement` trees. One frame covers the whole subtree, so nested elements never push
/// frames of their own.
struct TreeFrame {
    /// The captured element, or a bare child list for `<extensionElements>`.
    owner: XmlElement,
    is_unknown: bool,
    open: Vec<XmlElement>,
}

impl TreeFrame {
    fn extensions() -> Self {
        Self {
            owner: XmlElement::default(),
            is_unknown: false,
            open: Vec::new(),
        }
    }
    fn unknown(name: &str, attributes: Attrs) -> Self {
        Self {
            owner: XmlElement {
                name: name.to_owned(),
                attributes,
                children: Vec::new(),
                text: None,
            },
            is_unknown: true,
            open: Vec::new(),
        }
    }
}

/// Clears an element's text when it is only the indentation between its child elements.
/// Without this, re-serialising a nested extension or captured subtree re-emits that
/// indentation as content and it grows on every round trip.
fn drop_layout_whitespace(element: &mut XmlElement) {
    if !element.children.is_empty()
        && element
            .text
            .as_deref()
            .is_some_and(|t| js_trim(t).is_empty())
    {
        element.text = None;
    }
}

impl Frame for TreeFrame {
    fn wants_text(&self) -> bool {
        true
    }
    fn child(&mut self, _local: &str, name: &str, attributes: Attrs) -> Res<Child> {
        self.open.push(XmlElement {
            name: name.to_owned(),
            attributes,
            children: Vec::new(),
            text: None,
        });
        Ok(Child::Nested)
    }
    fn text(&mut self, text: &str) {
        let el = match self.open.last_mut() {
            Some(el) => el,
            // Character data directly inside <extensionElements> is not kept.
            None if self.is_unknown => &mut self.owner,
            None => return,
        };
        el.text.get_or_insert_with(String::new).push_str(text);
    }
    fn close(&mut self) -> bool {
        let Some(mut el) = self.open.pop() else {
            return false;
        };
        drop_layout_whitespace(&mut el);
        match self.open.last_mut() {
            Some(parent) => parent.children.push(el),
            None => self.owner.children.push(el),
        }
        true
    }
    fn finish(mut self: Box<Self>) -> Res<Out> {
        if self.is_unknown {
            drop_layout_whitespace(&mut self.owner);
            Ok(Out::Unknown(self.owner))
        } else {
            Ok(Out::Ext(self.owner.children))
        }
    }
}

// ---------------------------------------------------------------------------
// Shared pieces: documentation / extensionElements, process contents
// ---------------------------------------------------------------------------

/// The `documentation` and `extensionElements` every `tBaseElement` may carry.
#[derive(Default)]
struct BaseFields {
    documentation: Option<String>,
    documentation_attributes: Option<Attrs>,
    extension_elements: Option<Vec<XmlElement>>,
}

/// Shared handling of the two children every BPMN base element may have. A frame calls
/// `child`/`accept` first and falls through to its own cases when they miss.
#[derive(Default)]
struct Base {
    documentation: Option<String>,
    documentation_attributes: Option<Attrs>,
    documentation_seen: bool,
    extensions: Option<Vec<XmlElement>>,
}

impl Base {
    /// Only the first `documentation` and `extensionElements` count.
    fn child(&mut self, local: &str, attrs: Attrs) -> Probe {
        match local {
            "documentation" => Probe::Hit(if self.documentation_seen {
                Child::Skip
            } else {
                self.documentation_seen = true;
                text_child(Slot::Documentation, attrs)
            }),
            "extensionElements" => Probe::Hit(if self.extensions.is_some() {
                Child::Skip
            } else {
                self.extensions = Some(Vec::new());
                tree_child()
            }),
            _ => Probe::Miss(attrs),
        }
    }

    fn accept(&mut self, out: Out) -> Option<Out> {
        match out {
            Out::Text {
                slot: Slot::Documentation,
                text,
                attrs,
            } => {
                self.documentation = text;
                self.documentation_attributes = other_attrs(&attrs, &[]);
                None
            }
            Out::Ext(v) => {
                self.extensions = Some(v);
                None
            }
            other => Some(other),
        }
    }

    /// Only what is defined: an empty extension list is not reported.
    fn fields(self) -> BaseFields {
        BaseFields {
            documentation: self.documentation,
            documentation_attributes: self.documentation_attributes,
            extension_elements: self.extensions.filter(|e| !e.is_empty()),
        }
    }
}

/// A frame for a child of a flow-element container.
fn contents_child(local: &str, name: &str, attrs: Attrs) -> Res<Probe> {
    if let Some(kind) = flow_element_type(local) {
        return Ok(Probe::Hit(Child::Push(Box::new(FlowNodeFrame::new(
            kind, name, attrs,
        )?))));
    }
    Ok(Probe::Hit(Child::Push(match local {
        "sequenceFlow" => Box::new(SequenceFlowFrame::new(name, attrs)?),
        "textAnnotation" => Box::new(TextAnnotationFrame::new(name, attrs)),
        "association" => Box::new(BaseOnlyFrame::new(BaseKind::Association, name, attrs)),
        "group" => Box::new(BaseOnlyFrame::new(BaseKind::Group, name, attrs)),
        _ => return Ok(Probe::Miss(attrs)),
    })))
}

/// Stores a finished container child; hands anything else back.
fn accept_contents(contents: &mut BpmnProcessContents, out: Out) -> Option<Out> {
    match out {
        Out::Flow(f) => contents.flow_elements.push(*f),
        Out::Sequence(s) => contents.sequence_flows.push(*s),
        Out::Annotation(a) => contents.text_annotations.push(a),
        Out::Association(a) => contents.associations.push(a),
        Out::Group(g) => contents.groups.push(g),
        other => return Some(other),
    }
    None
}

// ---------------------------------------------------------------------------
// Attribute-only elements
// ---------------------------------------------------------------------------

#[derive(Clone, Copy)]
enum BaseKind {
    Association,
    Group,
    Participant,
    MessageFlow,
    Error,
    Escalation,
    Message,
    Signal,
}

/// An element whose only children are `documentation` and `extensionElements`; everything
/// else it needs comes from its attributes. Required attributes are checked at the end tag.
struct BaseOnlyFrame {
    kind: BaseKind,
    name: String,
    attrs: Attrs,
    base: Base,
}

impl BaseOnlyFrame {
    fn new(kind: BaseKind, name: &str, attrs: Attrs) -> Self {
        Self {
            kind,
            name: name.to_owned(),
            attrs,
            base: Base::default(),
        }
    }
}

impl Frame for BaseOnlyFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match self.base.child(local, attrs) {
            Probe::Hit(c) => c,
            Probe::Miss(_) => Child::Skip,
        })
    }
    fn accept(&mut self, out: Out) {
        self.base.accept(out);
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let Self {
            kind,
            name,
            attrs,
            base,
        } = *self;
        let b = base.fields();
        let req = |n: &str| required_attr(&attrs, n, &name);
        let opt = |n: &str| attr_string(&attrs, n);
        Ok(match kind {
            BaseKind::Association => Out::Association(BpmnAssociation {
                id: req("id")?,
                source_ref: req("sourceRef")?,
                target_ref: req("targetRef")?,
                association_direction: opt("associationDirection"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
            BaseKind::Group => Out::Group(BpmnGroup {
                id: req("id")?,
                category_value_ref: opt("categoryValueRef"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
            BaseKind::Participant => Out::Participant(BpmnParticipant {
                id: req("id")?,
                name: opt("name"),
                process_ref: opt("processRef"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
            BaseKind::MessageFlow => Out::MessageFlow(BpmnMessageFlow {
                id: req("id")?,
                name: opt("name"),
                source_ref: req("sourceRef")?,
                target_ref: req("targetRef")?,
                message_ref: opt("messageRef"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
            BaseKind::Error => Out::Error(BpmnError {
                id: req("id")?,
                name: opt("name"),
                error_code: opt("errorCode"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
            BaseKind::Escalation => Out::Escalation(BpmnEscalation {
                id: req("id")?,
                name: opt("name"),
                escalation_code: opt("escalationCode"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
            BaseKind::Message => Out::Message(BpmnMessage {
                id: req("id")?,
                name: opt("name"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
            BaseKind::Signal => Out::Signal(BpmnSignal {
                id: req("id")?,
                name: opt("name"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                unknown_attributes: unknown_attrs(&attrs),
            }),
        })
    }
}

// ---------------------------------------------------------------------------
// Flow elements
// ---------------------------------------------------------------------------

struct FlowNodeFrame {
    kind: &'static str,
    name: String,
    attrs: Attrs,
    id: String,
    incoming: Vec<String>,
    outgoing: Vec<String>,
    documentation: Option<String>,
    documentation_attributes: Option<Attrs>,
    documentation_seen: bool,
    extension_elements: Option<Vec<XmlElement>>,
    /// `Some` only for event types.
    event_definitions: Option<Vec<BpmnEventDefinition>>,
    loop_characteristics: Option<BpmnMultiInstanceLoopCharacteristics>,
    loop_seen: bool,
    completion_condition: Option<BpmnConditionExpression>,
    completion_seen: bool,
    unknown_children: Vec<XmlElement>,
    properties: Vec<BpmnProperty>,
    data_input_associations: Vec<BpmnDataAssociation>,
    data_output_associations: Vec<BpmnDataAssociation>,
    /// `Some` only for container activities.
    contents: Option<BpmnProcessContents>,
}

impl FlowNodeFrame {
    fn new(kind: &'static str, name: &str, attrs: Attrs) -> Res<Self> {
        let id = required_attr(&attrs, "id", name)?;
        Ok(Self {
            kind,
            name: name.to_owned(),
            attrs,
            id,
            incoming: Vec::new(),
            outgoing: Vec::new(),
            documentation: None,
            documentation_attributes: None,
            documentation_seen: false,
            extension_elements: None,
            event_definitions: is_event_type(kind).then(Vec::new),
            loop_characteristics: None,
            loop_seen: false,
            completion_condition: None,
            completion_seen: false,
            unknown_children: Vec::new(),
            properties: Vec::new(),
            data_input_associations: Vec::new(),
            data_output_associations: Vec::new(),
            contents: is_container_type(kind).then(BpmnProcessContents::default),
        })
    }
}

/// The ref a `<incoming>`-like element names, trimmed; blank ones are dropped.
fn trimmed_ref(text: Option<String>) -> Option<String> {
    text.map(|t| js_trim(&t).to_owned())
        .filter(|t| !t.is_empty())
}

impl Frame for FlowNodeFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        match local {
            "incoming" => return Ok(text_child(Slot::Incoming, attrs)),
            "outgoing" => return Ok(text_child(Slot::Outgoing, attrs)),
            "documentation" => {
                if self.documentation_seen {
                    return Ok(Child::Skip);
                }
                self.documentation_seen = true;
                return Ok(text_child(Slot::Documentation, attrs));
            }
            "extensionElements" => {
                if self.extension_elements.is_some() {
                    return Ok(Child::Skip);
                }
                self.extension_elements = Some(Vec::new());
                return Ok(tree_child());
            }
            "multiInstanceLoopCharacteristics" => {
                if !is_loop_type(self.kind) || self.loop_seen {
                    return Ok(Child::Skip);
                }
                self.loop_seen = true;
                return Ok(Child::Push(Box::new(LoopFrame::new(attrs))));
            }
            "completionCondition" => {
                if self.kind != "adHocSubProcess" || self.completion_seen {
                    return Ok(Child::Skip);
                }
                self.completion_seen = true;
                return Ok(text_child(Slot::CompletionCondition, attrs));
            }
            "property" => {
                self.properties.push(BpmnProperty {
                    id: attr_string(&attrs, "id"),
                    name: attr_string(&attrs, "name"),
                    item_subject_ref: attr_string(&attrs, "itemSubjectRef"),
                    unknown_attributes: unknown_attrs(&attrs),
                });
                return Ok(Child::Skip);
            }
            "dataInputAssociation" => {
                return Ok(Child::Push(Box::new(DataAssociationFrame::new(
                    attrs, false,
                ))))
            }
            "dataOutputAssociation" => {
                return Ok(Child::Push(Box::new(DataAssociationFrame::new(
                    attrs, true,
                ))))
            }
            _ => {}
        }
        if let Some(defs) = &mut self.event_definitions {
            if is_event_definition(local) {
                return Ok(event_definition_child(local, attrs, defs));
            }
        }
        let attrs = if self.contents.is_some() {
            match contents_child(local, name, attrs)? {
                Probe::Hit(c) => return Ok(c),
                Probe::Miss(attrs) => attrs,
            }
        } else {
            attrs
        };
        Ok(capture_unknown(name, attrs))
    }

    fn accept(&mut self, out: Out) {
        match out {
            Out::Text { slot, text, attrs } => match slot {
                Slot::Incoming => self.incoming.extend(trimmed_ref(text)),
                Slot::Outgoing => self.outgoing.extend(trimmed_ref(text)),
                Slot::Documentation => {
                    self.documentation = text;
                    self.documentation_attributes = other_attrs(&attrs, &[]);
                }
                Slot::CompletionCondition => {
                    self.completion_condition = Some(BpmnConditionExpression {
                        text: text.unwrap_or_default(),
                        attributes: attrs,
                    });
                }
                _ => {}
            },
            Out::Ext(v) => self.extension_elements = Some(v),
            Out::Loop(l) => self.loop_characteristics = Some(l),
            Out::EventDef(d) => {
                if let Some(defs) = &mut self.event_definitions {
                    defs.push(d);
                }
            }
            Out::DataAssoc {
                output,
                association,
            } => {
                if output {
                    self.data_output_associations.push(association);
                } else {
                    self.data_input_associations.push(association);
                }
            }
            Out::Unknown(el) => self.unknown_children.push(el),
            other => {
                if let Some(contents) = &mut self.contents {
                    accept_contents(contents, other);
                }
            }
        }
    }

    fn finish(self: Box<Self>) -> Res<Out> {
        let attrs = &self.attrs;
        let kind = self.kind;
        let compensation = (attr(attrs, "isForCompensation") == Some("true")).then_some(true);
        let mut base = BpmnFlowNodeBase {
            id: self.id.clone(),
            name: attr_string(attrs, "name"),
            incoming: self.incoming,
            outgoing: self.outgoing,
            documentation: self.documentation,
            documentation_attributes: self.documentation_attributes,
            extension_elements: self.extension_elements.unwrap_or_default(),
            unknown_attributes: unknown_attrs(attrs),
            is_for_compensation: None,
            properties: self.properties,
            data_input_associations: self.data_input_associations,
            data_output_associations: self.data_output_associations,
            unknown_children: self.unknown_children,
        };
        let event_definitions = self.event_definitions.unwrap_or_default();
        let contents = self.contents.unwrap_or_default();
        let loop_characteristics = self.loop_characteristics;
        let default = || attr_string(attrs, "default");

        let el = match kind {
            "startEvent" => BpmnFlowElement::StartEvent(BpmnStartEvent {
                base,
                event_definitions,
                is_interrupting: (attr(attrs, "isInterrupting") == Some("false")).then_some(false),
            }),
            "endEvent" => BpmnFlowElement::EndEvent(BpmnEvent {
                base,
                event_definitions,
            }),
            "intermediateCatchEvent" => BpmnFlowElement::IntermediateCatchEvent(BpmnEvent {
                base,
                event_definitions,
            }),
            "intermediateThrowEvent" => BpmnFlowElement::IntermediateThrowEvent(BpmnEvent {
                base,
                event_definitions,
            }),
            "boundaryEvent" => BpmnFlowElement::BoundaryEvent(BpmnBoundaryEvent {
                base,
                attached_to_ref: required_attr(attrs, "attachedToRef", &self.name)?,
                cancel_activity: attr_bool(attrs, "cancelActivity"),
                event_definitions,
            }),
            "task" | "serviceTask" | "scriptTask" | "userTask" | "businessRuleTask"
            | "manualTask" | "callActivity" => {
                base.is_for_compensation = compensation;
                let a = BpmnActivity {
                    base,
                    loop_characteristics,
                };
                match kind {
                    "task" => BpmnFlowElement::Task(a),
                    "serviceTask" => BpmnFlowElement::ServiceTask(a),
                    "scriptTask" => BpmnFlowElement::ScriptTask(a),
                    "userTask" => BpmnFlowElement::UserTask(a),
                    "businessRuleTask" => BpmnFlowElement::BusinessRuleTask(a),
                    "manualTask" => BpmnFlowElement::ManualTask(a),
                    _ => BpmnFlowElement::CallActivity(a),
                }
            }
            "sendTask" | "receiveTask" => {
                base.is_for_compensation = compensation;
                let t = BpmnMessageTask {
                    base,
                    message_ref: attr_string(attrs, "messageRef"),
                    loop_characteristics,
                };
                if kind == "sendTask" {
                    BpmnFlowElement::SendTask(t)
                } else {
                    BpmnFlowElement::ReceiveTask(t)
                }
            }
            "adHocSubProcess" => BpmnFlowElement::AdHocSubProcess(BpmnAdHocSubProcess {
                base,
                loop_characteristics,
                completion_condition: self.completion_condition,
                cancel_remaining_instances: attr_bool(attrs, "cancelRemainingInstances"),
                contents,
            }),
            "subProcess" => BpmnFlowElement::SubProcess(BpmnSubProcess {
                base,
                triggered_by_event: attr_bool(attrs, "triggeredByEvent"),
                loop_characteristics,
                contents,
            }),
            "eventSubProcess" => {
                BpmnFlowElement::EventSubProcess(BpmnEventSubProcess { base, contents })
            }
            "transaction" => BpmnFlowElement::Transaction(BpmnTransaction {
                base,
                loop_characteristics,
                contents,
            }),
            "exclusiveGateway" | "inclusiveGateway" | "complexGateway" => {
                let g = BpmnGateway {
                    base: gateway_base(base),
                    default: default(),
                };
                match kind {
                    "exclusiveGateway" => BpmnFlowElement::ExclusiveGateway(g),
                    "inclusiveGateway" => BpmnFlowElement::InclusiveGateway(g),
                    _ => BpmnFlowElement::ComplexGateway(g),
                }
            }
            "parallelGateway" => BpmnFlowElement::ParallelGateway(base),
            "eventBasedGateway" => BpmnFlowElement::EventBasedGateway(base),
            "dataObject" => BpmnFlowElement::DataObject(BpmnDataObject {
                base,
                is_collection: (attr(attrs, "isCollection") == Some("true")).then_some(true),
            }),
            "dataObjectReference" => {
                BpmnFlowElement::DataObjectReference(BpmnDataObjectReference {
                    base,
                    data_object_ref: attr_string(attrs, "dataObjectRef"),
                    is_collection: (attr(attrs, "isCollection") == Some("true")).then_some(true),
                })
            }
            "dataStoreReference" => BpmnFlowElement::DataStoreReference(BpmnDataStoreReference {
                base,
                data_store_ref: attr_string(attrs, "dataStoreRef"),
            }),
            _ => return Ok(Out::Done),
        };
        Ok(Out::Flow(Box::new(el)))
    }
}

// ---------------------------------------------------------------------------
// Event definitions
// ---------------------------------------------------------------------------

/// An event definition's unmodelled attributes, when there are any.
fn extras(attrs: &Attrs, modelled: &[&str]) -> Option<Attrs> {
    other_attrs(attrs, modelled)
}

/// The frame for a timer or conditional definition; every other kind has nothing below it
/// the model reads, so it is built right here and its subtree skipped.
fn event_definition_child(
    local: &str,
    attrs: Attrs,
    target: &mut Vec<BpmnEventDefinition>,
) -> Child {
    let id = || attr_string(&attrs, "id");
    let def = match local {
        "timerEventDefinition" => return Child::Push(Box::new(TimerDefinitionFrame::new(attrs))),
        "conditionalEventDefinition" => {
            return Child::Push(Box::new(ConditionalDefinitionFrame::new(attrs)))
        }
        "errorEventDefinition" => BpmnEventDefinition::Error(BpmnErrorEventDefinition {
            id: id(),
            error_ref: attr_string(&attrs, "errorRef"),
            unknown_attributes: extras(&attrs, &["id", "errorRef"]),
        }),
        "escalationEventDefinition" => {
            BpmnEventDefinition::Escalation(BpmnEscalationEventDefinition {
                id: id(),
                escalation_ref: attr_string(&attrs, "escalationRef"),
                unknown_attributes: extras(&attrs, &["id", "escalationRef"]),
            })
        }
        "messageEventDefinition" => BpmnEventDefinition::Message(BpmnMessageEventDefinition {
            id: id(),
            message_ref: attr_string(&attrs, "messageRef"),
            unknown_attributes: extras(&attrs, &["id", "messageRef"]),
        }),
        "signalEventDefinition" => BpmnEventDefinition::Signal(BpmnSignalEventDefinition {
            id: id(),
            signal_ref: attr_string(&attrs, "signalRef"),
            unknown_attributes: extras(&attrs, &["id", "signalRef"]),
        }),
        "linkEventDefinition" => BpmnEventDefinition::Link(BpmnLinkEventDefinition {
            id: id(),
            name: attr_string(&attrs, "name"),
            unknown_attributes: extras(&attrs, &["id", "name"]),
        }),
        "cancelEventDefinition" => BpmnEventDefinition::Cancel(BpmnIdOnlyEventDefinition {
            id: id(),
            unknown_attributes: extras(&attrs, &["id"]),
        }),
        "terminateEventDefinition" => BpmnEventDefinition::Terminate(BpmnIdOnlyEventDefinition {
            id: id(),
            unknown_attributes: extras(&attrs, &["id"]),
        }),
        "compensateEventDefinition" => {
            BpmnEventDefinition::Compensate(BpmnCompensateEventDefinition {
                id: id(),
                activity_ref: attr_string(&attrs, "activityRef"),
                unknown_attributes: extras(&attrs, &["id", "activityRef"]),
            })
        }
        _ => return Child::Skip,
    };
    target.push(def);
    Child::Skip
}

struct TimerPart {
    text: Option<String>,
    attrs: Attrs,
}

struct TimerDefinitionFrame {
    attrs: Attrs,
    /// Duration, date, cycle: seen at the start tag, filled in when the text arrives.
    seen: [bool; 3],
    parts: [Option<TimerPart>; 3],
}

impl TimerDefinitionFrame {
    fn new(attrs: Attrs) -> Self {
        Self {
            attrs,
            seen: [false; 3],
            parts: [None, None, None],
        }
    }
}

/// A present-but-empty part reads as `""`, not absent: modelers emit an empty `<timeDate/>`
/// for a timer whose value is still to be filled in, and dropping it would change which kind
/// of timer the event is.
fn part_text(part: &Option<TimerPart>) -> Option<String> {
    let part = part.as_ref()?;
    Some(part.text.as_deref().map_or("", js_trim).to_owned())
}

fn part_attributes(part: Option<TimerPart>) -> Option<Attrs> {
    part.map(|p| p.attrs).filter(|a| !a.is_empty())
}

impl Frame for TimerDefinitionFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        let (i, slot) = match local {
            "timeDuration" => (0, Slot::TimeDuration),
            "timeDate" => (1, Slot::TimeDate),
            "timeCycle" => (2, Slot::TimeCycle),
            _ => return Ok(Child::Skip),
        };
        if std::mem::replace(&mut self.seen[i], true) {
            return Ok(Child::Skip);
        }
        Ok(text_child(slot, attrs))
    }
    fn accept(&mut self, out: Out) {
        if let Out::Text { slot, text, attrs } = out {
            let i = match slot {
                Slot::TimeDuration => 0,
                Slot::TimeDate => 1,
                Slot::TimeCycle => 2,
                _ => return,
            };
            self.parts[i] = Some(TimerPart { text, attrs });
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let [duration, date, cycle] = self.parts;
        Ok(Out::EventDef(BpmnEventDefinition::Timer(
            BpmnTimerEventDefinition {
                id: attr_string(&self.attrs, "id"),
                time_duration: part_text(&duration),
                time_duration_attributes: part_attributes(duration),
                time_date: part_text(&date),
                time_date_attributes: part_attributes(date),
                time_cycle: part_text(&cycle),
                time_cycle_attributes: part_attributes(cycle),
                unknown_attributes: extras(&self.attrs, &["id"]),
            },
        )))
    }
}

struct ConditionalDefinitionFrame {
    attrs: Attrs,
    condition_seen: bool,
    condition: Option<String>,
    condition_attributes: Option<Attrs>,
    extension_elements: Option<Vec<XmlElement>>,
}

impl ConditionalDefinitionFrame {
    fn new(attrs: Attrs) -> Self {
        Self {
            attrs,
            condition_seen: false,
            condition: None,
            condition_attributes: None,
            extension_elements: None,
        }
    }
}

impl Frame for ConditionalDefinitionFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        if local == "extensionElements" {
            if self.extension_elements.is_some() {
                return Ok(Child::Skip);
            }
            self.extension_elements = Some(Vec::new());
            return Ok(tree_child());
        }
        if local != "condition" || self.condition_seen {
            return Ok(Child::Skip);
        }
        self.condition_seen = true;
        Ok(text_child(Slot::Condition, attrs))
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Text { text, attrs, .. } => {
                self.condition = text;
                self.condition_attributes = (!attrs.is_empty()).then_some(attrs);
            }
            Out::Ext(v) => self.extension_elements = Some(v),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::EventDef(BpmnEventDefinition::Conditional(
            BpmnConditionalEventDefinition {
                id: attr_string(&self.attrs, "id"),
                // Present but empty stays "", like a timer part: the element is still there.
                condition: self
                    .condition_seen
                    .then(|| self.condition.as_deref().map_or("", js_trim).to_owned()),
                condition_attributes: self.condition_attributes,
                extension_elements: self.extension_elements,
                unknown_attributes: extras(&self.attrs, &["id"]),
            },
        )))
    }
}

// ---------------------------------------------------------------------------
// Multi-instance loop
// ---------------------------------------------------------------------------

struct LoopFrame {
    attrs: Attrs,
    unknown_children: Vec<XmlElement>,
    extension_elements: Option<Vec<XmlElement>>,
    loop_cardinality: Option<BpmnConditionExpression>,
    cardinality_seen: bool,
    completion_condition: Option<BpmnConditionExpression>,
    completion_seen: bool,
}

impl LoopFrame {
    fn new(attrs: Attrs) -> Self {
        Self {
            attrs,
            unknown_children: Vec::new(),
            extension_elements: None,
            loop_cardinality: None,
            cardinality_seen: false,
            completion_condition: None,
            completion_seen: false,
        }
    }
}

impl Frame for LoopFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match local {
            "extensionElements" => {
                if self.extension_elements.is_some() {
                    Child::Skip
                } else {
                    self.extension_elements = Some(Vec::new());
                    tree_child()
                }
            }
            "loopCardinality" => {
                if std::mem::replace(&mut self.cardinality_seen, true) {
                    Child::Skip
                } else {
                    text_child(Slot::LoopCardinality, attrs)
                }
            }
            "completionCondition" => {
                if std::mem::replace(&mut self.completion_seen, true) {
                    Child::Skip
                } else {
                    text_child(Slot::CompletionCondition, attrs)
                }
            }
            _ => capture_unknown(name, attrs),
        })
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Text { slot, text, attrs } => {
                let expression = BpmnConditionExpression {
                    text: text.unwrap_or_default(),
                    attributes: attrs,
                };
                match slot {
                    Slot::LoopCardinality => self.loop_cardinality = Some(expression),
                    Slot::CompletionCondition => self.completion_condition = Some(expression),
                    _ => {}
                }
            }
            Out::Ext(v) => self.extension_elements = Some(v),
            Out::Unknown(el) => self.unknown_children.push(el),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        // Read straight from the attribute map, not `attr()`: a prefixed `x:id` is not ours.
        Ok(Out::Loop(BpmnMultiInstanceLoopCharacteristics {
            id: self.attrs.get("id").cloned(),
            is_sequential: (self.attrs.get("isSequential").map(String::as_str) == Some("true"))
                .then_some(true),
            loop_cardinality: self.loop_cardinality,
            completion_condition: self.completion_condition,
            extension_elements: self.extension_elements.unwrap_or_default(),
            unknown_children: self.unknown_children,
            unknown_attributes: extras(&self.attrs, &["id", "isSequential"]),
        }))
    }
}

// ---------------------------------------------------------------------------
// Sequence flows and annotations
// ---------------------------------------------------------------------------

struct SequenceFlowFrame {
    attrs: Attrs,
    id: String,
    source_ref: String,
    target_ref: String,
    condition_expression: Option<BpmnConditionExpression>,
    condition_seen: bool,
    documentation: Option<String>,
    documentation_attributes: Option<Attrs>,
    documentation_seen: bool,
    extension_elements: Option<Vec<XmlElement>>,
    unknown_children: Vec<XmlElement>,
}

impl SequenceFlowFrame {
    fn new(name: &str, attrs: Attrs) -> Res<Self> {
        let id = required_attr(&attrs, "id", name)?;
        let source_ref = required_attr(&attrs, "sourceRef", name)?;
        let target_ref = required_attr(&attrs, "targetRef", name)?;
        Ok(Self {
            attrs,
            id,
            source_ref,
            target_ref,
            condition_expression: None,
            condition_seen: false,
            documentation: None,
            documentation_attributes: None,
            documentation_seen: false,
            extension_elements: None,
            unknown_children: Vec::new(),
        })
    }
}

impl Frame for SequenceFlowFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match local {
            "conditionExpression" => {
                if std::mem::replace(&mut self.condition_seen, true) {
                    Child::Skip
                } else {
                    text_child(Slot::ConditionExpression, attrs)
                }
            }
            "documentation" => {
                if std::mem::replace(&mut self.documentation_seen, true) {
                    Child::Skip
                } else {
                    text_child(Slot::Documentation, attrs)
                }
            }
            "extensionElements" => {
                if self.extension_elements.is_some() {
                    Child::Skip
                } else {
                    self.extension_elements = Some(Vec::new());
                    tree_child()
                }
            }
            _ => capture_unknown(name, attrs),
        })
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Text {
                slot: Slot::Documentation,
                text,
                attrs,
            } => {
                self.documentation = text;
                self.documentation_attributes = other_attrs(&attrs, &[]);
            }
            Out::Text { text, attrs, .. } => {
                self.condition_expression = Some(BpmnConditionExpression {
                    text: text.unwrap_or_default(),
                    attributes: attrs,
                });
            }
            Out::Ext(v) => self.extension_elements = Some(v),
            Out::Unknown(el) => self.unknown_children.push(el),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::Sequence(Box::new(BpmnSequenceFlow {
            name: attr_string(&self.attrs, "name"),
            unknown_attributes: unknown_attrs(&self.attrs),
            id: self.id,
            source_ref: self.source_ref,
            target_ref: self.target_ref,
            documentation: self.documentation,
            documentation_attributes: self.documentation_attributes,
            condition_expression: self.condition_expression,
            extension_elements: self.extension_elements.unwrap_or_default(),
            unknown_children: self.unknown_children,
        })))
    }
}

struct TextAnnotationFrame {
    name: String,
    attrs: Attrs,
    base: Base,
    text_seen: bool,
    value: Option<String>,
}

impl TextAnnotationFrame {
    fn new(name: &str, attrs: Attrs) -> Self {
        Self {
            name: name.to_owned(),
            attrs,
            base: Base::default(),
            text_seen: false,
            value: None,
        }
    }
}

impl Frame for TextAnnotationFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        match self.base.child(local, attrs) {
            Probe::Hit(c) => Ok(c),
            Probe::Miss(attrs) => Ok(
                if local != "text" || std::mem::replace(&mut self.text_seen, true) {
                    Child::Skip
                } else {
                    text_child(Slot::Text, attrs)
                },
            ),
        }
    }
    fn accept(&mut self, out: Out) {
        if let Some(Out::Text { text, .. }) = self.base.accept(out) {
            self.value = text;
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let b = self.base.fields();
        Ok(Out::Annotation(BpmnTextAnnotation {
            id: required_attr(&self.attrs, "id", &self.name)?,
            text: self.value,
            documentation: b.documentation,
            documentation_attributes: b.documentation_attributes,
            extension_elements: b.extension_elements,
            unknown_attributes: unknown_attrs(&self.attrs),
        }))
    }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/// A root `bpmn:category`; its values supply the labels groups point at. Its own
/// `documentation` and `extensionElements` are not modelled, so they are skipped like any
/// other child.
struct CategoryFrame {
    attrs: Attrs,
    category_values: Vec<BpmnCategoryValue>,
}

impl Frame for CategoryFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        if local == "categoryValue" {
            if let Some(id) = attr_string(&attrs, "id") {
                self.category_values.push(BpmnCategoryValue {
                    id,
                    value: attr_string(&attrs, "value"),
                    unknown_attributes: unknown_attrs(&attrs),
                });
            }
        }
        Ok(Child::Skip)
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::Category(BpmnCategory {
            id: attr_string(&self.attrs, "id"),
            name: attr_string(&self.attrs, "name"),
            category_values: self.category_values,
            unknown_attributes: unknown_attrs(&self.attrs),
        }))
    }
}

// ---------------------------------------------------------------------------
// Data associations
// ---------------------------------------------------------------------------

/// A `dataInputAssociation` or `dataOutputAssociation` and its ref children.
struct DataAssociationFrame {
    attrs: Attrs,
    output: bool,
    base: Base,
    source_refs: Vec<String>,
    target_ref: Option<String>,
    unknown_children: Vec<XmlElement>,
}

impl DataAssociationFrame {
    fn new(attrs: Attrs, output: bool) -> Self {
        Self {
            attrs,
            output,
            base: Base::default(),
            source_refs: Vec::new(),
            target_ref: None,
            unknown_children: Vec::new(),
        }
    }
}

impl Frame for DataAssociationFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        match self.base.child(local, attrs) {
            Probe::Hit(c) => Ok(c),
            Probe::Miss(attrs) => Ok(match local {
                "sourceRef" => text_child(Slot::SourceRef, attrs),
                "targetRef" => text_child(Slot::TargetRef, attrs),
                _ => capture_unknown(name, attrs),
            }),
        }
    }
    fn accept(&mut self, out: Out) {
        match self.base.accept(out) {
            Some(Out::Text { slot, text, .. }) => {
                if let Some(r) = trimmed_ref(text) {
                    match slot {
                        Slot::SourceRef => self.source_refs.push(r),
                        Slot::TargetRef => self.target_ref = Some(r),
                        _ => {}
                    }
                }
            }
            Some(Out::Unknown(el)) => self.unknown_children.push(el),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let b = self.base.fields();
        Ok(Out::DataAssoc {
            output: self.output,
            association: BpmnDataAssociation {
                id: attr_string(&self.attrs, "id"),
                documentation: b.documentation,
                documentation_attributes: b.documentation_attributes,
                extension_elements: b.extension_elements,
                source_refs: self.source_refs,
                target_ref: self.target_ref,
                unknown_attributes: unknown_attrs(&self.attrs),
                unknown_children: self.unknown_children,
            },
        })
    }
}

// ---------------------------------------------------------------------------
// Lanes
// ---------------------------------------------------------------------------

struct LaneSetFrame {
    attrs: Attrs,
    lanes: Vec<BpmnLane>,
}

impl Frame for LaneSetFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        Ok(if local == "lane" {
            Child::Push(Box::new(LaneFrame {
                name: name.to_owned(),
                attrs,
                base: Base::default(),
                flow_node_refs: Vec::new(),
                child_lane_set: None,
                child_lane_set_seen: false,
            }))
        } else {
            Child::Skip
        })
    }
    fn accept(&mut self, out: Out) {
        if let Out::Lane(l) = out {
            self.lanes.push(l);
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::LaneSet(BpmnLaneSet {
            id: attr_string(&self.attrs, "id"),
            name: attr_string(&self.attrs, "name"),
            lanes: self.lanes,
            unknown_attributes: Some(unknown_attrs(&self.attrs)),
        }))
    }
}

struct LaneFrame {
    name: String,
    attrs: Attrs,
    base: Base,
    flow_node_refs: Vec<String>,
    child_lane_set: Option<BpmnLaneSet>,
    child_lane_set_seen: bool,
}

impl Frame for LaneFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        match self.base.child(local, attrs) {
            Probe::Hit(c) => Ok(c),
            Probe::Miss(attrs) => Ok(match local {
                "flowNodeRef" => text_child(Slot::FlowNodeRef, attrs),
                "childLaneSet" => {
                    if std::mem::replace(&mut self.child_lane_set_seen, true) {
                        Child::Skip
                    } else {
                        Child::Push(Box::new(LaneSetFrame {
                            attrs,
                            lanes: Vec::new(),
                        }))
                    }
                }
                _ => Child::Skip,
            }),
        }
    }
    fn accept(&mut self, out: Out) {
        match self.base.accept(out) {
            Some(Out::Text { text, .. }) => self.flow_node_refs.extend(trimmed_ref(text)),
            Some(Out::LaneSet(ls)) => self.child_lane_set = Some(ls),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let b = self.base.fields();
        Ok(Out::Lane(BpmnLane {
            id: required_attr(&self.attrs, "id", &self.name)?,
            name: attr_string(&self.attrs, "name"),
            flow_node_refs: self.flow_node_refs,
            child_lane_set: self.child_lane_set,
            documentation: b.documentation,
            documentation_attributes: b.documentation_attributes,
            extension_elements: b.extension_elements,
            unknown_attributes: unknown_attrs(&self.attrs),
        }))
    }
}

// ---------------------------------------------------------------------------
// Process
// ---------------------------------------------------------------------------

struct ProcessFrame {
    attrs: Attrs,
    id: String,
    unknown_children: Vec<XmlElement>,
    documentation: Option<String>,
    documentation_attributes: Option<Attrs>,
    documentation_seen: bool,
    extension_elements: Option<Vec<XmlElement>>,
    lane_set: Option<BpmnLaneSet>,
    lane_set_seen: bool,
    contents: BpmnProcessContents,
}

impl ProcessFrame {
    fn new(name: &str, attrs: Attrs) -> Res<Self> {
        let id = required_attr(&attrs, "id", name)?;
        Ok(Self {
            attrs,
            id,
            unknown_children: Vec::new(),
            documentation: None,
            documentation_attributes: None,
            documentation_seen: false,
            extension_elements: None,
            lane_set: None,
            lane_set_seen: false,
            contents: BpmnProcessContents::default(),
        })
    }
}

impl Frame for ProcessFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        match local {
            "documentation" => {
                if std::mem::replace(&mut self.documentation_seen, true) {
                    return Ok(Child::Skip);
                }
                Ok(text_child(Slot::Documentation, attrs))
            }
            "extensionElements" => {
                if self.extension_elements.is_some() {
                    return Ok(Child::Skip);
                }
                self.extension_elements = Some(Vec::new());
                Ok(tree_child())
            }
            "laneSet" => {
                if std::mem::replace(&mut self.lane_set_seen, true) {
                    return Ok(Child::Skip);
                }
                Ok(Child::Push(Box::new(LaneSetFrame {
                    attrs,
                    lanes: Vec::new(),
                })))
            }
            _ => Ok(match contents_child(local, name, attrs)? {
                Probe::Hit(c) => c,
                Probe::Miss(attrs) => capture_unknown(name, attrs),
            }),
        }
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Text {
                slot: Slot::Documentation,
                text,
                attrs,
            } => {
                self.documentation = text;
                self.documentation_attributes = other_attrs(&attrs, &[]);
            }
            Out::Ext(v) => self.extension_elements = Some(v),
            Out::LaneSet(ls) => self.lane_set = Some(ls),
            Out::Unknown(el) => self.unknown_children.push(el),
            other => {
                accept_contents(&mut self.contents, other);
            }
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let attrs = &self.attrs;
        Ok(Out::Process(Box::new(BpmnProcess {
            id: self.id.clone(),
            name: attr_string(attrs, "name"),
            is_executable: (attr(attrs, "isExecutable") == Some("true")).then_some(true),
            documentation: self.documentation,
            documentation_attributes: self.documentation_attributes,
            extension_elements: self.extension_elements.unwrap_or_default(),
            contents: self.contents,
            lane_set: self.lane_set,
            unknown_attributes: unknown_attrs(attrs),
            unknown_children: self.unknown_children,
        })))
    }
}

// ---------------------------------------------------------------------------
// Collaboration
// ---------------------------------------------------------------------------

struct CollaborationFrame {
    attrs: Attrs,
    id: String,
    participants: Vec<BpmnParticipant>,
    message_flows: Vec<BpmnMessageFlow>,
    text_annotations: Vec<BpmnTextAnnotation>,
    associations: Vec<BpmnAssociation>,
    groups: Vec<BpmnGroup>,
    unknown_children: Vec<XmlElement>,
    extension_elements: Option<Vec<XmlElement>>,
}

impl Frame for CollaborationFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match local {
            "participant" => Child::Push(Box::new(BaseOnlyFrame::new(
                BaseKind::Participant,
                name,
                attrs,
            ))),
            "messageFlow" => Child::Push(Box::new(BaseOnlyFrame::new(
                BaseKind::MessageFlow,
                name,
                attrs,
            ))),
            "textAnnotation" => Child::Push(Box::new(TextAnnotationFrame::new(name, attrs))),
            "association" => Child::Push(Box::new(BaseOnlyFrame::new(
                BaseKind::Association,
                name,
                attrs,
            ))),
            "group" => Child::Push(Box::new(BaseOnlyFrame::new(BaseKind::Group, name, attrs))),
            "extensionElements" => {
                if self.extension_elements.is_some() {
                    Child::Skip
                } else {
                    self.extension_elements = Some(Vec::new());
                    tree_child()
                }
            }
            _ => capture_unknown(name, attrs),
        })
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Participant(p) => self.participants.push(p),
            Out::MessageFlow(m) => self.message_flows.push(m),
            Out::Annotation(a) => self.text_annotations.push(a),
            Out::Association(a) => self.associations.push(a),
            Out::Group(g) => self.groups.push(g),
            Out::Ext(v) => self.extension_elements = Some(v),
            Out::Unknown(el) => self.unknown_children.push(el),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::Collaboration(Box::new(BpmnCollaboration {
            id: self.id,
            name: attr_string(&self.attrs, "name"),
            participants: self.participants,
            message_flows: self.message_flows,
            text_annotations: self.text_annotations,
            associations: self.associations,
            groups: self.groups,
            extension_elements: self.extension_elements.unwrap_or_default(),
            unknown_attributes: unknown_attrs(&self.attrs),
            unknown_children: self.unknown_children,
        })))
    }
}

// ---------------------------------------------------------------------------
// Diagram interchange
// ---------------------------------------------------------------------------

struct LabelFrame {
    attrs: Attrs,
    bounds: Option<BpmnBounds>,
}

impl Frame for LabelFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        if local == "Bounds" && self.bounds.is_none() {
            self.bounds = Some(parse_bounds(&attrs));
        }
        Ok(Child::Skip)
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::Label(BpmnDiLabel {
            bounds: self.bounds,
            unknown_attributes: other_attrs(&self.attrs, &[]),
        }))
    }
}

struct ShapeFrame {
    attrs: Attrs,
    bounds: Option<BpmnBounds>,
    label: Option<BpmnDiLabel>,
    label_seen: bool,
}

impl Frame for ShapeFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match local {
            "Bounds" => {
                if self.bounds.is_none() {
                    self.bounds = Some(parse_bounds(&attrs));
                }
                Child::Skip
            }
            "BPMNLabel" if !std::mem::replace(&mut self.label_seen, true) => {
                Child::Push(Box::new(LabelFrame {
                    attrs,
                    bounds: None,
                }))
            }
            _ => Child::Skip,
        })
    }
    fn accept(&mut self, out: Out) {
        if let Out::Label(l) = out {
            self.label = Some(l);
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let attrs = &self.attrs;
        let Some(bounds) = self.bounds else {
            return Err(ParseError(format!(
                "Missing <dc:Bounds> in shape \"{}\"",
                attr(attrs, "id").unwrap_or("undefined")
            )));
        };
        Ok(Out::Shape(BpmnDiShape {
            id: attr_string(attrs, "id").unwrap_or_default(),
            bpmn_element: attr_string(attrs, "bpmnElement").unwrap_or_default(),
            is_marker_visible: attr_bool(attrs, "isMarkerVisible"),
            is_expanded: attr_bool(attrs, "isExpanded"),
            is_horizontal: attr_bool(attrs, "isHorizontal"),
            bounds,
            label: self.label,
            unknown_attributes: unknown_attrs(attrs),
        }))
    }
}

struct EdgeFrame {
    attrs: Attrs,
    waypoints: Vec<BpmnWaypoint>,
    label: Option<BpmnDiLabel>,
    label_seen: bool,
}

impl Frame for EdgeFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match local {
            "waypoint" => {
                self.waypoints.push(BpmnWaypoint {
                    x: js_number(attr(&attrs, "x").unwrap_or("0")),
                    y: js_number(attr(&attrs, "y").unwrap_or("0")),
                    unknown_attributes: other_attrs(&attrs, &["x", "y"]),
                });
                Child::Skip
            }
            "BPMNLabel" if !std::mem::replace(&mut self.label_seen, true) => {
                Child::Push(Box::new(LabelFrame {
                    attrs,
                    bounds: None,
                }))
            }
            _ => Child::Skip,
        })
    }
    fn accept(&mut self, out: Out) {
        if let Out::Label(l) = out {
            self.label = Some(l);
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let attrs = &self.attrs;
        Ok(Out::Edge(BpmnDiEdge {
            id: attr_string(attrs, "id").unwrap_or_default(),
            bpmn_element: attr_string(attrs, "bpmnElement").unwrap_or_default(),
            waypoints: self.waypoints,
            label: self.label,
            unknown_attributes: unknown_attrs(attrs),
        }))
    }
}

/// What a finished `BPMNPlane` hands its diagram.
struct PlaneParts {
    attrs: Attrs,
    shapes: Vec<BpmnDiShape>,
    edges: Vec<BpmnDiEdge>,
}

struct PlaneFrame(PlaneParts);

impl Frame for PlaneFrame {
    fn child(&mut self, local: &str, _name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match local {
            "BPMNShape" => Child::Push(Box::new(ShapeFrame {
                attrs,
                bounds: None,
                label: None,
                label_seen: false,
            })),
            "BPMNEdge" => Child::Push(Box::new(EdgeFrame {
                attrs,
                waypoints: Vec::new(),
                label: None,
                label_seen: false,
            })),
            _ => Child::Skip,
        })
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Shape(s) => self.0.shapes.push(s),
            Out::Edge(e) => self.0.edges.push(e),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        Ok(Out::Plane(self.0))
    }
}

struct DiagramFrame {
    attrs: Attrs,
    plane: Option<PlaneParts>,
    plane_seen: bool,
    unknown_children: Vec<XmlElement>,
}

impl Frame for DiagramFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        if local != "BPMNPlane" {
            return Ok(capture_unknown(name, attrs));
        }
        if std::mem::replace(&mut self.plane_seen, true) {
            return Ok(Child::Skip);
        }
        Ok(Child::Push(Box::new(PlaneFrame(PlaneParts {
            attrs,
            shapes: Vec::new(),
            edges: Vec::new(),
        }))))
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Plane(p) => self.plane = Some(p),
            Out::Unknown(el) => self.unknown_children.push(el),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let Some(plane) = self.plane else {
            return Err(ParseError(
                "Missing <bpmndi:BPMNPlane> in diagram".to_owned(),
            ));
        };
        // BPMN DI makes every `id` and `bpmnElement` here optional, and real models (the OMG
        // interchange suite among them) omit them. An absent one reads as "" and is written
        // back absent.
        Ok(Out::Diagram(Box::new(BpmnDiagram {
            id: attr_string(&self.attrs, "id").unwrap_or_default(),
            plane: BpmnDiPlane {
                id: attr_string(&plane.attrs, "id").unwrap_or_default(),
                bpmn_element: attr_string(&plane.attrs, "bpmnElement").unwrap_or_default(),
                shapes: plane.shapes,
                edges: plane.edges,
                unknown_attributes: other_attrs(&plane.attrs, &["id", "bpmnElement"]),
            },
            unknown_attributes: other_attrs(&self.attrs, &["id"]),
            unknown_children: self.unknown_children,
        })))
    }
}

// ---------------------------------------------------------------------------
// Definitions (document root)
// ---------------------------------------------------------------------------

struct DefinitionsFrame {
    name: String,
    attrs: Attrs,
    categories: Vec<BpmnCategory>,
    documentation: Option<String>,
    documentation_attributes: Option<Attrs>,
    documentation_seen: bool,
    errors: Vec<BpmnError>,
    escalations: Vec<BpmnEscalation>,
    messages: Vec<BpmnMessage>,
    signals: Vec<BpmnSignal>,
    collaborations: Vec<BpmnCollaboration>,
    processes: Vec<BpmnProcess>,
    diagrams: Vec<BpmnDiagram>,
    unknown_children: Vec<XmlElement>,
}

impl Frame for DefinitionsFrame {
    fn child(&mut self, local: &str, name: &str, attrs: Attrs) -> Res<Child> {
        Ok(match local {
            "documentation" => {
                if std::mem::replace(&mut self.documentation_seen, true) {
                    Child::Skip
                } else {
                    text_child(Slot::Documentation, attrs)
                }
            }
            "error" => Child::Push(Box::new(BaseOnlyFrame::new(BaseKind::Error, name, attrs))),
            "escalation" => Child::Push(Box::new(BaseOnlyFrame::new(
                BaseKind::Escalation,
                name,
                attrs,
            ))),
            "message" => Child::Push(Box::new(BaseOnlyFrame::new(BaseKind::Message, name, attrs))),
            "signal" => Child::Push(Box::new(BaseOnlyFrame::new(BaseKind::Signal, name, attrs))),
            "category" => Child::Push(Box::new(CategoryFrame {
                attrs,
                category_values: Vec::new(),
            })),
            "collaboration" => Child::Push(Box::new(CollaborationFrame {
                id: required_attr(&attrs, "id", name)?,
                attrs,
                participants: Vec::new(),
                message_flows: Vec::new(),
                text_annotations: Vec::new(),
                associations: Vec::new(),
                groups: Vec::new(),
                unknown_children: Vec::new(),
                extension_elements: None,
            })),
            "process" => Child::Push(Box::new(ProcessFrame::new(name, attrs)?)),
            "BPMNDiagram" => Child::Push(Box::new(DiagramFrame {
                attrs,
                plane: None,
                plane_seen: false,
                unknown_children: Vec::new(),
            })),
            _ => capture_unknown(name, attrs),
        })
    }
    fn accept(&mut self, out: Out) {
        match out {
            Out::Text {
                slot: Slot::Documentation,
                text,
                attrs,
            } => {
                self.documentation = text;
                self.documentation_attributes = other_attrs(&attrs, &[]);
            }
            Out::Error(e) => self.errors.push(e),
            Out::Escalation(e) => self.escalations.push(e),
            Out::Message(m) => self.messages.push(m),
            Out::Signal(s) => self.signals.push(s),
            Out::Category(c) => self.categories.push(c),
            Out::Collaboration(c) => self.collaborations.push(*c),
            Out::Process(p) => self.processes.push(*p),
            Out::Diagram(d) => self.diagrams.push(*d),
            Out::Unknown(el) => self.unknown_children.push(el),
            _ => {}
        }
    }
    fn finish(self: Box<Self>) -> Res<Out> {
        let attrs = &self.attrs;
        let mut namespaces = Attrs::new();
        let mut unknown_attributes = Attrs::new();
        for (key, value) in attrs {
            if let Some(prefix) = key.strip_prefix("xmlns:") {
                namespaces.insert(prefix.to_owned(), value.clone());
            } else if key == "xmlns" {
                namespaces.insert(String::new(), value.clone());
            } else if !DEFINITIONS_ATTRS.contains(&key.as_str()) {
                unknown_attributes.insert(key.clone(), value.clone());
            }
        }
        Ok(Out::Definitions(Box::new(BpmnDefinitions {
            id: required_attr(attrs, "id", &self.name)?,
            target_namespace: required_attr(attrs, "targetNamespace", &self.name)?,
            exporter: attr_string(attrs, "exporter"),
            exporter_version: attr_string(attrs, "exporterVersion"),
            namespaces,
            unknown_attributes,
            documentation: self.documentation,
            documentation_attributes: self.documentation_attributes,
            categories: self.categories,
            errors: self.errors,
            escalations: self.escalations,
            messages: self.messages,
            signals: self.signals,
            collaborations: self.collaborations,
            processes: self.processes,
            diagrams: self.diagrams,
            unknown_children: self.unknown_children,
        })))
    }
}

// ---------------------------------------------------------------------------
// Scanner glue and public API
// ---------------------------------------------------------------------------

/// Routes scanner events to the frame stack.
#[derive(Default)]
struct BpmnSink {
    stack: Vec<Box<dyn Frame>>,
    result: Option<BpmnDefinitions>,
    /// Set when the root element is not `<definitions>`; reported once scanning is done.
    root_name: Option<String>,
    /// The first semantic error. The scanner cannot be told to stop, so after it is set every
    /// event is ignored; the caller prefers it over any later XML error, as TS would have
    /// thrown before reaching it.
    error: Option<ParseError>,
}

impl BpmnSink {
    fn push_root(&mut self, name: &str, attrs: Attrs) -> Visit {
        self.stack.push(Box::new(DefinitionsFrame {
            name: name.to_owned(),
            attrs,
            categories: Vec::new(),
            documentation: None,
            documentation_attributes: None,
            documentation_seen: false,
            errors: Vec::new(),
            escalations: Vec::new(),
            messages: Vec::new(),
            signals: Vec::new(),
            collaborations: Vec::new(),
            processes: Vec::new(),
            diagrams: Vec::new(),
            unknown_children: Vec::new(),
        }));
        Visit::ElementsOnly
    }
}

impl XmlSink for BpmnSink {
    fn start(&mut self, name: &str, local: &str, attrs: Attrs, _self_closing: bool) -> Visit {
        if self.error.is_some() {
            return Visit::Skip;
        }
        let Some(top) = self.stack.last_mut() else {
            if local != "definitions" {
                self.root_name = Some(name.to_owned());
                return Visit::Skip;
            }
            return self.push_root(name, attrs);
        };
        match top.child(local, name, attrs) {
            Err(e) => {
                self.error = Some(e);
                Visit::Skip
            }
            Ok(Child::Skip) => Visit::Skip,
            Ok(Child::Nested) => Visit::All,
            Ok(Child::Push(frame)) => {
                let visit = if frame.wants_text() {
                    Visit::All
                } else {
                    Visit::ElementsOnly
                };
                self.stack.push(frame);
                visit
            }
        }
    }

    fn text(&mut self, text: &str) {
        if self.error.is_none() {
            if let Some(top) = self.stack.last_mut() {
                top.text(text);
            }
        }
    }

    fn end(&mut self, _name: &str) {
        if self.error.is_some() {
            return;
        }
        let Some(top) = self.stack.last_mut() else {
            return;
        };
        if top.close() {
            return;
        }
        let Some(frame) = self.stack.pop() else {
            return;
        };
        match frame.finish() {
            Err(e) => self.error = Some(e),
            Ok(out) => match self.stack.last_mut() {
                Some(parent) => parent.accept(out),
                None => {
                    if let Out::Definitions(d) = out {
                        self.result = Some(*d);
                    }
                }
            },
        }
    }
}

/// Parses a BPMN XML string into the typed model.
pub fn parse_bpmn(xml: &str) -> Result<BpmnDefinitions, ParseError> {
    let mut sink = BpmnSink::default();
    let scanned = scan_xml(xml, &mut sink);
    if let Some(e) = sink.error {
        return Err(e);
    }
    if !scanned.map_err(|e| ParseError(e.0))? {
        return Err(ParseError(
            "Failed to parse XML: no root element found".to_owned(),
        ));
    }
    if let Some(name) = sink.root_name {
        return Err(ParseError(format!(
            "Expected <definitions> root element, got <{name}>"
        )));
    }
    sink.result
        .ok_or_else(|| ParseError("Failed to parse XML: no root element found".to_owned()))
}
