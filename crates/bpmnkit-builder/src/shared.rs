//! State every builder of one process shares, and the scope state the three flow builders
//! (`ProcessBuilder`, `BranchBuilder`, `SubProcessContentBuilder`) have in common.
//! Complete: porters call these, they do not change them.
//!
//! ## Error model
//! TS throws at the call that went wrong. Here the first error is recorded in
//! [`Shared::error`] and every later call, nested builders and callbacks included, is a
//! no-op; `build()` returns it. Each public builder method therefore starts with
//! `if self.failed() { return self; }`. Pure helpers return `Result<_, String>` (the TS
//! message); helpers that run a user callback return `Result<_, Failed>`, where [`Failed`]
//! says "already recorded, unwind". Never hold a `borrow_mut()` of the shared cell across a
//! callback: the nested builder borrows it too.
//!
//! ## TS identity side tables
//! TS keys `embeddedForms` by the user-task object and `branchIds`/`explicitIds` by the
//! flow object. Here they live in [`Shared`], keyed by element id and flow id (see
//! `bpmnkit_bpmn::stable_ids::FlowTags`).

use std::cell::RefCell;
use std::fmt;
use std::rc::Rc;

use bpmnkit_bpmn::stable_ids::FlowTags;
use bpmnkit_bpmn::{
    BpmnAssociation, BpmnDataAssociation, BpmnError, BpmnEscalation, BpmnFlowElement, BpmnMessage,
    BpmnProperty, BpmnSequenceFlow, BpmnSignal, BpmnTextAnnotation,
};
use bpmnkit_compat::zeebe::DeployabilityError;
use bpmnkit_layout::{AnnotationSide, GridHint, LayoutHints};
use indexmap::{IndexMap, IndexSet};

use crate::branch::BranchBuilder;
use crate::options::{AnnotateOptions, DataDirection, EmbeddedForm};

/// What `build()` fails with: the message TS would have thrown, first one only.
#[derive(Debug, Clone, PartialEq)]
pub struct BuildError {
    pub message: String,
    /// Set when the deploy gate refused the model (TS throws the `DeployabilityError`
    /// itself); `message` is its message.
    pub deployability: Option<Box<DeployabilityError>>,
}

impl BuildError {
    /// An error with only a message, as every builder rule raises.
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            deployability: None,
        }
    }
}

impl From<DeployabilityError> for BuildError {
    fn from(error: DeployabilityError) -> Self {
        Self {
            message: error.to_string(),
            deployability: Some(Box::new(error)),
        }
    }
}

impl fmt::Display for BuildError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for BuildError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.deployability
            .as_deref()
            .map(|e| e as &(dyn std::error::Error + 'static))
    }
}

/// The first error is already in [`Shared::error`]; stop and return to the public method.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct Failed;

/// TS's `RootDefinitions` plus the builder's side tables and the error slot. One per
/// `ProcessBuilder`, shared by every branch and sub-process builder under it.
#[derive(Debug, Default)]
pub(crate) struct Shared {
    pub errors: Vec<BpmnError>,
    pub messages: Vec<BpmnMessage>,
    pub signals: Vec<BpmnSignal>,
    pub escalations: Vec<BpmnEscalation>,
    /// `layoutHints.grids`: ad-hoc sub-process id → `toolGrid`.
    pub grids: IndexMap<String, GridHint>,
    /// `layoutHints.annotationSides`: annotation id → side.
    pub annotation_sides: IndexMap<String, AnnotationSide>,
    /// TS's `embeddedForms` WeakMap, keyed by the user task's id.
    pub embedded_forms: IndexMap<String, EmbeddedForm>,
    /// TS's `branchIds` / `explicitIds`.
    pub flow_tags: FlowTags,
    pub error: Option<BuildError>,
}

impl Shared {
    /// Records `message` unless an earlier error is already recorded.
    pub fn fail(&mut self, message: impl Into<String>) -> Failed {
        if self.error.is_none() {
            self.error = Some(BuildError::new(message));
        }
        Failed
    }

    /// The hints `applyAutoLayout` gets: TS passes both maps, empty or not.
    pub fn layout_hints(&self) -> LayoutHints {
        LayoutHints {
            grids: Some(self.grids.clone()),
            annotation_sides: Some(self.annotation_sides.clone()),
        }
    }
}

pub(crate) type SharedRef = Rc<RefCell<Shared>>;

pub(crate) fn new_shared() -> SharedRef {
    Rc::new(RefCell::new(Shared::default()))
}

pub(crate) fn is_failed(shared: &SharedRef) -> bool {
    shared.borrow().error.is_some()
}

pub(crate) fn fail(shared: &SharedRef, message: impl Into<String>) -> Failed {
    shared.borrow_mut().fail(message)
}

/// Records the `Err` of a pure helper; `Ok` passes through.
pub(crate) fn check<T>(shared: &SharedRef, result: Result<T, String>) -> Result<T, Failed> {
    result.map_err(|message| fail(shared, message))
}

