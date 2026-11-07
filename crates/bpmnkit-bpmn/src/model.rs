//! The BPMN model; JSON shape matches TS's `BpmnDefinitions` (`bpmn-model.ts`).
//!
//! JSON presence follows the parser, not only the TS interface: a field TS leaves
//! `undefined` is `None` and absent, a list TS only spreads in when non-empty is a plain
//! `Vec` skipped when empty, and a field TS always sets is always written, even when empty.

use bpmnkit_xml::{Attrs, XmlElement};
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/// Axis-aligned bounding box of BPMNDi.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BpmnBounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

/// A point along a sequence flow edge route.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnWaypoint {
    pub x: f64,
    pub y: f64,
    /// Attributes other than `x` / `y` (e.g. `xsi:type`), kept for round-trip.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

// ---------------------------------------------------------------------------
// Event definitions
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnTimerEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub time_duration: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub time_duration_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub time_date: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub time_date_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub time_cycle: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub time_cycle_attributes: Option<Attrs>,
    /// Attributes the SDK does not model (e.g. `camunda:type`), kept for round-trip.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnErrorEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnEscalationEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub escalation_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnMessageEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnSignalEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub signal_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnConditionalEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub condition: Option<String>,
    /// Attributes of the `<condition>` element, e.g. `xsi:type` and `language`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub condition_attributes: Option<Attrs>,
    /// `<extensionElements>` of the definition, e.g. `zeebe:conditionalFilter`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnLinkEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

/// Cancel and terminate definitions carry nothing but an id.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnIdOnlyEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnCompensateEventDefinition {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub activity_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

/// Discriminated by `"type"` (`"timer"`, `"error"`, ...).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum BpmnEventDefinition {
    Timer(BpmnTimerEventDefinition),
    Error(BpmnErrorEventDefinition),
    Escalation(BpmnEscalationEventDefinition),
    Message(BpmnMessageEventDefinition),
    Signal(BpmnSignalEventDefinition),
    Conditional(BpmnConditionalEventDefinition),
    Link(BpmnLinkEventDefinition),
    Cancel(BpmnIdOnlyEventDefinition),
    Terminate(BpmnIdOnlyEventDefinition),
    Compensate(BpmnCompensateEventDefinition),
}

impl BpmnEventDefinition {
    /// The `"type"` discriminant (`"timer"`, `"error"`, ...).
    pub fn type_name(&self) -> &'static str {
        use BpmnEventDefinition::*;
        match self {
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

    pub fn id(&self) -> Option<&str> {
        use BpmnEventDefinition::*;
        match self {
            Timer(d) => d.id.as_deref(),
            Error(d) => d.id.as_deref(),
            Escalation(d) => d.id.as_deref(),
            Message(d) => d.id.as_deref(),
            Signal(d) => d.id.as_deref(),
            Conditional(d) => d.id.as_deref(),
            Link(d) => d.id.as_deref(),
            Cancel(d) | Terminate(d) => d.id.as_deref(),
            Compensate(d) => d.id.as_deref(),
        }
    }

    pub fn id_mut(&mut self) -> &mut Option<String> {
        use BpmnEventDefinition::*;
        match self {
            Timer(d) => &mut d.id,
            Error(d) => &mut d.id,
            Escalation(d) => &mut d.id,
            Message(d) => &mut d.id,
            Signal(d) => &mut d.id,
            Conditional(d) => &mut d.id,
            Link(d) => &mut d.id,
            Cancel(d) | Terminate(d) => &mut d.id,
            Compensate(d) => &mut d.id,
        }
    }
}

// ---------------------------------------------------------------------------
// Expressions and multi-instance loops
// ---------------------------------------------------------------------------

/// A FEEL condition expression (sequence flow condition, loop cardinality, ...).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BpmnConditionExpression {
    pub text: String,
    pub attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnMultiInstanceLoopCharacteristics {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    /// Only ever `Some(true)`: the parser drops `false`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_sequential: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub loop_cardinality: Option<BpmnConditionExpression>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub completion_condition: Option<BpmnConditionExpression>,
    #[serde(default)]
    pub extension_elements: Vec<XmlElement>,
    /// Children the SDK does not model, re-emitted after the modelled ones.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/// A `bpmn:property`: the placeholder a data input association targets.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnProperty {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub item_subject_ref: Option<String>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

/// A `dataInputAssociation` or `dataOutputAssociation`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDataAssociation {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    /// Ids named by `<bpmn:sourceRef>` child elements.
    #[serde(default)]
    pub source_refs: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub target_ref: Option<String>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
}

// ---------------------------------------------------------------------------
// Flow elements
// ---------------------------------------------------------------------------

/// Fields every flow node has; flattened into each [`BpmnFlowElement`] variant.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnFlowNodeBase {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default)]
    pub incoming: Vec<String>,
    #[serde(default)]
    pub outgoing: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default)]
    pub extension_elements: Vec<XmlElement>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
    /// Only ever `Some(true)`, and only on activities.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_for_compensation: Option<bool>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub properties: Vec<BpmnProperty>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub data_input_associations: Vec<BpmnDataAssociation>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub data_output_associations: Vec<BpmnDataAssociation>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
}

