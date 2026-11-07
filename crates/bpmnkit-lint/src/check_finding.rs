//! `CheckFinding` from `@bpmnkit/core`'s `check-finding.ts`.

use serde::{Deserialize, Serialize};

/// How bad a [`CheckFinding`] is. `Error` means the resource will not deploy or run as written.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CheckSeverity {
    Error,
    Warning,
    Info,
}

/// One problem in a DMN or form resource: which rule fired, where, what is wrong and
/// what to change. JSON matches TS's field names.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckFinding {
    /// Stable rule id, e.g. `dmn/unresolved-requirement` or `form/duplicate-key`.
    pub rule: String,
    pub severity: CheckSeverity,
    /// The element (DMN) or component (form) the finding is about, when there is one.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub element_id: Option<String>,
    pub message: String,
    /// A concrete change that resolves the finding.
    pub fix: String,
}

/// Appends the pointer to a card's trap list, so a fix loop learns where the rule is explained.
pub(crate) fn with_card_hint(findings: Vec<CheckFinding>, card: &str) -> Vec<CheckFinding> {
    findings
        .into_iter()
        .map(|mut f| {
            f.fix = format!("{} (agent-cards/{card}.md#traps)", f.fix);
            f
        })
        .collect()
}
