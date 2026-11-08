//! Port of `dmn/drd-builder.ts`: `DrdBuilder`, several decisions and input data wired by
//! information requirements, laid out with `layoutDmn`.
//!
//! Porter notes:
//! - `decision()` returns a handle, not `&mut Self` (as TS). It runs the table callback on
//!   a fresh `DecisionTableBuilder::new(id)` and calls its `build()` (which draws a
//!   `Definitions` id; keep that call so later ids match). A table error is recorded here.
//! - Errors: `Duplicate DRD element id "<id>"`; unknown requirement (checked in `build()`,
//!   in decision order then `requires` order): `Decision "<owner>" requires unknown id
//!   "<id>". Valid ids: a, b.<hint> See agent-cards/dmn.md#traps.` with `(none)` for no ids and the name/label hint when
//!   the id is some decision's name or input's name.
//! - `build()` draws `InformationRequirement` ids per requirement, then `Definitions`, then
//!   `bpmnkit_layout::layout_dmn`. Each requirement is `{ id, requiredDecision }` or
//!   `{ id, requiredInput }`.

use std::fmt;

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_dmn::{
    serialize_dmn, DmnDecision, DmnDefinitions, DmnInformationRequirement, DmnInputData,
};
use bpmnkit_layout::layout_dmn_owned;
use indexmap::IndexMap;

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

    fn failed(&self) -> bool {
        self.error.is_some()
    }

    /// TS's private `assertFreeId`.
    fn assert_free_id(&self, id: &str) -> Result<(), String> {
        let taken = self
            .decisions
            .iter()
            .map(|(d, _)| d.id.as_str())
            .chain(self.inputs.iter().map(|i| i.id.as_str()));
        for t in taken {
            if t == id {
                return Err(format!("Duplicate DRD element id \"{id}\""));
            }
        }
        Ok(())
    }

    /// TS's `inputData(id, name = id)`.
    pub fn input_data(&mut self, id: &str, name: Option<&str>) -> InputDataHandle {
        let name = name.unwrap_or(id);
        let handle = InputDataHandle {
            id: drg_id(id),
            name: name.to_owned(),
        };
        if self.failed() {
            return handle;
        }
        if let Err(message) = self.assert_free_id(id) {
            self.error = Some(BuildError::new(message));
            return handle;
        }
        self.inputs.push(DmnInputData {
            id: id.to_owned(),
            name: Some(name.to_owned()),
        });
        handle
    }

    /// TS's `decision()`.
    pub fn decision(
        &mut self,
        id: &str,
        table: impl FnOnce(&mut DecisionTableBuilder),
        options: DrdDecisionOptions,
    ) -> DecisionHandle {
        let mut handle = DecisionHandle {
            id: drg_id(id),
            name: id.to_owned(),
        };
        if self.failed() {
            return handle;
        }
        if let Err(message) = self.assert_free_id(id) {
            self.error = Some(BuildError::new(message));
            return handle;
        }
        let mut builder = DecisionTableBuilder::new(id);
        table(&mut builder);
        // `build()` draws a `Definitions` id even though only the decision is kept.
        let built = match builder.build() {
            Ok(defs) => defs,
            Err(e) => {
                self.error = Some(e);
                return handle;
            }
        };
        let Some(decision) = built.decisions.into_iter().next() else {
            self.error = Some(BuildError::new(format!(
                "Decision \"{id}\" produced no decision"
            )));
            return handle;
        };
        if let Some(name) = &decision.name {
            handle.name = name.clone();
        }
        self.decisions.push((decision, options.requires));
        handle
    }

    /// TS's private `resolve`.
    fn resolve(&self, owner: &str, reference: &DrgRef) -> Result<String, String> {
        let id = reference.id();
        let known: Vec<&str> = self
            .decisions
            .iter()
            .map(|(d, _)| d.id.as_str())
            .chain(self.inputs.iter().map(|i| i.id.as_str()))
            .collect();
        if known.contains(&id) {
            return Ok(id.to_owned());
        }
        let by_name = self
            .decisions
            .iter()
            .find(|(d, _)| d.name.as_deref() == Some(id))
            .map(|(d, _)| d.id.as_str())
            .or_else(|| {
                self.inputs
                    .iter()
                    .find(|i| i.name.as_deref() == Some(id))
                    .map(|i| i.id.as_str())
            })
            .filter(|s| !s.is_empty());
        let hint = match by_name {
            Some(by_name) => format!(
                " \"{id}\" is a name/label, not an id. Use the id \"{by_name}\" (pass the handle returned by decision())."
            ),
            None => String::new(),
        };
        let valid = if known.is_empty() {
            "(none)".to_owned()
        } else {
            known.join(", ")
        };
        Err(format!(
            "Decision \"{owner}\" requires unknown id \"{id}\". Valid ids: {valid}.{hint} See agent-cards/dmn.md#traps."
        ))
    }

    /// TS's `build()`.
    pub fn build(&self) -> Result<DmnDefinitions, BuildError> {
        if let Some(e) = &self.error {
            return Err(e.clone());
        }
        let mut decisions: Vec<DmnDecision> = Vec::with_capacity(self.decisions.len());
        for (decision, requires) in &self.decisions {
            let mut information_requirements = vec![];
            for reference in requires {
                let target = self
                    .resolve(&decision.id, reference)
                    .map_err(BuildError::new)?;
                let is_decision = self.decisions.iter().any(|(d, _)| d.id == target);
                let id = generate_id("InformationRequirement");
                information_requirements.push(if is_decision {
                    DmnInformationRequirement {
                        id,
                        required_decision: Some(target),
                        required_input: None,
                    }
                } else {
                    DmnInformationRequirement {
                        id,
                        required_decision: None,
                        required_input: Some(target),
                    }
                });
            }
            decisions.push(DmnDecision {
                information_requirements,
                ..decision.clone()
            });
        }

        let namespaces: IndexMap<String, String> = [
            ("", "https://www.omg.org/spec/DMN/20191111/MODEL/"),
            ("dmndi", "https://www.omg.org/spec/DMN/20191111/DMNDI/"),
            ("dc", "http://www.omg.org/spec/DMN/20180521/DC/"),
            ("modeler", "http://camunda.org/schema/modeler/1.0"),
        ]
        .into_iter()
        .map(|(k, v)| (k.to_owned(), v.to_owned()))
        .collect();
        let modeler_attributes: IndexMap<String, String> = [
            ("executionPlatform", "Camunda Cloud"),
            ("executionPlatformVersion", "8.10.0"),
        ]
        .into_iter()
        .map(|(k, v)| (k.to_owned(), v.to_owned()))
        .collect();

        Ok(layout_dmn_owned(DmnDefinitions {
            id: generate_id("Definitions"),
            name: self.drd_name.clone(),
            namespace: "http://camunda.org/schema/1.0/dmn".to_owned(),
            exporter: Some("bpmn-sdk".to_owned()),
            exporter_version: Some("0.0.1".to_owned()),
            namespaces,
            modeler_attributes,
            decisions,
            input_data: self.inputs.clone(),
            ..Default::default()
        }))
    }

    /// TS's `toXml()`.
    pub fn to_xml(&self) -> Result<String, BuildError> {
        Ok(serialize_dmn(&self.build()?))
    }
}
