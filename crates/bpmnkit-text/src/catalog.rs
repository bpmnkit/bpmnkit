//! Port of `bpmn/element-catalog.ts` and `FIXED_KINDS` of `bpmn/process-delta.ts`.

use bpmnkit_bpmn::BpmnElementType;
use serde::{Deserialize, Serialize};

/// TS's `ElementTypeGroup`: the coarse families a modeller picks from.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ElementTypeGroup {
    Event,
    Task,
    Gateway,
    Container,
    Data,
}

/// TS's `ELEMENT_GROUP_ORDER`.
pub const ELEMENT_GROUP_ORDER: [ElementTypeGroup; 5] = [
    ElementTypeGroup::Event,
    ElementTypeGroup::Task,
    ElementTypeGroup::Gateway,
    ElementTypeGroup::Container,
    ElementTypeGroup::Data,
];

/// TS's `ELEMENT_TYPE_GROUPS[type]`.
pub fn element_type_group(ty: BpmnElementType) -> ElementTypeGroup {
    use BpmnElementType as T;
    match ty {
        T::StartEvent
        | T::EndEvent
        | T::IntermediateThrowEvent
        | T::IntermediateCatchEvent
        | T::BoundaryEvent => ElementTypeGroup::Event,
        T::Task
        | T::ServiceTask
        | T::ScriptTask
        | T::UserTask
        | T::SendTask
        | T::ReceiveTask
        | T::BusinessRuleTask
        | T::ManualTask
        | T::CallActivity => ElementTypeGroup::Task,
        T::ExclusiveGateway
        | T::ParallelGateway
        | T::InclusiveGateway
        | T::EventBasedGateway
        | T::ComplexGateway => ElementTypeGroup::Gateway,
        T::SubProcess | T::AdHocSubProcess | T::EventSubProcess | T::Transaction => {
            ElementTypeGroup::Container
        }
        T::DataObject | T::DataObjectReference | T::DataStoreReference => ElementTypeGroup::Data,
    }
}

/// `Object.hasOwn(ELEMENT_TYPE_GROUPS, name)`: whether `name` is a modelled element type.
pub fn is_element_type(name: &str) -> bool {
    BpmnElementType::parse(name).is_some()
}

/// TS's `elementTypesInGroup`, in declaration order.
pub fn element_types_in_group(group: ElementTypeGroup) -> Vec<BpmnElementType> {
    BpmnElementType::ALL
        .into_iter()
        .filter(|t| element_type_group(*t) == group)
        .collect()
}

/// TS's `allElementTypes`, in declaration order.
pub fn all_element_types() -> Vec<BpmnElementType> {
    BpmnElementType::ALL.to_vec()
}

/// TS's `FIXED_KINDS` (`process-delta.ts`): kind words the change script adds to `KINDS`.
pub const FIXED_KINDS: [(&str, BpmnElementType); 3] = [
    ("sub", BpmnElementType::SubProcess),
    ("transaction", BpmnElementType::Transaction),
    ("complex", BpmnElementType::ComplexGateway),
];
