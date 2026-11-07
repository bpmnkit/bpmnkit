//! `OptimizationFinding` from `@bpmnkit/core`'s `optimize/types.ts`.

use bpmnkit_bpmn::BpmnDefinitions;
use serde::{Deserialize, Serialize};

/// `OptimizationCategory`; the spec's rule category maps onto it.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Category {
    Feel,
    FeelSyntax,
    Flow,
    Naming,
    TaskReuse,
    Extract,
    Pattern,
    DataFlow,
    Deploy,
    Agentic,
    Connector,
}

impl Category {
    /// Every category, in the order `optimize` runs them.
    pub const ALL: [Category; 11] = [
        Category::Feel,
        Category::FeelSyntax,
        Category::Flow,
        Category::Naming,
        Category::TaskReuse,
        Category::Extract,
        Category::Pattern,
        Category::DataFlow,
        Category::Deploy,
        Category::Agentic,
        Category::Connector,
    ];
}

impl From<bpmnkit_spec::lint::Category> for Category {
    fn from(c: bpmnkit_spec::lint::Category) -> Self {
        use bpmnkit_spec::lint::Category as S;
        match c {
            S::Feel => Self::Feel,
            S::FeelSyntax => Self::FeelSyntax,
            S::Flow => Self::Flow,
            S::Naming => Self::Naming,
            S::TaskReuse => Self::TaskReuse,
            S::Extract => Self::Extract,
            S::Pattern => Self::Pattern,
            S::DataFlow => Self::DataFlow,
            S::Deploy => Self::Deploy,
            S::Agentic => Self::Agentic,
            S::Connector => Self::Connector,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Info,
    Warning,
    Error,
}

/// What a fix changed, plus any separate document it generated.
#[derive(Debug, Clone, PartialEq)]
pub struct ApplyFixResult {
    pub description: String,
    pub generated: Option<BpmnDefinitions>,
}

/// Mutates the definitions in place, as TS's `applyFix`.
pub type Fix = Box<dyn Fn(&mut BpmnDefinitions) -> ApplyFixResult + Send + Sync>;

/// A finding with its optional fix.
pub struct Finding {
    pub data: FindingData,
    pub apply_fix: Option<Fix>,
}

impl std::fmt::Debug for Finding {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Finding")
            .field("data", &self.data)
            .field("fixable", &self.apply_fix.is_some())
            .finish()
    }
}

impl Finding {
    pub fn new(data: FindingData) -> Self {
        Self {
            data,
            apply_fix: None,
        }
    }

    pub fn with_fix(
        mut self,
        fix: impl Fn(&mut BpmnDefinitions) -> ApplyFixResult + Send + Sync + 'static,
    ) -> Self {
        self.apply_fix = Some(Box::new(fix));
        self
    }

    pub fn fixable(&self) -> bool {
        self.apply_fix.is_some()
    }
}

/// The plain-data part of a finding; JSON matches TS's field names.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FindingData {
    pub id: String,
    pub category: Category,
    pub severity: Severity,
    pub message: String,
    pub suggestion: String,
    pub process_id: String,
    pub element_ids: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub produces: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub consumes: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bpmnlint_rule: Option<String>,
}