/// TS's `targetRefPlaceholder`: BPMN20.xsd requires a `dataInputAssociation`'s `targetRef`, and
/// without an ioSpecification there is no data input to point at, so (like Camunda Modeler)
/// the activity gets one `__targetRef_placeholder` property that every input association
/// targets.
fn target_ref_placeholder(activity: &mut BpmnFlowElement) -> String {
    const NAME: &str = "__targetRef_placeholder";
    let base = activity.base_mut();
    let existing = base
        .properties
        .iter()
        .find(|p| p.name.as_deref() == Some(NAME) && p.id.is_some())
        .and_then(|p| p.id.clone());
    if let Some(id) = existing {
        return id;
    }
    let id = format!("Property_{}", base.id);
    base.properties.push(BpmnProperty {
        id: Some(id.clone()),
        name: Some(NAME.to_owned()),
        ..BpmnProperty::default()
    });
    id
}

/// The fields `ProcessBuilder`, `BranchBuilder` and `SubProcessContentBuilder` all have,
/// under TS's names: `flowElements`/`_elements`, `elementIds`/`_ids`,
/// `sequenceFlows`/`_flows`, `_textAnnotations`, `_associations`, `_annCounters`,
/// `lastNodeId`, `currentGatewayId`, `openBranchEnds`.
#[derive(Debug, Clone, Default)]
pub(crate) struct Scope {
    pub elements: Vec<BpmnFlowElement>,
    pub ids: IndexSet<String>,
    pub flows: Vec<BpmnSequenceFlow>,
    pub text_annotations: Vec<BpmnTextAnnotation>,
    pub associations: Vec<BpmnAssociation>,
    pub ann_counters: IndexMap<String, u32>,
    pub last_node_id: Option<String>,
    pub current_gateway_id: Option<String>,
    pub open_branch_ends: Vec<String>,
    /// Data objects a `dataObjectReference()` declared on its own; a later explicit
    /// `dataObject()` adopts them instead of colliding (TS's `implicitDataObjects`).
    pub implicit_data_objects: IndexSet<String>,
}

/// What a finished branch hands back to the builder that opened it (TS reads these off the
/// `BranchBuilder`: `_elements`, `_flows`, `_textAnnotations`, `_associations`,
/// `_defaultFlowId`, `_connected`, `_lastNodeId`, `_openBranchEnds`).
#[derive(Debug, Clone, Default)]
pub(crate) struct BranchOutcome {
    pub elements: Vec<BpmnFlowElement>,
    pub flows: Vec<BpmnSequenceFlow>,
    pub text_annotations: Vec<BpmnTextAnnotation>,
    pub associations: Vec<BpmnAssociation>,
    pub default_flow_id: Option<String>,
    pub connected: bool,
    pub last_node_id: Option<String>,
    pub open_branch_ends: Vec<String>,
}

impl Scope {
    pub fn find(&self, id: &str) -> Option<&BpmnFlowElement> {
        self.elements.iter().find(|e| e.base().id == id)
    }

    pub fn find_mut(&mut self, id: &str) -> Option<&mut BpmnFlowElement> {
        self.elements.iter_mut().find(|e| e.base().id == id)
    }

    /// TS's `annotate()`, identical in all three builders. `element_id` is not checked.
    pub fn annotate(
        &mut self,
        shared: &mut Shared,
        element_id: &str,
        text: &str,
        options: Option<AnnotateOptions>,
    ) {
        let n = self.ann_counters.get(element_id).copied().unwrap_or(0) + 1;
        self.ann_counters.insert(element_id.to_owned(), n);
        let ann_id = format!("TextAnnotation_{element_id}_{n}");
        if let Some(side) = options.and_then(|o| o.side) {
            shared.annotation_sides.insert(ann_id.clone(), side.into());
        }
        self.text_annotations.push(BpmnTextAnnotation {
            id: ann_id.clone(),
            text: Some(text.to_owned()),
            ..BpmnTextAnnotation::default()
        });
        self.associations.push(BpmnAssociation {
            id: format!("Association_{element_id}_{n}"),
            source_ref: element_id.to_owned(),
            target_ref: ann_id,
            association_direction: Some("None".to_owned()),
            ..BpmnAssociation::default()
        });
    }

    /// TS's `addDataElement`: beside the chain, no flows, cursor unmoved.
    pub fn add_data_element(&mut self, element: BpmnFlowElement) -> Result<(), String> {
        let id = element.base().id.clone();
        if let BpmnFlowElement::DataObject(explicit) = &element {
            if self.implicit_data_objects.shift_remove(&id) {
                if let Some(BpmnFlowElement::DataObject(implicit)) = self.find_mut(&id) {
                    if explicit.base.name.is_some() {
                        implicit.base.name = explicit.base.name.clone();
                    }
                    if explicit.is_collection == Some(true) {
                        implicit.is_collection = Some(true);
                    }
                    return Ok(());
                }
            }
        }
        if self.ids.contains(&id) {
            return Err(format!("Duplicate element ID \"{id}\""));
        }
        self.elements.push(element);
        self.ids.insert(id);
        Ok(())
    }

