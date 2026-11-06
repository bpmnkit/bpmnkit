//! `optimize/index.ts` and its passes.

use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::BpmnDefinitions;
use indexmap::IndexMap;
use serde::Serialize;

/// `resolveConnectorRequirements`: a template's missing required keys.
pub type ConnectorRequirements = Box<dyn Fn(&str, &[String]) -> Vec<String> + Send + Sync>;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum UserTaskForms {
    #[default]
    Require,
    Off,
}

/// `OptimizeOptions`; `None` takes TS's default.
#[derive(Default)]
pub struct OptimizeOptions {
    pub feel_length_threshold: Option<usize>,
    pub feel_nesting_threshold: Option<usize>,
    pub feel_operator_threshold: Option<usize>,
    pub feel_variable_threshold: Option<usize>,
    pub reuse_threshold: Option<usize>,
    pub categories: Option<Vec<Category>>,
    pub resolve_connector_requirements: Option<ConnectorRequirements>,
    pub camunda_version: Option<String>,
    pub user_task_forms: UserTaskForms,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Summary {
    pub total: usize,
    pub by_category: IndexMap<Category, usize>,
    pub by_severity: IndexMap<Severity, usize>,
}

#[derive(Debug)]
pub struct OptimizationReport {
    pub findings: Vec<Finding>,
    pub summary: Summary,
}

/// `optimize`: static analysis of the definitions.
pub fn optimize(_defs: &BpmnDefinitions, _options: &OptimizeOptions) -> OptimizationReport {
    OptimizationReport {
        findings: vec![],
        summary: Summary {
            total: 0,
            by_category: IndexMap::new(),
            by_severity: IndexMap::new(),
        },
    }
}
