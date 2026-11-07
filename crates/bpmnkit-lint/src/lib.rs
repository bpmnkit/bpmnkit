//! Lint and optimize: the Rust twin of `@bpmnkit/core`'s `optimize/`, `lint.ts`,
//! `bpmnlint.ts`, `dmn/lint.ts` and `form/lint.ts`. TS is the oracle:
//! `conformance/lint/` and `conformance/optimize/` pin the output.
//!
//! ```
//! use bpmnkit_bpmn::parse_bpmn;
//! use bpmnkit_lint::lint::{lint_diagram, LintOptions};
//!
//! let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
//! <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
//!   <bpmn:process id="p" isExecutable="true">
//!     <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
//!     <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
//!     <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
//!   </bpmn:process>
//! </bpmn:definitions>"#;
//! let definitions = parse_bpmn(xml).unwrap();
//! let report = lint_diagram(&definitions, LintOptions::default());
//! for d in &report.diagnostics {
//!     println!("{} {}: {}", d.id, d.process_id, d.message);
//! }
//! assert_eq!(report.total, report.diagnostics.len());
//! ```

pub mod bpmnlint;
pub mod bpmnlint_rules;
pub mod check_finding;
pub mod compat_config;
pub mod dmn_lint;
pub mod export;
pub mod form_lint;
mod js;
mod js_regex;
pub mod lint;
pub mod optimize;
mod v8_json;

pub use bpmnkit_compat::finding::{ApplyFixResult, Category, Finding, FindingData, Fix, Severity};
pub use bpmnlint::{
    apply_bpmnlint_config, bpmnlint_rule_for_finding, normalize_bpmnlint_rule_name,
    parse_bpmnlint_config, resolve_bpmnlint_config, ResolvedBpmnlintConfig,
};
pub use check_finding::{CheckFinding, CheckSeverity};
pub use compat_config::{apply_camunda_compat_config, split_camunda_compat_config};
pub use dmn_lint::lint_dmn;
pub use export::{export_bpmn, ExportOptions, ExportValidate, Exported};
pub use form_lint::lint_form;
pub use lint::{detect_execution_platform, lint_categories, lint_diagram, LintOptions, LintReport};
