//! Port of `dmn/drd-builder.ts`: `DrdBuilder`, several decisions and input data wired by
//! information requirements, laid out with `layoutDmn`.
//!
//! Porter notes:
//! - `decision()` returns a handle, not `&mut Self` (as TS). It runs the table callback on
//!   a fresh `DecisionTableBuilder::new(id)` and calls its `build()` (which draws a
//!   `Definitions` id; keep that call so later ids match). A table error is recorded here.
//! - Errors: `Duplicate DRD element id "<id>"`; unknown requirement (checked in `build()`,
//!   in decision order then `requires` order): `Decision "<owner>" requires unknown id
//!   "<id>". Valid ids: a, b.<hint>` with `(none)` for no ids and the name/label hint when
//!   the id is some decision's name or input's name.
//! - `build()` draws `InformationRequirement` ids per requirement, then `Definitions`, then
//!   `bpmnkit_layout::layout_dmn`. Each requirement is `{ id, requiredDecision }` or
//!   `{ id, requiredInput }`.

use std::fmt;

use bpmnkit_dmn::{DmnDecision, DmnDefinitions, DmnInputData};

use crate::dmn::DecisionTableBuilder;
use crate::shared::BuildError;

/// TS's branded `DrgId`: an element id, never a name or label.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct DrgId(String);

impl DrgId {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for DrgId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// TS's `drgId()`: marks a string as an id.
pub fn drg_id(id: &str) -> DrgId {
    DrgId(id.to_owned())
}

/// TS's `DecisionHandle`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DecisionHandle {
    pub id: DrgId,
    pub name: String,
}

/// TS's `InputDataHandle`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InputDataHandle {
    pub id: DrgId,
    pub name: String,
}

/// TS's `DrgRef`: a handle or an id.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DrgRef {
    Decision(DecisionHandle),
    InputData(InputDataHandle),
    Id(DrgId),
}

impl DrgRef {
    /// The id it names (TS: `typeof ref === "string" ? ref : ref.id`).
    pub fn id(&self) -> &str {
        match self {
            DrgRef::Decision(h) => h.id.as_str(),
            DrgRef::InputData(h) => h.id.as_str(),
            DrgRef::Id(id) => id.as_str(),
        }
    }
}

impl From<DecisionHandle> for DrgRef {
    fn from(h: DecisionHandle) -> Self {
        DrgRef::Decision(h)
    }
}

impl From<&DecisionHandle> for DrgRef {
    fn from(h: &DecisionHandle) -> Self {
        DrgRef::Decision(h.clone())
    }
}

impl From<InputDataHandle> for DrgRef {
    fn from(h: InputDataHandle) -> Self {
        DrgRef::InputData(h)
    }
}

impl From<&InputDataHandle> for DrgRef {
    fn from(h: &InputDataHandle) -> Self {
        DrgRef::InputData(h.clone())
    }
}

impl From<DrgId> for DrgRef {
    fn from(id: DrgId) -> Self {
        DrgRef::Id(id)
    }
}

/// TS's `DrdDecisionOptions`.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct DrdDecisionOptions {
    pub requires: Vec<DrgRef>,
}

/// TS's `DrdBuilder`.
#[derive(Debug, Clone)]
pub struct DrdBuilder {
    pub(crate) decisions: Vec<(DmnDecision, Vec<DrgRef>)>,
    pub(crate) inputs: Vec<DmnInputData>,
    pub(crate) drd_name: String,
    pub(crate) error: Option<BuildError>,
}

impl DrdBuilder {
    /// TS's `new DrdBuilder(name = "DRD")`.
    pub fn new(name: Option<&str>) -> Self {
        Self {
            decisions: vec![],
            inputs: vec![],
            drd_name: name.unwrap_or("DRD").to_owned(),
            error: None,
        }
    }

    /// TS's private `assertFreeId`.
    fn assert_free_id(&self, id: &str) -> Result<(), String> {
        todo!()
    }

    /// TS's `inputData(id, name = id)`.
    pub fn input_data(&mut self, id: &str, name: Option<&str>) -> InputDataHandle {
        todo!()
    }

    /// TS's `decision()`.
    pub fn decision(
        &mut self,
        id: &str,
        table: impl FnOnce(&mut DecisionTableBuilder),
        options: DrdDecisionOptions,
    ) -> DecisionHandle {
        todo!()
    }

    /// TS's private `resolve`.
    fn resolve(&self, owner: &str, reference: &DrgRef) -> Result<String, String> {
        todo!()
    }

    /// TS's `build()`.
    pub fn build(&self) -> Result<DmnDefinitions, BuildError> {
        todo!()
    }

    /// TS's `toXml()`.
    pub fn to_xml(&self) -> Result<String, BuildError> {
        todo!()
    }
}
