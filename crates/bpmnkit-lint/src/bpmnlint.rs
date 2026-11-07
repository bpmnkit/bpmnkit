//! `.bpmnlintrc` compatibility (`@bpmnkit/core`'s `bpmnlint.ts`): reading a bpmnlint
//! configuration, expanding its presets, and applying it to BPMN Kit's own findings.
//!
//! Rule names, presets and the native rules' categories come from `spec/lint-rules.json`
//! (`bpmnkit_spec::lint`); the mapping onto finding ids lives here, as in TS.

use crate::bpmnlint_rules::{analyze_bpmnlint_rules, NATIVE_BPMNLINT_RULES};
use crate::js;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::BpmnDefinitions;
use bpmnkit_form::Json;
use bpmnkit_spec::lint as spec;
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};
use std::fmt;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/// A rule's reporting level. bpmnlint also accepts `0`–`3` for these, in this order.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BpmnlintSeverity {
    Off,
    Warn,
    Error,
    Info,
}

const NUMERIC_SEVERITY: [BpmnlintSeverity; 4] = [
    BpmnlintSeverity::Off,
    BpmnlintSeverity::Warn,
    BpmnlintSeverity::Error,
    BpmnlintSeverity::Info,
];

impl From<spec::Severity> for BpmnlintSeverity {
    fn from(s: spec::Severity) -> Self {
        match s {
            spec::Severity::Off => Self::Off,
            spec::Severity::Warn => Self::Warn,
            spec::Severity::Error => Self::Error,
            spec::Severity::Info => Self::Info,
        }
    }
}

impl BpmnlintSeverity {
    /// The finding severity a configured level reports at; `None` for `off`.
    pub fn finding_severity(self) -> Option<Severity> {
        match self {
            Self::Off => None,
            Self::Warn => Some(Severity::Warning),
            Self::Error => Some(Severity::Error),
            Self::Info => Some(Severity::Info),
        }
    }
}

/// `extends`: one entry or a list, kept as written.
#[derive(Debug, Clone, PartialEq)]
pub enum BpmnlintExtends {
    One(String),
    Many(Vec<String>),
}

impl BpmnlintExtends {
    pub fn entries(&self) -> &[String] {
        match self {
            Self::One(s) => std::slice::from_ref(s),
            Self::Many(v) => v,
        }
    }
}

/// The contents of a `.bpmnlintrc` file; rule settings stay raw until resolved.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct BpmnlintConfig {
    pub extends: Option<BpmnlintExtends>,
    pub rules: Option<IndexMap<String, Json>>,
    /// Moddle extension descriptors, by prefix. Only real bpmnlint uses these.
    pub moddle_extensions: Option<IndexMap<String, String>>,
}

/// One rule's effective setting after presets and overrides are merged.
#[derive(Debug, Clone, PartialEq)]
pub struct BpmnlintRuleSetting {
    pub severity: BpmnlintSeverity,
    /// The second element of an `[level, options]` setting, when there was one.
    pub options: Option<Json>,
}

impl BpmnlintRuleSetting {
    pub fn new(severity: BpmnlintSeverity) -> Self {
        Self {
            severity,
            options: None,
        }
    }
}

/// A `.bpmnlintrc` with its presets expanded and its rule names normalised.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct ResolvedBpmnlintConfig {
    /// Rule name → effective setting, in the order TS's object holds them.
    pub rules: IndexMap<String, BpmnlintRuleSetting>,
    /// `extends` entries this module could not expand (plugin configs).
    pub unresolved_extends: Vec<String>,
}

/// A `.bpmnlintrc` that is not JSON or does not have the shape bpmnlint expects.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BpmnlintConfigError(pub String);

impl fmt::Display for BpmnlintConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for BpmnlintConfigError {}

fn config_error(message: &str) -> BpmnlintConfigError {
    BpmnlintConfigError(format!(
        "{message} See https://github.com/bpmn-io/bpmnlint#configuration for the file format."
    ))
}

