//! Port of `bpmn/element-shape.ts`: the one place that knows which fields each element type
//! carries (`createFlowElement`), and changing the type of an existing element
//! (`retypeElement`). Also home of [`BpmnElementType`], TS's `BpmnElementType` union.

use std::fmt;

use bpmnkit_xml::XmlElement;
use serde::{Deserialize, Serialize};

use crate::model::*;
use crate::zeebe::{bpmn_element_name, is_zeebe_placement_allowed};

/// TS's `BpmnElementType`: the `"type"` of every [`BpmnFlowElement`] variant, in the
/// declaration order of `ELEMENT_TYPE_GROUPS` (`element-catalog.ts`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum BpmnElementType {
    StartEvent,
    EndEvent,
    IntermediateThrowEvent,
    IntermediateCatchEvent,
    BoundaryEvent,
    Task,
    ServiceTask,
    ScriptTask,
    UserTask,
    SendTask,
    ReceiveTask,
    BusinessRuleTask,
    ManualTask,
    CallActivity,
    ExclusiveGateway,
    ParallelGateway,
    InclusiveGateway,
    EventBasedGateway,
    ComplexGateway,
    SubProcess,
    AdHocSubProcess,
    EventSubProcess,
    Transaction,
    DataObject,
    DataObjectReference,
    DataStoreReference,
}

impl BpmnElementType {
    /// Every type, in declaration order (TS's `allElementTypes()`).
    pub const ALL: [BpmnElementType; 26] = {
        use BpmnElementType::*;
        [
            StartEvent,
            EndEvent,
            IntermediateThrowEvent,
            IntermediateCatchEvent,
            BoundaryEvent,
            Task,
            ServiceTask,
            ScriptTask,
            UserTask,
            SendTask,
            ReceiveTask,
            BusinessRuleTask,
            ManualTask,
            CallActivity,
            ExclusiveGateway,
            ParallelGateway,
            InclusiveGateway,
            EventBasedGateway,
            ComplexGateway,
            SubProcess,
            AdHocSubProcess,
            EventSubProcess,
            Transaction,
            DataObject,
            DataObjectReference,
            DataStoreReference,
        ]
    };

    pub fn as_str(self) -> &'static str {
        use BpmnElementType::*;
        match self {
            StartEvent => "startEvent",
            EndEvent => "endEvent",
            IntermediateThrowEvent => "intermediateThrowEvent",
            IntermediateCatchEvent => "intermediateCatchEvent",
            BoundaryEvent => "boundaryEvent",
            Task => "task",
            ServiceTask => "serviceTask",
            ScriptTask => "scriptTask",
            UserTask => "userTask",
            SendTask => "sendTask",
            ReceiveTask => "receiveTask",
            BusinessRuleTask => "businessRuleTask",
            ManualTask => "manualTask",
            CallActivity => "callActivity",
            ExclusiveGateway => "exclusiveGateway",
            ParallelGateway => "parallelGateway",
            InclusiveGateway => "inclusiveGateway",
            EventBasedGateway => "eventBasedGateway",
            ComplexGateway => "complexGateway",
            SubProcess => "subProcess",
            AdHocSubProcess => "adHocSubProcess",
            EventSubProcess => "eventSubProcess",
            Transaction => "transaction",
            DataObject => "dataObject",
            DataObjectReference => "dataObjectReference",
            DataStoreReference => "dataStoreReference",
        }
    }

    /// The type named `s` exactly (case-sensitive, as TS's object lookups are).
    pub fn parse(s: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|t| t.as_str() == s)
    }

    /// TS's `isContainerType`.
    pub fn is_container(self) -> bool {
        use BpmnElementType::*;
        matches!(
            self,
            SubProcess | AdHocSubProcess | EventSubProcess | Transaction
        )
    }

    /// TS's `isLoopCapableType`.
    pub fn is_loop_capable(self) -> bool {
        use BpmnElementType::*;
        matches!(
            self,
            Task | ServiceTask
                | ScriptTask
                | UserTask
                | SendTask
                | ReceiveTask
                | BusinessRuleTask
                | ManualTask
                | CallActivity
                | SubProcess
                | AdHocSubProcess
                | Transaction
        )
    }

    /// TS's `isEventType`.
    pub fn is_event(self) -> bool {
        use BpmnElementType::*;
        matches!(
            self,
            StartEvent | EndEvent | IntermediateThrowEvent | IntermediateCatchEvent | BoundaryEvent
        )
    }

    /// The five gateway types.
    pub fn is_gateway(self) -> bool {
        use BpmnElementType::*;
        matches!(
            self,
            ExclusiveGateway
                | ParallelGateway
                | InclusiveGateway
                | EventBasedGateway
                | ComplexGateway
        )
    }
}

impl fmt::Display for BpmnElementType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl BpmnFlowElement {
    /// The variant as a [`BpmnElementType`].
    pub fn element_type(&self) -> BpmnElementType {
        BpmnElementType::parse(self.type_name()).unwrap_or(BpmnElementType::Task)
    }
}

/// TS's `CreateFlowElementOptions`.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct CreateFlowElementOptions {
    pub name: Option<String>,
    pub documentation: Option<String>,
    pub extension_elements: Option<Vec<XmlElement>>,
}