/// Flow elements, annotations, associations and groups of a process or container activity.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnProcessContents {
    #[serde(default)]
    pub flow_elements: Vec<BpmnFlowElement>,
    #[serde(default)]
    pub sequence_flows: Vec<BpmnSequenceFlow>,
    #[serde(default)]
    pub text_annotations: Vec<BpmnTextAnnotation>,
    #[serde(default)]
    pub associations: Vec<BpmnAssociation>,
    #[serde(default)]
    pub groups: Vec<BpmnGroup>,
}

/// startEvent, endEvent, intermediate events: all carry event definitions.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnEvent {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default)]
    pub event_definitions: Vec<BpmnEventDefinition>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnStartEvent {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default)]
    pub event_definitions: Vec<BpmnEventDefinition>,
    /// Only ever `Some(false)`: the parser drops `true`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_interrupting: Option<bool>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnBoundaryEvent {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    pub attached_to_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cancel_activity: Option<bool>,
    #[serde(default)]
    pub event_definitions: Vec<BpmnEventDefinition>,
}

/// task, serviceTask, scriptTask, userTask, businessRuleTask, manualTask, callActivity.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnActivity {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub loop_characteristics: Option<BpmnMultiInstanceLoopCharacteristics>,
}

/// sendTask and receiveTask.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnMessageTask {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub loop_characteristics: Option<BpmnMultiInstanceLoopCharacteristics>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnAdHocSubProcess {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub loop_characteristics: Option<BpmnMultiInstanceLoopCharacteristics>,
    /// Evaluated after each tool activity completes; ends the ad-hoc scope when true.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub completion_condition: Option<BpmnConditionExpression>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cancel_remaining_instances: Option<bool>,
    #[serde(flatten)]
    pub contents: BpmnProcessContents,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnSubProcess {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub triggered_by_event: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub loop_characteristics: Option<BpmnMultiInstanceLoopCharacteristics>,
    #[serde(flatten)]
    pub contents: BpmnProcessContents,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnEventSubProcess {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(flatten)]
    pub contents: BpmnProcessContents,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnTransaction {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub loop_characteristics: Option<BpmnMultiInstanceLoopCharacteristics>,
    #[serde(flatten)]
    pub contents: BpmnProcessContents,
}

/// exclusiveGateway, inclusiveGateway, complexGateway.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnGateway {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDataObject {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_collection: Option<bool>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDataObjectReference {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub data_object_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_collection: Option<bool>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDataStoreReference {
    #[serde(flatten)]
    pub base: BpmnFlowNodeBase,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub data_store_ref: Option<String>,
}