/// Parses the text of a `.bpmnlintrc` file.
pub fn parse_bpmnlint_config(text: &str) -> Result<BpmnlintConfig, BpmnlintConfigError> {
    let value = js::parse_json(text)
        .map_err(|e| config_error(&format!(".bpmnlintrc is not valid JSON: {e}.")))?;
    let Json::Obj(raw) = value else {
        return Err(config_error(".bpmnlintrc must contain a JSON object."));
    };
    let mut config = BpmnlintConfig::default();

    if let Some(ext) = raw.get("extends") {
        let list: Vec<&Json> = match ext {
            Json::Arr(a) => a.iter().collect(),
            other => vec![other],
        };
        let strings: Option<Vec<String>> = list
            .iter()
            .map(|e| match e {
                Json::Str(s) => Some(s.clone()),
                _ => None,
            })
            .collect();
        let Some(strings) = strings else {
            return Err(config_error(
                ".bpmnlintrc \"extends\" must be a string or an array of strings.",
            ));
        };
        config.extends = Some(match ext {
            Json::Str(s) => BpmnlintExtends::One(s.clone()),
            _ => BpmnlintExtends::Many(strings),
        });
    }

    if let Some(rules) = raw.get("rules") {
        let Json::Obj(rules) = rules else {
            return Err(config_error(
                ".bpmnlintrc \"rules\" must be an object of rule name → setting.",
            ));
        };
        let mut out = IndexMap::new();
        for (name, setting) in js::entries(rules) {
            parse_rule_value(name, setting)?;
            out.insert(name.clone(), setting.clone());
        }
        config.rules = Some(out);
    }

    if let Some(ext) = raw.get("moddleExtensions") {
        let map = match ext {
            Json::Obj(m) => js::entries(m)
                .into_iter()
                .map(|(k, v)| match v {
                    Json::Str(s) => Some((k.clone(), s.clone())),
                    _ => None,
                })
                .collect::<Option<IndexMap<_, _>>>(),
            // `Object.values` of an array lists its elements, keyed by index.
            Json::Arr(a) => a
                .iter()
                .enumerate()
                .map(|(i, v)| match v {
                    Json::Str(s) => Some((i.to_string(), s.clone())),
                    _ => None,
                })
                .collect(),
            _ => None,
        };
        let Some(map) = map else {
            return Err(config_error(
                ".bpmnlintrc \"moddleExtensions\" must map prefixes to module paths.",
            ));
        };
        config.moddle_extensions = Some(map);
    }

    Ok(config)
}

/// Reads one rule setting, the way bpmnlint's `Linter#parseRuleValue` does.
fn parse_rule_value(name: &str, value: &Json) -> Result<BpmnlintRuleSetting, BpmnlintConfigError> {
    let (level, options) = match value {
        Json::Arr(a) => (a.first(), a.get(1)),
        v => (Some(v), None),
    };
    let severity = match level {
        Some(Json::Str(s)) => match s.to_lowercase().as_str() {
            "off" => Some(BpmnlintSeverity::Off),
            "warn" => Some(BpmnlintSeverity::Warn),
            "error" => Some(BpmnlintSeverity::Error),
            "info" => Some(BpmnlintSeverity::Info),
            _ => None,
        },
        Some(Json::Num(n)) if n.fract() == 0.0 && (0.0..4.0).contains(n) => {
            Some(NUMERIC_SEVERITY[*n as usize])
        }
        _ => None,
    };
    let Some(severity) = severity else {
        return Err(config_error(&format!(
            ".bpmnlintrc rule \"{name}\" has setting {}; expected \"off\", \"warn\", \"error\", \"info\" (or 0–3), optionally as [level, options].",
            js::stringify(Some(value))
        )));
    };
    Ok(BpmnlintRuleSetting {
        severity,
        options: options.cloned(),
    })
}

fn unprefix_plugin(name: &str) -> &str {
    name.strip_prefix("bpmnlint-plugin-").unwrap_or(name)
}

/// Normalises a rule name the way bpmnlint does: `bpmnlint/label-required` →
/// `label-required`, `bpmnlint-plugin-foo/bar` → `foo/bar`, `@scope/bpmnlint-plugin-foo/bar`
/// → `@scope/foo/bar`.
pub fn normalize_bpmnlint_rule_name(name: &str) -> String {
    // `^(?:(?:(@[^/]+)\/)?([^@/][^/]*)\/)?([^/]+)$`
    let parts: Vec<&str> = name.split('/').collect();
    let (scope, pkg, rule) = match parts.as_slice() {
        [rule] => (None, None, *rule),
        [pkg, rule] => (None, Some(*pkg), *rule),
        [scope, pkg, rule] => (Some(*scope), Some(*pkg), *rule),
        _ => return name.to_owned(),
    };
    if rule.is_empty() {
        return name.to_owned();
    }
    if let Some(scope) = scope {
        if !scope.starts_with('@') || scope.len() < 2 {
            return name.to_owned();
        }
    }
    let Some(pkg) = pkg else {
        return rule.to_owned();
    };
    if pkg.is_empty() || pkg.starts_with('@') {
        return name.to_owned();
    }
    if pkg == "bpmnlint" {
        return rule.to_owned();
    }
    let scope = scope.map(|s| format!("{s}/")).unwrap_or_default();
    format!("{scope}{}/{rule}", unprefix_plugin(pkg))
}

