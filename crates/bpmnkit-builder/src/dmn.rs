//! Port of `dmn/dmn-builder.ts`: `DecisionTableBuilder`, a one-decision DMN document.
//!
//! Porter notes:
//! - Ids come from `generate_id` in TS's call order, which tests pin: `DecisionTable` in
//!   the constructor; `Input` then `InputExpression` per input; `Output` per output;
//!   per rule `UnaryTests` for each input entry, `LiteralExpression` for each output entry,
//!   then `DecisionRule`; `Definitions` in every `build()` (so `to_xml()` and the DRD's
//!   `decision()` each consume one).
//! - `rule()` errors (TS `ValidationError`): `Rule has 2 inputs but table has 1 input
//!   columns` (inputs checked first). Recorded in `error`; later calls are no-ops.
//! - `build()`: `hitPolicy` omitted when UNIQUE; the decision's `name` is the id until
//!   `name()`; one DI shape at (160, 100, 180×80); the document literal exactly as TS's
//!   (`name: "DRD"`, namespaces `""`, `dmndi`, `dc`, `modeler` in that order,
//!   `modelerAttributes` executionPlatform then executionPlatformVersion "8.5.0").

use bpmnkit_dmn::{DmnDefinitions, DmnInput, DmnOutput, DmnRule};

use crate::options::{HitPolicy, InputOptions, OutputOptions, RuleOptions};
use crate::shared::BuildError;

/// TS's `DecisionTableBuilder`.
#[derive(Debug, Clone)]
pub struct DecisionTableBuilder {
    pub(crate) decision_id: String,
    pub(crate) decision_name: String,
    pub(crate) table_id: String,
    pub(crate) hit_policy: HitPolicy,
    pub(crate) input_columns: Vec<DmnInput>,
    pub(crate) output_columns: Vec<DmnOutput>,
    pub(crate) rule_rows: Vec<DmnRule>,
    pub(crate) error: Option<BuildError>,
}

impl DecisionTableBuilder {
    /// TS's constructor; draws the table id from `generate_id("DecisionTable")`.
    pub fn new(decision_id: &str) -> Self {
        todo!()
    }

    /// TS's `name()`.
    pub fn name(&mut self, name: &str) -> &mut Self {
        todo!()
    }

    /// TS's `hitPolicy()`.
    pub fn hit_policy(&mut self, policy: HitPolicy) -> &mut Self {
        todo!()
    }

    /// TS's `input()`.
    pub fn input(&mut self, options: InputOptions) -> &mut Self {
        todo!()
    }

    /// TS's `output()`.
    pub fn output(&mut self, options: OutputOptions) -> &mut Self {
        todo!()
    }

    /// TS's `rule()`.
    pub fn rule(&mut self, options: RuleOptions) -> &mut Self {
        todo!()
    }

    /// TS's `build()`.
    pub fn build(&self) -> Result<DmnDefinitions, BuildError> {
        todo!()
    }

    /// TS's `toXml()`: `serialize_dmn(build())`.
    pub fn to_xml(&self) -> Result<String, BuildError> {
        todo!()
    }
}
