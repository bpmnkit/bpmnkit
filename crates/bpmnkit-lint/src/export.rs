//! TS's `Bpmn.export(definitions, { validate })`: serialise, refusing first what a Camunda 8
//! deploy would reject (`bpmnkit_compat::zeebe::assert_deployable`).

use bpmnkit_bpmn::{serialize_bpmn, BpmnDefinitions};
use bpmnkit_compat::compat::normalize_camunda_version;
use bpmnkit_compat::zeebe::{
    assert_deployable, targets_camunda8, AssertOptions, DeployabilityError,
};

/// TS's `ExportOptions.validate`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum ExportValidate {
    /// `"auto"` (default): refuse when the model targets Camunda 8
    /// (`modeler:executionPlatform="Camunda Cloud"`), for its `executionPlatformVersion`.
    #[default]
    Auto,
    /// `"error"`: refuse whatever the platform.
    Error,
    /// `"warn"`: check whatever the platform; TS logs the message, here it is `warning`.
    Warn,
    /// `false`: no check.
    Off,
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

/// TS's `Bpmn.export`. `Err` is the `DeployabilityError` TS would throw.
pub fn export_bpmn(
    definitions: &BpmnDefinitions,
    options: ExportOptions,
) -> Result<Exported, DeployabilityError> {
    let mut warning = None;
    let check = match options.validate {
        ExportValidate::Off => false,
        ExportValidate::Auto => targets_camunda8(definitions),
        ExportValidate::Error | ExportValidate::Warn => true,
    };
    if check {
        let camunda_version = normalize_camunda_version(
            definitions
                .unknown_attributes
                .get("modeler:executionPlatformVersion")
                .map(String::as_str),
        )
        .map(|v| v.as_str().to_string());
        let options_ = AssertOptions {
            camunda_version,
            ..AssertOptions::default()
        };
        match assert_deployable(definitions, &options_) {
            Ok(_) => {}
            Err(e) if options.validate == ExportValidate::Warn => warning = Some(e.to_string()),
            Err(e) => return Err(e),
        }
    }
    Ok(Exported {
        xml: serialize_bpmn(definitions),
        warning,
    })
}