/// Every flow node a process can hold, discriminated by `"type"`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum BpmnFlowElement {
    StartEvent(BpmnStartEvent),
    EndEvent(BpmnEvent),
    IntermediateCatchEvent(BpmnEvent),
    IntermediateThrowEvent(BpmnEvent),
    BoundaryEvent(BpmnBoundaryEvent),
    Task(BpmnActivity),
    ServiceTask(BpmnActivity),
    ScriptTask(BpmnActivity),
    UserTask(BpmnActivity),
    SendTask(BpmnMessageTask),
    ReceiveTask(BpmnMessageTask),
    BusinessRuleTask(BpmnActivity),
    ManualTask(BpmnActivity),
    CallActivity(BpmnActivity),
    SubProcess(BpmnSubProcess),
    AdHocSubProcess(BpmnAdHocSubProcess),
    EventSubProcess(BpmnEventSubProcess),
    Transaction(BpmnTransaction),
    ExclusiveGateway(BpmnGateway),
    ParallelGateway(BpmnFlowNodeBase),
    InclusiveGateway(BpmnGateway),
    EventBasedGateway(BpmnFlowNodeBase),
    ComplexGateway(BpmnGateway),
    DataObject(BpmnDataObject),
    DataObjectReference(BpmnDataObjectReference),
    DataStoreReference(BpmnDataStoreReference),
}

impl BpmnFlowElement {
    /// The shared fields, whatever the variant.
    pub fn base(&self) -> &BpmnFlowNodeBase {
        use BpmnFlowElement::*;
        match self {
            StartEvent(e) => &e.base,
            EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => &e.base,
            BoundaryEvent(e) => &e.base,
            Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
            | ManualTask(a) | CallActivity(a) => &a.base,
            SendTask(t) | ReceiveTask(t) => &t.base,
            SubProcess(s) => &s.base,
            AdHocSubProcess(s) => &s.base,
            EventSubProcess(s) => &s.base,
            Transaction(s) => &s.base,
            ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => &g.base,
            ParallelGateway(b) | EventBasedGateway(b) => b,
            DataObject(d) => &d.base,
            DataObjectReference(d) => &d.base,
            DataStoreReference(d) => &d.base,
        }
    }

