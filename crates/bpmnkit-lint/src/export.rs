//! TS's `Bpmn.export(definitions, { validate })`: serialise, optionally linting first for
//! what a Camunda 8 deploy would reject.

use bpmnkit_bpmn::{serialize_bpmn, BpmnDefinitions};

use crate::lint::{lint_diagram, LintOptions};
use crate::Severity;

/// TS's `ExportOptions.validate`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum ExportValidate {
    /// `false` (default): no lint.
    #[default]
    Off,
    /// `"warn"`: TS logs the deploy errors and exports anyway.
    Warn,
    /// `"error"`: TS throws a `ValidationError`.
    Error,
}

/// TS's `ExportOptions`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct ExportOptions {
    pub validate: ExportValidate,
}

/// What [`export_bpmn`] wrote. TS logs `warning` with `console.warn`; here the caller decides.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Exported {
    pub xml: String,
    pub warning: Option<String>,
}

/// TS's `Bpmn.export`. `Err` carries the message TS's `ValidationError` would have.
pub fn export_bpmn(
    definitions: &BpmnDefinitions,
    options: ExportOptions,
) -> Result<Exported, String> {
    let mut warning = None;
    if options.validate != ExportValidate::Off {
        // Only the errors a Camunda 8 deploy would reject; an engine-neutral model is not judged.
        let report = lint_diagram(definitions, LintOptions::default());
        let errors: Vec<String> = report
            .diagnostics
            .iter()
            .filter(|d| d.severity == Severity::Error)
            .map(|d| {
                format!(
                    "{} [{}]: {} Fix: {}",
                    d.id,
                    d.element_ids.join(", "),
                    d.message,
                    d.suggestion
                )
            })
            .collect();
        if !errors.is_empty() {
            let text = format!(
                "Bpmn.export: {} deploy error(s):\n{}",
                errors.len(),
                errors.join("\n")
            );
            if options.validate == ExportValidate::Error {
                return Err(text);
            }
            warning = Some(text);
        }
    }
    Ok(Exported {
        xml: serialize_bpmn(definitions),
        warning,
    })
}
