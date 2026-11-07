//! The `.bpmnlintrc` side of the Camunda 8 compatibility check (`splitCamundaCompatConfig`,
//! `applyCamundaCompatConfig` in `@bpmnkit/core`'s `camunda-compat.ts`): BPMN Kit's own check
//! stands in for `bpmnlint-plugin-camunda-compat`.

use crate::bpmnlint::{
    relevel, BpmnlintRuleSetting, BpmnlintSeverity, ResolvedBpmnlintConfig,
    UnsupportedBpmnlintRule, UnsupportedReason,
};
use crate::js;
use crate::Finding;
use bpmnkit_spec::compat::{CamundaVersion, CompatRule, RuleCoverage, RuleSeverity, RULES};
use indexmap::IndexMap;

const PLUGIN_NAMES: &[&str] = &["camunda-compat", "bpmnlint-plugin-camunda-compat"];
const RULE_PREFIX: &str = "camunda-compat/";

/// A `.bpmnlintrc`'s camunda-compat part.
#[derive(Debug, Clone, PartialEq)]
pub struct CamundaCompatConfig {
    /// The version a `plugin:camunda-compat/camunda-cloud-X-Y` extends pins, if any.
    pub version: Option<CamundaVersion>,
    /// Plugin rule name (without `camunda-compat/`) → its effective setting.
    pub rules: IndexMap<String, BpmnlintRuleSetting>,
}

/// [`split_camunda_compat_config`]'s result.
#[derive(Debug, Clone, PartialEq)]
pub struct SplitCompatConfig {
    /// Set when the file mentions the plugin at all.
    pub compat: Option<CamundaCompatConfig>,
    /// Everything else, for `apply_bpmnlint_config`.
    pub rest: ResolvedBpmnlintConfig,
}

fn compat_rule(name: &str) -> Option<&'static CompatRule> {
    RULES.iter().find(|r| r.name == name)
}

/// `normalizeCamundaVersion`: `8.6.0` → 8.6; a minor newer than the newest known 8.x is the
/// newest.
fn normalize_version(raw: &str) -> Option<CamundaVersion> {
    let s = raw.trim_start_matches(|c: char| c.is_whitespace());
    let digits = |s: &str| s.bytes().take_while(u8::is_ascii_digit).count();
    let n = digits(s);
    let rest = s[n..].strip_prefix('.')?;
    let m = digits(rest);
    if n == 0 || m == 0 {
        return None;
    }
    let major: f64 = s[..n].parse().ok()?;
    let minor: f64 = rest[..m].parse().ok()?;
    let text = format!(
        "{}.{}",
        js::number_to_string(major),
        js::number_to_string(minor)
    );
    if let Some(v) = CamundaVersion::parse(&text) {
        return Some(v);
    }
    let newest = *CamundaVersion::ALL.last()?;
    let newest_minor: f64 = newest.as_str().split('.').nth(1)?.parse().ok()?;
    (major == 8.0 && minor > newest_minor).then_some(newest)
}

fn rule_active(rule: &CompatRule, version: CamundaVersion) -> bool {
    rule.since.is_none_or(|s| version >= s) && rule.until.is_none_or(|u| version < u)
}

fn plugin_severity(s: RuleSeverity) -> BpmnlintSeverity {
    match s {
        RuleSeverity::Error => BpmnlintSeverity::Error,
        RuleSeverity::Warn => BpmnlintSeverity::Warn,
    }
}

/// Takes the `bpmnlint-plugin-camunda-compat` part out of a resolved `.bpmnlintrc`.
///
/// - `extends: "plugin:camunda-compat/camunda-cloud-8-6"` pins the target to 8.6 and enables
///   that config's rules at the plugin's severities; the last such entry wins. It also
///   enables `start-event-required`, as the plugin's configs do.
/// - `camunda-compat/<rule>` entries under `rules` override those severities.
pub fn split_camunda_compat_config(config: &ResolvedBpmnlintConfig) -> SplitCompatConfig {
    let mut version = None;
    let mut mentioned = false;
    let mut unresolved_extends = vec![];
    for entry in &config.unresolved_extends {
        let found = parse_plugin_extends(entry).and_then(|(plugin, major, minor)| {
            PLUGIN_NAMES
                .contains(&plugin)
                .then(|| normalize_version(&format!("{major}.{minor}")))
                .flatten()
        });
        match found {
            Some(v) => {
                version = Some(v);
                mentioned = true;
            }
            None => unresolved_extends.push(entry.clone()),
        }
    }

    let mut compat_rules: IndexMap<String, BpmnlintRuleSetting> = IndexMap::new();
    if let Some(v) = version {
        for rule in RULES.iter().filter(|r| rule_active(r, v)) {
            compat_rules.insert(
                rule.name.to_owned(),
                BpmnlintRuleSetting::new(plugin_severity(rule.severity)),
            );
        }
    }
    let mut rules = IndexMap::new();
    for (name, setting) in js::entries(&config.rules) {
        if let Some(rule) = name.strip_prefix(RULE_PREFIX) {
            compat_rules.insert(rule.to_owned(), setting.clone());
            mentioned = true;
        } else {
            rules.insert(name.clone(), setting.clone());
        }
    }
    if version.is_some() && !rules.contains_key("start-event-required") {
        rules.insert(
            "start-event-required".to_owned(),
            BpmnlintRuleSetting::new(BpmnlintSeverity::Error),
        );
    }

    if !mentioned {
        return SplitCompatConfig {
            compat: None,
            rest: config.clone(),
        };
    }
    SplitCompatConfig {
        compat: Some(CamundaCompatConfig {
            version,
            rules: compat_rules,
        }),
        rest: ResolvedBpmnlintConfig {
            rules,
            unresolved_extends,
        },
    }
}