    /// The `"type"` discriminant, which is also the element's local name.
    pub fn type_name(&self) -> &'static str {
        use BpmnFlowElement::*;
        match self {
            StartEvent(_) => "startEvent",
            EndEvent(_) => "endEvent",
            IntermediateCatchEvent(_) => "intermediateCatchEvent",
            IntermediateThrowEvent(_) => "intermediateThrowEvent",
            BoundaryEvent(_) => "boundaryEvent",
            Task(_) => "task",
            ServiceTask(_) => "serviceTask",
            ScriptTask(_) => "scriptTask",
            UserTask(_) => "userTask",
            SendTask(_) => "sendTask",
            ReceiveTask(_) => "receiveTask",
            BusinessRuleTask(_) => "businessRuleTask",
            ManualTask(_) => "manualTask",
            CallActivity(_) => "callActivity",
            SubProcess(_) => "subProcess",
            AdHocSubProcess(_) => "adHocSubProcess",
            EventSubProcess(_) => "eventSubProcess",
            Transaction(_) => "transaction",
            ExclusiveGateway(_) => "exclusiveGateway",
            ParallelGateway(_) => "parallelGateway",
            InclusiveGateway(_) => "inclusiveGateway",
            EventBasedGateway(_) => "eventBasedGateway",
            ComplexGateway(_) => "complexGateway",
            DataObject(_) => "dataObject",
            DataObjectReference(_) => "dataObjectReference",
            DataStoreReference(_) => "dataStoreReference",
        }
    }

    /// The nested flow elements of a container activity.
    pub fn contents(&self) -> Option<&BpmnProcessContents> {
        use BpmnFlowElement::*;
        match self {
            SubProcess(s) => Some(&s.contents),
            AdHocSubProcess(s) => Some(&s.contents),
            EventSubProcess(s) => Some(&s.contents),
            Transaction(s) => Some(&s.contents),
            _ => None,
        }
    }

    /// Mutable [`Self::base`].
    pub fn base_mut(&mut self) -> &mut BpmnFlowNodeBase {
        use BpmnFlowElement::*;
        match self {
            StartEvent(e) => &mut e.base,
            EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => &mut e.base,
            BoundaryEvent(e) => &mut e.base,
            Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
            | ManualTask(a) | CallActivity(a) => &mut a.base,
            SendTask(t) | ReceiveTask(t) => &mut t.base,
            SubProcess(s) => &mut s.base,
            AdHocSubProcess(s) => &mut s.base,
            EventSubProcess(s) => &mut s.base,
            Transaction(s) => &mut s.base,
            ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => &mut g.base,
            ParallelGateway(b) | EventBasedGateway(b) => b,
            DataObject(d) => &mut d.base,
            DataObjectReference(d) => &mut d.base,
            DataStoreReference(d) => &mut d.base,
        }
    }

    /// Mutable [`Self::contents`].
    pub fn contents_mut(&mut self) -> Option<&mut BpmnProcessContents> {
        use BpmnFlowElement::*;
        match self {
            SubProcess(s) => Some(&mut s.contents),
            AdHocSubProcess(s) => Some(&mut s.contents),
            EventSubProcess(s) => Some(&mut s.contents),
            Transaction(s) => Some(&mut s.contents),
            _ => None,
        }
    }

    /// The event definitions of an event; `None` for every other element (TS's
    /// `"eventDefinitions" in el`).
    pub fn event_definitions(&self) -> Option<&[BpmnEventDefinition]> {
        use BpmnFlowElement::*;
        match self {
            StartEvent(e) => Some(&e.event_definitions),
            EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => {
                Some(&e.event_definitions)
            }
            BoundaryEvent(e) => Some(&e.event_definitions),
            _ => None,
        }
    }

    /// Mutable [`Self::event_definitions`].
    pub fn event_definitions_mut(&mut self) -> Option<&mut Vec<BpmnEventDefinition>> {
        use BpmnFlowElement::*;
        match self {
            StartEvent(e) => Some(&mut e.event_definitions),
            EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => {
                Some(&mut e.event_definitions)
            }
            BoundaryEvent(e) => Some(&mut e.event_definitions),
            _ => None,
        }
    }

    /// The `default` flow slot of an exclusive, inclusive or complex gateway (TS's
    /// `"default" in el`); `None` for every other element.
    pub fn default_flow_mut(&mut self) -> Option<&mut Option<String>> {
        use BpmnFlowElement::*;
        match self {
            ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => Some(&mut g.default),
            _ => None,
        }
    }

    /// The gateway's `default` flow id, if it is a gateway that has one set.
    pub fn default_flow(&self) -> Option<&str> {
        use BpmnFlowElement::*;
        match self {
            ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => g.default.as_deref(),
            _ => None,
        }
    }

    /// The `loopCharacteristics` slot of an element that can carry one.
    pub fn loop_characteristics_mut(
        &mut self,
    ) -> Option<&mut Option<BpmnMultiInstanceLoopCharacteristics>> {
        use BpmnFlowElement::*;
        match self {
            Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
            | ManualTask(a) | CallActivity(a) => Some(&mut a.loop_characteristics),
            SendTask(t) | ReceiveTask(t) => Some(&mut t.loop_characteristics),
            SubProcess(s) => Some(&mut s.loop_characteristics),
            AdHocSubProcess(s) => Some(&mut s.loop_characteristics),
            Transaction(s) => Some(&mut s.loop_characteristics),
            _ => None,
        }
    }

    /// The multi-instance marker, if the element carries one.
    pub fn loop_characteristics(&self) -> Option<&BpmnMultiInstanceLoopCharacteristics> {
        use BpmnFlowElement::*;
        match self {
            Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
            | ManualTask(a) | CallActivity(a) => a.loop_characteristics.as_ref(),
            SendTask(t) | ReceiveTask(t) => t.loop_characteristics.as_ref(),
            SubProcess(s) => s.loop_characteristics.as_ref(),
            AdHocSubProcess(s) => s.loop_characteristics.as_ref(),
            Transaction(s) => s.loop_characteristics.as_ref(),
            _ => None,
        }
    }

    /// `messageRef` of a send or receive task.
    pub fn message_ref(&self) -> Option<&str> {
        match self {
            BpmnFlowElement::SendTask(t) | BpmnFlowElement::ReceiveTask(t) => {
                t.message_ref.as_deref()
            }
            _ => None,
        }
    }
}