/// The rules of one of bpmnlint's built-in presets (`all`, `correctness`, `recommended`).
fn preset(name: &str) -> Option<Vec<(&'static str, BpmnlintSeverity)>> {
    let rules = match name {
        "all" => spec::all_preset(),
        "correctness" => spec::correctness_preset().to_vec(),
        "recommended" => spec::recommended_preset().to_vec(),
        _ => return None,
    };
    Some(rules.into_iter().map(|(n, s)| (n, s.into())).collect())
}

/// Expands a config's `extends` and merges its rules into one effective setting per rule.
/// Later entries win, and the file's own `rules` win over everything it extends.
pub fn resolve_bpmnlint_config(
    config: &BpmnlintConfig,
) -> Result<ResolvedBpmnlintConfig, BpmnlintConfigError> {
    let mut resolved = ResolvedBpmnlintConfig::default();
    for parent in config.extends.as_ref().map_or(&[][..], |e| e.entries()) {
        let Some(rules) = parent
            .strip_prefix("bpmnlint:")
            .filter(|p| !p.is_empty())
            .and_then(preset)
        else {
            resolved.unresolved_extends.push(parent.clone());
            continue;
        };
        for (name, severity) in rules {
            resolved
                .rules
                .insert(name.to_owned(), BpmnlintRuleSetting::new(severity));
        }
    }
    if let Some(rules) = &config.rules {
        for (name, value) in js::entries(rules) {
            let setting = parse_rule_value(name, value)?;
            resolved
                .rules
                .insert(normalize_bpmnlint_rule_name(name), setting);
        }
    }
    Ok(resolved)
}

// ---------------------------------------------------------------------------
// Rule mapping
// ---------------------------------------------------------------------------

/// How faithfully BPMN Kit reproduces a bpmnlint rule.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum BpmnlintMatch {
    Exact,
    Approximate,
}

/// The BPMN Kit findings that stand in for one bpmnlint rule.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct BpmnlintRuleMapping {
    pub rule: &'static str,
    /// The finding ids that report this rule's problem.
    pub findings: &'static [&'static str],
    pub matches: BpmnlintMatch,
    /// Where the two differ, for `approximate`.
    pub note: Option<&'static str>,
    /// BPMN Kit's own findings for the same concern with different semantics: dropped
    /// while a config sets the rule, at any level.
    pub replaces: &'static [&'static str],
}

