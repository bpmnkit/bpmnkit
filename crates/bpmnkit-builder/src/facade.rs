//! The builder entry points of TS's `Bpmn` (`bpmn/index.ts`) and `Dmn` (`dmn/index.ts`)
//! facades. Parsing, export and layout live in `bpmnkit-bpmn`, `bpmnkit-dmn` and
//! `bpmnkit-layout`; `makeEmpty` (random ids) is not ported.

use bpmnkit_bpmn::BpmnDefinitions;

use crate::diagram::DiagramBuilder;
use crate::dmn::DecisionTableBuilder;
use crate::drd::DrdBuilder;
use crate::process::ProcessBuilder;

/// TS's `Bpmn` builder entry points.
pub struct Bpmn;

impl Bpmn {
    /// `Bpmn.createProcess(processId)`.
    pub fn create_process(process_id: &str) -> ProcessBuilder {
        ProcessBuilder::new(process_id)
    }

    /// `Bpmn.continueProcess(definitions, processId)`.
    pub fn continue_process(definitions: &BpmnDefinitions, process_id: &str) -> ProcessBuilder {
        ProcessBuilder::from(definitions, process_id)
    }

    /// `Bpmn.createDiagram(id = "Definitions_1")`.
    pub fn create_diagram(id: Option<&str>) -> DiagramBuilder {
        DiagramBuilder::new(id.unwrap_or("Definitions_1"))
    }
}

/// TS's `Dmn` builder entry points.
pub struct Dmn;

impl Dmn {
    /// `Dmn.createDecisionTable(decisionId)`.
    pub fn create_decision_table(decision_id: &str) -> DecisionTableBuilder {
        DecisionTableBuilder::new(decision_id)
    }

    /// `Dmn.drd(name?)`.
    pub fn drd(name: Option<&str>) -> DrdBuilder {
        DrdBuilder::new(name)
    }
}
