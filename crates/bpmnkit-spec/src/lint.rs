//! bpmnlint rule metadata (`spec/lint-rules.json`). Check functions and their
//! messages stay in the implementations; this is the data both sides share.

pub use crate::generated::lint_rules::{BPMNLINT_VERSION, LINT_RULES, NATIVE_ORDER};
use crate::generated::lint_rules::{CORRECTNESS, RECOMMENDED, STANDARD_SIZE_DEFAULTS};

/// A rule's configured severity in a `.bpmnlintrc`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Severity {
    Off,
    Warn,
    Error,
    Info,
}

/// The optimizer category a natively implemented rule reports under.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
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

/// One bpmnlint rule; `category` is set when BPMN Kit implements it natively.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LintRule {
    pub name: &'static str,
    pub category: Option<Category>,
}

/// Default size of a BPMN type for the `standard-size` rule.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SizeDefault {
    pub bpmn_type: &'static str,
    pub width: u32,
    pub height: u32,
}

/// The rule called `name`, if bpmnlint has one.
pub fn lint_rule(name: &str) -> Option<&'static LintRule> {
    LINT_RULES.iter().find(|r| r.name == name)
}

/// `standard-size` defaults, one per BPMN type.
pub fn standard_size_defaults() -> &'static [SizeDefault] {
    STANDARD_SIZE_DEFAULTS
}

/// bpmnlint's `correctness` preset, in its key order.
pub fn correctness_preset() -> &'static [(&'static str, Severity)] {
    CORRECTNESS
}

/// bpmnlint's `recommended` preset, in its key order.
pub fn recommended_preset() -> &'static [(&'static str, Severity)] {
    RECOMMENDED
}

/// bpmnlint's `all` preset: every rule at error.
pub fn all_preset() -> Vec<(&'static str, Severity)> {
    LINT_RULES
        .iter()
        .map(|r| (r.name, Severity::Error))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::spec_json;

    fn debug_kebab<T: std::fmt::Debug>(v: T) -> String {
        let s = format!("{v:?}");
        let mut out = String::new();
        for (i, c) in s.chars().enumerate() {
            if c.is_uppercase() && i > 0 {
                out.push('-');
            }
            out.extend(c.to_lowercase());
        }
        out
    }

    #[test]
    fn rules_match_spec_file() {
        let spec = spec_json("lint-rules.json");
        assert_eq!(spec["bpmnlintVersion"], BPMNLINT_VERSION);
        let rules = spec["rules"].as_array().expect("rules");
        assert_eq!(rules.len(), LINT_RULES.len());
        for (json, r) in rules.iter().zip(LINT_RULES) {
            assert_eq!(json["name"], r.name);
            assert_eq!(
                json["category"].as_str().map(str::to_owned),
                r.category.map(debug_kebab),
                "{}",
                r.name
            );
        }
        let order: Vec<&str> = spec["nativeOrder"]
            .as_array()
            .expect("nativeOrder")
            .iter()
            .map(|n| n.as_str().expect("name"))
            .collect();
        assert_eq!(order, NATIVE_ORDER);
        let natives: Vec<&str> = LINT_RULES
            .iter()
            .filter(|r| r.category.is_some())
            .map(|r| r.name)
            .collect();
        let mut sorted = order.clone();
        sorted.sort_unstable();
        let mut natives_sorted = natives;
        natives_sorted.sort_unstable();
        assert_eq!(sorted, natives_sorted);
    }

    #[test]
    fn sizes_and_presets_match_spec_file() {
        let spec = spec_json("lint-rules.json");
        let sizes = spec["standardSize"]["defaults"].as_object().expect("sizes");
        assert_eq!(sizes.len(), standard_size_defaults().len());
        // serde_json sorts object keys, so look each entry up instead of zipping.
        for s in standard_size_defaults() {
            let json = &sizes[s.bpmn_type];
            assert_eq!(json["width"], s.width);
            assert_eq!(json["height"], s.height);
        }
        for (id, preset) in [
            ("correctness", correctness_preset()),
            ("recommended", recommended_preset()),
        ] {
            let json = spec["presets"][id].as_object().expect("preset");
            assert_eq!(json.len(), preset.len(), "{id}");
            for (name, severity) in preset {
                assert_eq!(json[*name].as_str(), Some(debug_kebab(severity).as_str()));
                assert!(lint_rule(name).is_some(), "{name}");
            }
        }
    }

    #[test]
    fn all_preset_covers_every_rule() {
        let all = all_preset();
        assert_eq!(all.len(), LINT_RULES.len());
        assert!(all.iter().all(|(_, s)| *s == Severity::Error));
    }
}