const fn exact(rule: &'static str, findings: &'static [&'static str]) -> BpmnlintRuleMapping {
    BpmnlintRuleMapping {
        rule,
        findings,
        matches: BpmnlintMatch::Exact,
        note: None,
        replaces: &[],
    }
}

/// Every bpmnlint built-in rule and the BPMN Kit findings standing in for it, in
/// `BPMNLINT_RULE_MAP`'s order.
pub static BPMNLINT_RULE_MAP: &[BpmnlintRuleMapping] = &[
    exact("ad-hoc-sub-process", &["flow/ad-hoc-start-end-event"]),
    exact("conditional-event", &["flow/conditional-event-no-condition"]),
    BpmnlintRuleMapping {
        replaces: &["feel/empty-condition"],
        ..exact("conditional-flows", &["feel/missing-condition"])
    },
    exact("end-event-required", &["flow/no-end-event", "flow/sub-process-no-end-event"]),
    exact("event-based-gateway", &["flow/event-gateway-invalid"]),
    exact("event-sub-process-typed-start-event", &["flow/event-sub-process-untyped-start"]),
    exact("fake-join", &["flow/multi-incoming-task"]),
    exact("global", &["pattern/global-element"]),
    BpmnlintRuleMapping {
        replaces: &[
            "naming/unlabeled-task",
            "naming/unlabeled-start-event",
            "naming/unlabeled-end-event",
            "naming/split-gateway-no-label",
            "naming/missing-flow-condition",
        ],
        note: Some("Lanes are read from a process's first lane set, the one BPMN Kit models."),
        ..exact("label-required", &["naming/missing-label"])
    },
    exact("link-event", &["flow/link-event-mismatch"]),
    exact("no-bpmndi", &["pattern/missing-di"]),
    exact("no-complex-gateway", &["pattern/complex-gateway"]),
    exact("no-disconnected", &["flow/disconnected"]),
    BpmnlintRuleMapping {
        note: Some("One finding per duplicate flow naming the flow, its source and its target, where bpmnlint reports the three separately."),
        ..exact("no-duplicate-sequence-flows", &["flow/duplicate-sequence-flow"])
    },
    exact("no-gateway-join-fork", &["flow/mixed-gateway"]),
    BpmnlintRuleMapping {
        replaces: &["flow/dead-end"],
        ..exact("no-implicit-end", &["flow/implicit-end"])
    },
    exact("no-implicit-split", &["flow/implicit-split"]),
    BpmnlintRuleMapping {
        replaces: &["flow/unreachable"],
        ..exact("no-implicit-start", &["flow/implicit-start"])
    },
    exact("no-inclusive-gateway", &["pattern/inclusive-gateway"]),
    exact("no-overlapping-elements", &["pattern/overlapping-elements"]),
    exact("single-blank-start-event", &["flow/multiple-blank-start-events"]),
    exact("single-event-definition", &["flow/multiple-event-definitions"]),
    exact("standard-size", &["pattern/non-standard-size"]),
    exact("start-event-required", &["flow/no-start-event", "flow/sub-process-no-start-event"]),
    exact("sub-process-blank-start-event", &["flow/sub-process-typed-start"]),
    exact("superfluous-gateway", &["flow/redundant-gateway"]),
    exact("superfluous-label", &["naming/superfluous-flow-label"]),
    exact("superfluous-termination", &["flow/superfluous-termination"]),
];

/// The mapping of a bpmnlint rule, if it is a built-in one.
pub fn bpmnlint_rule_mapping(rule: &str) -> Option<&'static BpmnlintRuleMapping> {
    BPMNLINT_RULE_MAP.iter().find(|m| m.rule == rule)
}

/// The bpmnlint rule a BPMN Kit finding stands in for, if any.
pub fn bpmnlint_rule_for_finding(finding_id: &str) -> Option<&'static str> {
    BPMNLINT_RULE_MAP
        .iter()
        .find(|m| m.findings.contains(&finding_id))
        .map(|m| m.rule)
}

fn rule_replacing_finding(finding_id: &str) -> Option<&'static str> {
    BPMNLINT_RULE_MAP
        .iter()
        .find(|m| m.replaces.contains(&finding_id))
        .map(|m| m.rule)
}

// ---------------------------------------------------------------------------
// Applying a config
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum UnsupportedReason {
    PluginRule,
    UnknownRule,
    UnresolvedExtends,
}

/// A configured rule, or `extends` entry, BPMN Kit could not honour.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct UnsupportedBpmnlintRule {
    /// The rule name, or the `extends` entry.
    pub name: String,
    pub reason: UnsupportedReason,
    /// The configured severity, for a rule.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub severity: Option<BpmnlintSeverity>,
}

#[derive(Debug, Clone, Default)]
pub struct ApplyBpmnlintOptions {
    /// Real bpmnlint ran the configured rules itself: findings mapped to a configured rule
    /// are dropped and no native equivalents run.
    pub delegated: bool,
    /// Restrict native equivalents to these categories.
    pub categories: Option<Vec<Category>>,
}

#[derive(Debug)]
pub struct BpmnlintApplication {
    pub findings: Vec<Finding>,
    pub unsupported: Vec<UnsupportedBpmnlintRule>,
}

/// Re-levels a finding under a configured rule, naming the rule.
pub(crate) fn relevel(mut finding: Finding, severity: Severity, rule: String) -> Finding {
    finding.data.severity = severity;
    finding.data.bpmnlint_rule = Some(rule);
    finding
}

