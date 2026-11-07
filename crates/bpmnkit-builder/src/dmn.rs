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

use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_dmn::{
    serialize_dmn, DmnBounds, DmnDecision, DmnDecisionTable, DmnDefinitions, DmnDiagram,
    DmnDiagramShape, DmnEntry, DmnInput, DmnInputExpression, DmnOutput, DmnRule,
};
use indexmap::IndexMap;

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
        Self {
            decision_id: decision_id.to_owned(),
            decision_name: decision_id.to_owned(),
            table_id: generate_id("DecisionTable"),
            hit_policy: HitPolicy::Unique,
            input_columns: vec![],
            output_columns: vec![],
            rule_rows: vec![],
            error: None,
        }
    }

    fn failed(&self) -> bool {
        self.error.is_some()
    }

    /// TS's `name()`.
    pub fn name(&mut self, name: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.decision_name = name.to_owned();
        self
    }

    /// TS's `hitPolicy()`.
    pub fn hit_policy(&mut self, policy: HitPolicy) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.hit_policy = policy;
        self
    }

    /// TS's `input()`.
    pub fn input(&mut self, options: InputOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        let input_id = generate_id("Input");
        let expr_id = generate_id("InputExpression");
        self.input_columns.push(DmnInput {
            id: input_id,
            label: options.label,
            input_expression: DmnInputExpression {
                id: expr_id,
                type_ref: options.type_ref.map(|t| t.as_str().to_owned()),
                text: Some(options.expression),
            },
        });
        self
    }

    /// TS's `output()`.
    pub fn output(&mut self, options: OutputOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        let output_id = generate_id("Output");
        self.output_columns.push(DmnOutput {
            id: output_id,
            label: options.label,
            name: Some(options.name),
            type_ref: options.type_ref.map(|t| t.as_str().to_owned()),
            output_values: None,
        });
        self
    }

    /// TS's `rule()`.
    pub fn rule(&mut self, options: RuleOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        if options.inputs.len() != self.input_columns.len() {
            self.error = Some(BuildError {
                message: format!(
                    "Rule has {} inputs but table has {} input columns",
                    options.inputs.len(),
                    self.input_columns.len()
                ),
            });
            return self;
        }
        if options.outputs.len() != self.output_columns.len() {
            self.error = Some(BuildError {
                message: format!(
                    "Rule has {} outputs but table has {} output columns",
                    options.outputs.len(),
                    self.output_columns.len()
                ),
            });
            return self;
        }

        let input_entries = options
            .inputs
            .into_iter()
            .map(|text| DmnEntry {
                id: generate_id("UnaryTests"),
                text,
            })
            .collect();
        let output_entries = options
            .outputs
            .into_iter()
            .map(|text| DmnEntry {
                id: generate_id("LiteralExpression"),
                text,
            })
            .collect();

        self.rule_rows.push(DmnRule {
            id: generate_id("DecisionRule"),
            description: options.description,
            input_entries,
            output_entries,
        });
        self
    }

    /// TS's `build()`.
    pub fn build(&self) -> Result<DmnDefinitions, BuildError> {
        if let Some(e) = &self.error {
            return Err(e.clone());
        }
        let decision_table = DmnDecisionTable {
            id: self.table_id.clone(),
            hit_policy: match self.hit_policy {
                HitPolicy::Unique => None,
                other => Some(other.as_str().to_owned()),
            },
            aggregation: None,
            inputs: self.input_columns.clone(),
            outputs: self.output_columns.clone(),
            rules: self.rule_rows.clone(),
        };

        let decision = DmnDecision {
            id: self.decision_id.clone(),
            name: Some(self.decision_name.clone()),
            decision_table: Some(decision_table),
            ..Default::default()
        };

        let diagram = DmnDiagram {
            shapes: vec![DmnDiagramShape {
                dmn_element_ref: self.decision_id.clone(),
                bounds: DmnBounds {
                    x: 160.0,
                    y: 100.0,
                    width: 180.0,
                    height: 80.0,
                },
            }],
            edges: vec![],
        };

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
            ("executionPlatformVersion", "8.5.0"),
        ]
        .into_iter()
        .map(|(k, v)| (k.to_owned(), v.to_owned()))
        .collect();

        Ok(DmnDefinitions {
            id: generate_id("Definitions"),
            name: "DRD".to_owned(),
            namespace: "http://camunda.org/schema/1.0/dmn".to_owned(),
            exporter: Some("bpmn-sdk".to_owned()),
            exporter_version: Some("0.0.1".to_owned()),
            namespaces,
            modeler_attributes,
            decisions: vec![decision],
            diagram: Some(diagram),
            ..Default::default()
        })
    }

    /// TS's `toXml()`: `serialize_dmn(build())`.
    pub fn to_xml(&self) -> Result<String, BuildError> {
        Ok(serialize_dmn(&self.build()?))
    }
}