/// `^plugin:([^/]+)\/camunda-cloud-(\d+)-(\d+)$`.
fn parse_plugin_extends(entry: &str) -> Option<(&str, &str, &str)> {
    let rest = entry.strip_prefix("plugin:")?;
    let (plugin, config) = rest.split_once('/')?;
    if plugin.is_empty() {
        return None;
    }
    let (major, minor) = config.strip_prefix("camunda-cloud-")?.split_once('-')?;
    let all_digits = |s: &str| !s.is_empty() && s.bytes().all(|b| b.is_ascii_digit());
    (all_digits(major) && all_digits(minor)).then_some((plugin, major, minor))
}

/// [`apply_camunda_compat_config`]'s result.
#[derive(Debug)]
pub struct CompatApplication {
    pub findings: Vec<Finding>,
    pub unsupported: Vec<UnsupportedBpmnlintRule>,
}

/// Applies the camunda-compat part of a `.bpmnlintrc`: a finding a configured plugin rule
/// governs (its `compat/<rule>` findings and their `equivalents`) takes the rule's severity
/// and name, or is dropped when the rule is `off` or `delegated`. Configured rules BPMN Kit
/// does not check come back as `unsupported`.
pub fn apply_camunda_compat_config(
    findings: Vec<Finding>,
    compat: &CamundaCompatConfig,
    delegated: bool,
) -> CompatApplication {
    let mut governing: IndexMap<String, &str> = IndexMap::new();
    for rule in compat.rules.keys() {
        governing.insert(format!("compat/{rule}"), rule);
        for id in compat_rule(rule).map_or(&[][..], |r| r.equivalents) {
            governing.insert((*id).to_owned(), rule);
        }
    }

    let mut result = vec![];
    for finding in findings {
        let Some(rule) = governing.get(&finding.data.id).copied() else {
            result.push(finding);
            continue;
        };
        let Some(setting) = compat.rules.get(rule) else {
            result.push(finding);
            continue;
        };
        if delegated {
            continue;
        }
        let Some(severity) = setting.severity.finding_severity() else {
            continue;
        };
        result.push(relevel(finding, severity, format!("{RULE_PREFIX}{rule}")));
    }

    let unsupported = if delegated {
        vec![]
    } else {
        js::entries(&compat.rules)
            .into_iter()
            .filter(|(rule, setting)| {
                setting.severity != BpmnlintSeverity::Off
                    && compat_rule(rule).is_none_or(|r| r.coverage == RuleCoverage::NotImplemented)
            })
            .map(|(rule, setting)| UnsupportedBpmnlintRule {
                name: format!("{RULE_PREFIX}{rule}"),
                reason: UnsupportedReason::PluginRule,
                severity: Some(setting.severity),
            })
            .collect()
    };
    CompatApplication {
        findings: result,
        unsupported,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn versions_normalize_as_in_ts() {
        assert_eq!(normalize_version("8.6"), Some(CamundaVersion::V8_6));
        assert_eq!(normalize_version(" 8.06.1"), Some(CamundaVersion::V8_6));
        assert_eq!(
            normalize_version("8.99"),
            CamundaVersion::ALL.last().copied()
        );
        assert_eq!(normalize_version("9.1"), None);
        assert_eq!(normalize_version("8"), None);
    }

    #[test]
    fn plugin_extends() {
        assert_eq!(
            parse_plugin_extends("plugin:camunda-compat/camunda-cloud-8-6"),
            Some(("camunda-compat", "8", "6"))
        );
        assert_eq!(
            parse_plugin_extends("plugin:camunda-compat/recommended"),
            None
        );
        assert_eq!(parse_plugin_extends("plugin:a/b/camunda-cloud-8-6"), None);
    }
}