    /// TS's `addDataObjectReference`: adds the reference, then (for `isCollection`) marks the
    /// data object it points at, when that object is in this scope.
    pub fn add_data_object_reference(
        &mut self,
        element: BpmnFlowElement,
        data_object_ref: &str,
        is_collection: bool,
    ) -> Result<(), String> {
        // An unresolved dataObjectRef is a raw XSD IDREF error at build; declare the object.
        if !matches!(
            self.find(data_object_ref),
            Some(BpmnFlowElement::DataObject(_))
        ) {
            let object = crate::elements::make_data_element(
                data_object_ref,
                bpmnkit_bpmn::BpmnElementType::DataObject,
                None,
                None,
            );
            self.add_data_element(object)?;
            self.implicit_data_objects
                .insert(data_object_ref.to_owned());
        }
        self.add_data_element(element)?;
        if is_collection {
            if let Some(BpmnFlowElement::DataObject(d)) = self.find_mut(data_object_ref) {
                d.is_collection = Some(true);
            }
        }
        Ok(())
    }

    /// TS's `addDataAssociation`: the activity owns the association; for `Input` the data
    /// reference is its source, for `Output` its target.
    pub fn add_data_association(
        &mut self,
        activity_id: &str,
        data_ref_id: &str,
        direction: DataDirection,
    ) -> Result<(), String> {
        let Some(activity) = self.find_mut(activity_id) else {
            return Err(format!(
                "dataAssociation(): no element \"{activity_id}\" in this scope"
            ));
        };
        let base = activity.base();
        let id = match direction {
            DataDirection::Input => format!(
                "DataInputAssociation_{activity_id}_{data_ref_id}_{}",
                base.data_input_associations.len() + 1
            ),
            DataDirection::Output => format!(
                "DataOutputAssociation_{activity_id}_{data_ref_id}_{}",
                base.data_output_associations.len() + 1
            ),
        };
        match direction {
            DataDirection::Input => {
                let target = target_ref_placeholder(activity);
                activity
                    .base_mut()
                    .data_input_associations
                    .push(BpmnDataAssociation {
                        id: Some(id),
                        source_refs: vec![data_ref_id.to_owned()],
                        target_ref: Some(target),
                        ..BpmnDataAssociation::default()
                    });
            }
            DataDirection::Output => {
                activity
                    .base_mut()
                    .data_output_associations
                    .push(BpmnDataAssociation {
                        id: Some(id),
                        source_refs: vec![],
                        target_ref: Some(data_ref_id.to_owned()),
                        ..BpmnDataAssociation::default()
                    });
            }
        }
        Ok(())
    }

    /// The tail of TS's `branch()`, identical in all three builders: adopt the branch's
    /// elements and flows, set the gateway default, record open ends, clear the cursor.
    pub fn merge_branch(&mut self, branch: BranchOutcome) -> Result<(), String> {
        for el in branch.elements {
            let id = el.base().id.clone();
            if self.ids.contains(&id) {
                return Err(format!("Duplicate element ID \"{id}\""));
            }
            self.elements.push(el);
            self.ids.insert(id);
        }
        self.flows.extend(branch.flows);
        self.text_annotations.extend(branch.text_annotations);
        self.associations.extend(branch.associations);

        if let Some(default_flow_id) = branch.default_flow_id {
            let gateway_id = self.current_gateway_id.clone().unwrap_or_default();
            if let Some(
                BpmnFlowElement::ExclusiveGateway(gw) | BpmnFlowElement::InclusiveGateway(gw),
            ) = self.find_mut(&gateway_id)
            {
                gw.default = Some(default_flow_id);
            }
        }

        if !branch.connected {
            let ends = branch
                .last_node_id
                .into_iter()
                .chain(branch.open_branch_ends);
            for end_id in ends {
                let is_open = self
                    .find(&end_id)
                    .is_some_and(|el| !matches!(el, BpmnFlowElement::EndEvent(_)));
                if is_open {
                    self.open_branch_ends.push(end_id);
                }
            }
        }

        self.last_node_id = None;
        Ok(())
    }
}

/// The head of TS's `branch()`: refuses a branch with no gateway before it, then runs the
/// callback on a fresh [`BranchBuilder`] that shares `shared`.
pub(crate) fn run_branch(
    shared: &SharedRef,
    current_gateway_id: Option<&str>,
    name: &str,
    callback: impl FnOnce(&mut BranchBuilder),
) -> Result<BranchOutcome, Failed> {
    let Some(gateway_id) = current_gateway_id else {
        return Err(fail(
            shared,
            "branch() must be called after a gateway element",
        ));
    };
    let mut branch = BranchBuilder::new(gateway_id, name, Rc::clone(shared));
    callback(&mut branch);
    if is_failed(shared) {
        return Err(Failed);
    }
    Ok(branch.into_outcome())
}
