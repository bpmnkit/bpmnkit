//! Zeebe deployment rule metadata (`spec/zeebe-rules.json`). The checks live in
//! `bpmnkit_compat::zeebe`; this is the data both sides share.

pub use crate::generated::zeebe_rules::{
    ZEEBE_LATEST_VERSION, ZEEBE_RULES, ZEEBE_VERIFIED_VERSION,
};

/// What a rule needs to be decided.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RuleKind {
    Static,
    Feel,
    Context,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RuleSeverity {
    Error,
    Warning,
    Info,
}

/// How BPMN Kit decides the rule.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RuleCheck {
    /// `validate_deployable` on the parsed model.
    Model,
    /// `validate_deployable_xml`, on the text before parsing.
    Xml,
    /// Only with a resolver for the other resources of the deployment.
    Context,
    /// Not decidable from one BPMN.
    None,
}

/// One Zeebe deployment rule; the finding id is `zeebe/<name>`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ZeebeRule {
    pub id: &'static str,
    pub name: &'static str,
    pub kind: RuleKind,
    pub severity: RuleSeverity,
    pub check: RuleCheck,
    /// First Camunda version the rule applies to.
    pub since: &'static str,
    /// Last Camunda version the rule applies to, when Zeebe dropped it.
    pub until: Option<&'static str>,
    /// Zeebe's first message for the rule, `%s` for a placeholder.
    pub message: &'static str,
}

/// The rule called `name` (the part after `zeebe/`).
pub fn zeebe_rule(name: &str) -> Option<&'static ZeebeRule> {
    ZEEBE_RULES.iter().find(|r| r.name == name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_the_spec() {
        let spec = crate::test_support::spec_json("zeebe-rules.json");
        let rules = spec["rules"].as_array().unwrap();
        assert_eq!(rules.len(), ZEEBE_RULES.len());
        for (json, rule) in rules.iter().zip(ZEEBE_RULES) {
            assert_eq!(json["id"], rule.id);
            assert_eq!(json["name"], rule.name);
        }
        assert!(zeebe_rule("end-event-outgoing").is_some());
    }
}
