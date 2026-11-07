//! Lint and optimize: the Rust twin of `@bpmnkit/core`'s `optimize/`, `lint.ts`,
//! `bpmnlint.ts`, `dmn/lint.ts` and `form/lint.ts`. TS is the oracle:
//! `conformance/lint/` and `conformance/optimize/` pin the output.

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