// ---------------------------------------------------------------------------
// Sequence flows, artifacts, categories
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnSequenceFlow {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub source_ref: String,
    pub target_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub condition_expression: Option<BpmnConditionExpression>,
    #[serde(default)]
    pub extension_elements: Vec<XmlElement>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnTextAnnotation {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnAssociation {
    pub id: String,
    pub source_ref: String,
    pub target_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub association_direction: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnGroup {
    pub id: String,
    /// Id of the `categoryValue` supplying the group's label, if any.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub category_value_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnCategoryValue {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnCategory {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default)]
    pub category_values: Vec<BpmnCategoryValue>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

// ---------------------------------------------------------------------------
// Lanes
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnLane {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default)]
    pub flow_node_refs: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub child_lane_set: Option<BpmnLaneSet>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnLaneSet {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default)]
    pub lanes: Vec<BpmnLane>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

// ---------------------------------------------------------------------------
// Process and collaboration
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnProcess {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Only ever `Some(true)`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_executable: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default)]
    pub extension_elements: Vec<XmlElement>,
    #[serde(flatten)]
    pub contents: BpmnProcessContents,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lane_set: Option<BpmnLaneSet>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnParticipant {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub process_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnMessageFlow {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub source_ref: String,
    pub target_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnCollaboration {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default)]
    pub participants: Vec<BpmnParticipant>,
    #[serde(default)]
    pub message_flows: Vec<BpmnMessageFlow>,
    #[serde(default)]
    pub text_annotations: Vec<BpmnTextAnnotation>,
    #[serde(default)]
    pub associations: Vec<BpmnAssociation>,
    #[serde(default)]
    pub groups: Vec<BpmnGroup>,
    #[serde(default)]
    pub extension_elements: Vec<XmlElement>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
}

// ---------------------------------------------------------------------------
// Root elements
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnError {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_code: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnEscalation {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub escalation_code: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnMessage {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    /// Carries `zeebe:subscription`, whose `correlationKey` Camunda 8 correlates on.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnSignal {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extension_elements: Option<Vec<XmlElement>>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

// ---------------------------------------------------------------------------
// Diagram interchange
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDiLabel {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bounds: Option<BpmnBounds>,
    /// The `BPMNLabel` element's own attributes, kept for round-trip.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDiShape {
    pub id: String,
    pub bpmn_element: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_marker_visible: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_expanded: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_horizontal: Option<bool>,
    pub bounds: BpmnBounds,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<BpmnDiLabel>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDiEdge {
    pub id: String,
    pub bpmn_element: String,
    #[serde(default)]
    pub waypoints: Vec<BpmnWaypoint>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<BpmnDiLabel>,
    #[serde(default)]
    pub unknown_attributes: Attrs,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDiPlane {
    /// Empty when the source omitted it: BPMN DI makes it optional.
    pub id: String,
    /// Empty when the source omitted it: BPMN DI makes it optional.
    pub bpmn_element: String,
    #[serde(default)]
    pub shapes: Vec<BpmnDiShape>,
    #[serde(default)]
    pub edges: Vec<BpmnDiEdge>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDiagram {
    /// Empty when the source omitted it: BPMN DI makes it optional.
    pub id: String,
    pub plane: BpmnDiPlane,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unknown_attributes: Option<Attrs>,
    /// Children other than the plane (`BPMNLabelStyle`), kept verbatim.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

/// The root of a parsed document: `<bpmn:definitions>`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDefinitions {
    pub id: String,
    pub target_namespace: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub exporter: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub exporter_version: Option<String>,
    /// Namespace prefix to URI; the default namespace has the empty prefix.
    #[serde(default)]
    pub namespaces: Attrs,
    /// Attributes not modelled above, in source order.
    #[serde(default)]
    pub unknown_attributes: Attrs,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub documentation_attributes: Option<Attrs>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub categories: Vec<BpmnCategory>,
    #[serde(default)]
    pub errors: Vec<BpmnError>,
    #[serde(default)]
    pub escalations: Vec<BpmnEscalation>,
    #[serde(default)]
    pub messages: Vec<BpmnMessage>,
    #[serde(default)]
    pub signals: Vec<BpmnSignal>,
    #[serde(default)]
    pub collaborations: Vec<BpmnCollaboration>,
    #[serde(default)]
    pub processes: Vec<BpmnProcess>,
    #[serde(default)]
    pub diagrams: Vec<BpmnDiagram>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub unknown_children: Vec<XmlElement>,
}
