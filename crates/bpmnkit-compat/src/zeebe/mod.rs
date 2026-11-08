//! The Zeebe deployment validator: the Rust twin of `@bpmnkit/core`'s
//! `zeebe-validate/`. It reports what Zeebe rejects when a BPMN is deployed
//! (`spec/zeebe-rules.json`), recursively and per Camunda version, whatever
//! `modeler:executionPlatform` says. `conformance/validate/` pins the output.

mod context;
mod events;
mod extensions;
pub mod gate;
mod gateways;
mod references;
mod structure;
mod tasks;
mod xml;
mod xsd;

pub use context::{
    feel_error, feel_failure, is_expression, local_ref, non_empty, static_value_message, FlowEntry,
    NodeEntry, Scope, ScopeKind, ValidateOptions, ZeebeContext, ZeebeLimits, ZeebeResolver,
    ZEEBE_NS,
};

pub use gate::{
    assert_deployable, assert_deployable_xml, deployability_message, targets_camunda8,
    AssertOptions, DeployabilityError, Deployable, Placeholder, PlaceholderField, PlaceholderFill,
    PLACEHOLDERS,
};

use crate::finding::{Finding, Severity};
use bpmnkit_bpmn::{parse_bpmn, BpmnDefinitions};

/// Runs every section's checks, in spec order (see `zeebe-validate/index.ts`).
fn run_checks(ctx: &mut ZeebeContext) {
    structure::check(ctx);
    events::check(ctx);
    references::check(ctx);
    tasks::check(ctx);
    gateways::check(ctx);
    extensions::check(ctx);
}

/// `validateDeployable`: what Zeebe would reject in the model.
pub fn validate_deployable(
    definitions: &BpmnDefinitions,
    options: &ValidateOptions,
) -> Vec<Finding> {
    let mut ctx = ZeebeContext::new(definitions, options);
    run_checks(&mut ctx);
    ctx.finish()
}

/// `validateDeployableXml`: [`validate_deployable`] plus the checks Zeebe runs on
/// the text before it builds a model.
pub fn validate_deployable_xml(xml: &str, options: &ValidateOptions) -> Vec<Finding> {
    let (definitions, parse_error) = match parse_bpmn(xml) {
        Ok(d) => (d, None),
        Err(e) => (BpmnDefinitions::default(), Some(e.to_string())),
    };
    let mut ctx = ZeebeContext::new(&definitions, options);
    let fatal = xml::check_xml(xml, &mut ctx);
    if let (Some(e), false) = (&parse_error, fatal) {
        ctx.report(
            "xml-schema",
            "",
            format!("Unable to parse BPMN XML: {e}"),
            "Fix the XML so it is well-formed BPMN 2.0.",
        );
    }
    if !fatal && parse_error.is_none() {
        run_checks(&mut ctx);
    }
    ctx.finish()
}

/// `isDeployable`: no finding of severity `error`.
pub fn is_deployable(findings: &[Finding]) -> bool {
    !findings.iter().any(|f| f.data.severity == Severity::Error)
}