/// TS's `createFlowElement`: an empty element of type `ty`.
pub fn create_flow_element(
    id: &str,
    ty: BpmnElementType,
    options: CreateFlowElementOptions,
) -> BpmnFlowElement {
    use BpmnElementType as T;
    use BpmnFlowElement as E;
    let base = BpmnFlowNodeBase {
        id: id.to_owned(),
        name: options.name,
        documentation: options.documentation,
        extension_elements: options.extension_elements.unwrap_or_default(),
        ..BpmnFlowNodeBase::default()
    };
    let event = |base| BpmnEvent {
        base,
        event_definitions: vec![],
    };
    let activity = |base| BpmnActivity {
        base,
        loop_characteristics: None,
    };
    let message = |base| BpmnMessageTask {
        base,
        message_ref: None,
        loop_characteristics: None,
    };
    let gateway = |base| BpmnGateway {
        base,
        default: None,
    };
    match ty {
        T::StartEvent => E::StartEvent(BpmnStartEvent {
            base,
            event_definitions: vec![],
            is_interrupting: None,
        }),
        T::EndEvent => E::EndEvent(event(base)),
        T::IntermediateThrowEvent => E::IntermediateThrowEvent(event(base)),
        T::IntermediateCatchEvent => E::IntermediateCatchEvent(event(base)),
        T::BoundaryEvent => E::BoundaryEvent(BpmnBoundaryEvent {
            base,
            attached_to_ref: String::new(),
            cancel_activity: None,
            event_definitions: vec![],
        }),
        T::Task => E::Task(activity(base)),
        T::ServiceTask => E::ServiceTask(activity(base)),
        T::ScriptTask => E::ScriptTask(activity(base)),
        T::UserTask => E::UserTask(activity(base)),
        T::SendTask => E::SendTask(message(base)),
        T::ReceiveTask => E::ReceiveTask(message(base)),
        T::BusinessRuleTask => E::BusinessRuleTask(activity(base)),
        T::ManualTask => E::ManualTask(activity(base)),
        T::CallActivity => E::CallActivity(activity(base)),
        T::ExclusiveGateway => E::ExclusiveGateway(gateway(base)),
        T::ParallelGateway => E::ParallelGateway(base),
        T::InclusiveGateway => E::InclusiveGateway(gateway(base)),
        T::EventBasedGateway => E::EventBasedGateway(base),
        T::ComplexGateway => E::ComplexGateway(gateway(base)),
        T::SubProcess => E::SubProcess(BpmnSubProcess {
            base,
            triggered_by_event: None,
            loop_characteristics: None,
            contents: BpmnProcessContents::default(),
        }),
        T::AdHocSubProcess => E::AdHocSubProcess(BpmnAdHocSubProcess {
            base,
            loop_characteristics: None,
            completion_condition: None,
            cancel_remaining_instances: None,
            contents: BpmnProcessContents::default(),
        }),
        T::EventSubProcess => E::EventSubProcess(BpmnEventSubProcess {
            base,
            contents: BpmnProcessContents::default(),
        }),
        T::Transaction => E::Transaction(BpmnTransaction {
            base,
            loop_characteristics: None,
            contents: BpmnProcessContents::default(),
        }),
        T::DataObject => E::DataObject(BpmnDataObject {
            base,
            is_collection: None,
        }),
        T::DataObjectReference => E::DataObjectReference(BpmnDataObjectReference {
            base,
            data_object_ref: None,
            is_collection: None,
        }),
        T::DataStoreReference => E::DataStoreReference(BpmnDataStoreReference {
            base,
            data_store_ref: None,
        }),
    }
}

/// TS's `retypeElement`: a copy of `el` as `ty`, keeping what the new type can hold.
pub fn retype_element(el: &BpmnFlowElement, ty: BpmnElementType) -> BpmnFlowElement {
    let from = el.element_type();
    if from == ty {
        return el.clone();
    }
    let owner = bpmn_element_name(ty.as_str());
    let old = el.base();
    let extension_elements = old
        .extension_elements
        .iter()
        .filter(|ext| is_zeebe_placement_allowed(&owner, &ext.name))
        .cloned()
        .collect();
    let mut next = create_flow_element(
        &old.id,
        ty,
        CreateFlowElementOptions {
            name: old.name.clone(),
            documentation: old.documentation.clone(),
            extension_elements: Some(extension_elements),
        },
    );
    {
        let base = next.base_mut();
        base.incoming = old.incoming.clone();
        base.outgoing = old.outgoing.clone();
        base.unknown_attributes = old.unknown_attributes.clone();
        if old.is_for_compensation.is_some() {
            base.is_for_compensation = old.is_for_compensation;
        }
    }
    if from.is_container() && ty.is_container() {
        if let (Some(src), Some(dst)) = (el.contents(), next.contents_mut()) {
            *dst = src.clone();
        }
    }
    if from.is_loop_capable() && ty.is_loop_capable() {
        if let (Some(loop_), Some(slot)) =
            (el.loop_characteristics(), next.loop_characteristics_mut())
        {
            *slot = Some(loop_.clone());
        }
    }
    if from.is_event() && ty.is_event() {
        if let (Some(defs), Some(slot)) = (el.event_definitions(), next.event_definitions_mut()) {
            *slot = defs.to_vec();
        }
    }
    if let (BpmnFlowElement::BoundaryEvent(src), BpmnFlowElement::BoundaryEvent(dst)) =
        (el, &mut next)
    {
        dst.attached_to_ref = src.attached_to_ref.clone();
    }
    next
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn element_type_names_round_trip() {
        for t in BpmnElementType::ALL {
            assert_eq!(BpmnElementType::parse(t.as_str()), Some(t));
        }
        assert_eq!(BpmnElementType::parse("StartEvent"), None);
    }
}