/// Applies a resolved `.bpmnlintrc` to BPMN Kit findings: a finding standing in for a
/// configured rule takes its severity (or is dropped when `off`), a finding a configured
/// rule replaces is dropped, enabled native rules run, and configured rules with no
/// equivalent come back in `unsupported`.
pub fn apply_bpmnlint_config(
    definitions: &BpmnDefinitions,
    findings: Vec<Finding>,
    config: &ResolvedBpmnlintConfig,
    options: &ApplyBpmnlintOptions,
) -> BpmnlintApplication {
    let mut result = vec![];
    for finding in findings {
        if rule_replacing_finding(&finding.data.id).is_some_and(|r| config.rules.contains_key(r)) {
            continue;
        }
        let rule = bpmnlint_rule_for_finding(&finding.data.id);
        let Some((rule, setting)) = rule.and_then(|r| config.rules.get(r).map(|s| (r, s))) else {
            result.push(finding);
            continue;
        };
        if options.delegated {
            continue;
        }
        let Some(severity) = setting.severity.finding_severity() else {
            continue;
        };
        result.push(relevel(finding, severity, rule.to_owned()));
    }

    if options.delegated {
        return BpmnlintApplication {
            findings: result,
            unsupported: vec![],
        };
    }

    let mut native: IndexMap<String, Option<Json>> = IndexMap::new();
    let mut unsupported: Vec<UnsupportedBpmnlintRule> = config
        .unresolved_extends
        .iter()
        .map(|name| UnsupportedBpmnlintRule {
            name: name.clone(),
            reason: UnsupportedReason::UnresolvedExtends,
            severity: None,
        })
        .collect();
    for (rule, setting) in js::entries(&config.rules) {
        if setting.severity == BpmnlintSeverity::Off {
            continue;
        }
        if bpmnlint_rule_mapping(rule).is_none() {
            unsupported.push(UnsupportedBpmnlintRule {
                name: rule.clone(),
                reason: if rule.contains('/') {
                    UnsupportedReason::PluginRule
                } else {
                    UnsupportedReason::UnknownRule
                },
                severity: Some(setting.severity),
            });
            continue;
        }
        if NATIVE_BPMNLINT_RULES.contains(&rule.as_str()) {
            native.insert(rule.clone(), setting.options.clone());
        }
    }

    for finding in analyze_bpmnlint_rules(definitions, &native, options.categories.as_deref()) {
        let Some(rule) = bpmnlint_rule_for_finding(&finding.data.id) else {
            continue;
        };
        let Some(setting) = config.rules.get(rule) else {
            continue;
        };
        let Some(severity) = setting.severity.finding_severity() else {
            continue;
        };
        result.push(relevel(finding, severity, rule.to_owned()));
    }

    BpmnlintApplication {
        findings: result,
        unsupported,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rule_map_covers_the_spec_rules_in_order() {
        let names: Vec<&str> = BPMNLINT_RULE_MAP.iter().map(|m| m.rule).collect();
        let spec_names: Vec<&str> = spec::LINT_RULES.iter().map(|r| r.name).collect();
        let mut sorted = names.clone();
        sorted.sort();
        let mut spec_sorted = spec_names.clone();
        spec_sorted.sort();
        assert_eq!(sorted, spec_sorted);
        let ids: Vec<&str> = BPMNLINT_RULE_MAP
            .iter()
            .flat_map(|m| m.findings.iter().copied())
            .collect();
        let mut unique = ids.clone();
        unique.sort();
        unique.dedup();
        assert_eq!(unique.len(), ids.len());
        let replaced: Vec<&str> = BPMNLINT_RULE_MAP
            .iter()
            .flat_map(|m| m.replaces.iter().copied())
            .collect();
        for id in &replaced {
            assert!(!ids.contains(id), "{id}");
        }
        for m in BPMNLINT_RULE_MAP {
            if m.matches == BpmnlintMatch::Approximate {
                assert!(m.note.is_some(), "{}", m.rule);
            }
        }
    }

    #[test]
    fn normalizes_rule_names() {
        for (a, b) in [
            ("label-required", "label-required"),
            ("bpmnlint/label-required", "label-required"),
            (
                "bpmnlint-plugin-camunda-compat/timer",
                "camunda-compat/timer",
            ),
            ("camunda-compat/timer", "camunda-compat/timer"),
            ("@acme/bpmnlint-plugin-x/y", "@acme/x/y"),
            ("a/b/c", "a/b/c"),
            ("@a/@b/c", "@a/@b/c"),
            ("x/", "x/"),
            ("/x", "/x"),
        ] {
            assert_eq!(normalize_bpmnlint_rule_name(a), b, "{a}");
        }
    }

    #[test]
    fn maps_back_from_a_finding() {
        assert_eq!(
            bpmnlint_rule_for_finding("flow/mixed-gateway"),
            Some("no-gateway-join-fork")
        );
        assert_eq!(
            bpmnlint_rule_for_finding("pattern/user-task-no-timer"),
            None
        );
        assert_eq!(
            bpmnlint_rule_for_finding("flow/implicit-end"),
            Some("no-implicit-end")
        );
        assert_eq!(bpmnlint_rule_for_finding("flow/dead-end"), None);
    }
}
