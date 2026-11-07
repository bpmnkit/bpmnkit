//! `optimize/index.ts` and its passes: one module per TS file.

pub mod agentic;
pub mod deploy;
pub mod feel;
pub mod feel_syntax;
pub mod flow;
pub mod naming;
pub mod patterns;
pub mod tasks;
pub mod utils;
pub mod variable_flow;

use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::BpmnDefinitions;
use bpmnkit_compat::compat::{analyze_camunda_compat, dedupe_camunda_compat};
use indexmap::IndexMap;
use serde::Serialize;

/// The finding a user task with no form raises; see [`OptimizeOptions::user_task_forms`].
pub const USER_TASK_FORM_RULE: &str = "compat/user-task-definition";

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

/// `ResolvedOptions`: the thresholds with TS's defaults filled in.
pub struct ResolvedOptions {
    pub feel_length_threshold: usize,
    pub feel_nesting_threshold: usize,
    pub feel_operator_threshold: usize,
    pub feel_variable_threshold: usize,
    pub reuse_threshold: usize,
    pub categories: Vec<Category>,
}

impl ResolvedOptions {
    pub fn new(o: &OptimizeOptions) -> Self {
        Self {
            feel_length_threshold: o.feel_length_threshold.unwrap_or(80),
            feel_nesting_threshold: o.feel_nesting_threshold.unwrap_or(3),
            feel_operator_threshold: o.feel_operator_threshold.unwrap_or(5),
            feel_variable_threshold: o.feel_variable_threshold.unwrap_or(4),
            reuse_threshold: o.reuse_threshold.unwrap_or(2),
            categories: o
                .categories
                .clone()
                .unwrap_or_else(|| Category::ALL.to_vec()),
        }
    }

    fn has(&self, c: Category) -> bool {
        self.categories.contains(&c)
    }
}

/// `optimize`: static analysis of the definitions.
pub fn optimize(defs: &BpmnDefinitions, options: &OptimizeOptions) -> OptimizationReport {
    let r = ResolvedOptions::new(options);
    let mut findings: Vec<Finding> = vec![];

    for p in &defs.processes {
        if r.has(Category::Feel) {
            findings.extend(feel::analyze_feel(p, &r));
        }
        if r.has(Category::FeelSyntax) {
            findings.extend(feel_syntax::analyze_feel_syntax(p));
        }
        if r.has(Category::Flow) {
            findings.extend(flow::analyze_flow(p, &r));
        }
        if r.has(Category::Naming) {
            findings.extend(naming::analyze_naming(p, &r));
        }
        if r.has(Category::TaskReuse) {
            findings.extend(tasks::analyze_tasks(p, &r));
        }
        if r.has(Category::Pattern) {
            findings.extend(patterns::analyze_patterns(p));
        }
        if r.has(Category::DataFlow) {
            findings.extend(variable_flow::analyze_variable_flow(p));
        }
        if r.has(Category::Deploy) || r.has(Category::Connector) {
            let found = deploy::analyze_deploy(
                p,
                options.resolve_connector_requirements.as_ref(),
                &defs.messages,
            );
            findings.extend(found.into_iter().filter(|f| r.has(f.data.category)));
        }
        if r.has(Category::Agentic) {
            findings.extend(agentic::analyze_agentic(p));
        }
    }

    // Compatibility findings are deployability findings (`deploy`, ids `compat/…`); a
    // version pinned by a `.bpmnlintrc` asks for them even with `deploy` off.
    if r.has(Category::Deploy) || options.camunda_version.is_some() {
        findings.extend(analyze_camunda_compat(
            defs,
            options.camunda_version.as_deref(),
        ));
        findings = dedupe_camunda_compat(findings);
        if options.user_task_forms == UserTaskForms::Off {
            findings.retain(|f| f.data.id != USER_TASK_FORM_RULE);
        }
    }

    let count = |pred: &dyn Fn(&Finding) -> bool| findings.iter().filter(|f| pred(f)).count();
    let by_category = Category::ALL
        .iter()
        .map(|&c| (c, count(&|f| f.data.category == c)))
        .collect();
    let by_severity = [Severity::Info, Severity::Warning, Severity::Error]
        .iter()
        .map(|&s| (s, count(&|f| f.data.severity == s)))
        .collect();
    let summary = Summary {
        total: findings.len(),
        by_category,
        by_severity,
    };
    OptimizationReport { findings, summary }
}
