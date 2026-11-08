//! Camunda 8 compatibility tables (`spec/compat-rules.json`): which constructs,
//! properties, FEEL built-ins and inbound connector properties each version
//! supports. Taken from `bpmnlint-plugin-camunda-compat` (MIT, © Camunda
//! Services GmbH); the rule logic stays in the implementations.

pub use crate::generated::compat_rules::{
    CamundaVersion, CRON_TIMER_SINCE, ELEMENT_SUPPORT, FEATURE_SINCE, FEEL_BUILTIN_SINCE,
    IMPLEMENTATION_SUPPORT, INBOUND_CONNECTOR_PROPERTY_SINCE, PLUGIN_VERSION, RULES, TIMER_SUPPORT,
};

/// The key standing for "no event definition" in an event's support map.
pub const NO_EVENT_DEFINITION: &str = "_";

/// First version supporting an element: one version, or one per event definition.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ElementSupport {
    Since(CamundaVersion),
    ByEventDefinition(&'static [(&'static str, CamundaVersion)]),
}

/// The ways Zeebe implements a task.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ImplementationKind {
    CalledDecision,
    Script,
    TaskDefinition,
}

/// First version a timer property is allowed in; `None` means never.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TimerPair {
    pub in_event_sub_process: Option<CamundaVersion>,
    pub elsewhere: Option<CamundaVersion>,
}

/// A timer property's support for interrupting and non-interrupting events.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TimerCell {
    pub interrupting: TimerPair,
    pub non_interrupting: TimerPair,
}

/// The three timer properties of one event type.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TimerEventSupport {
    pub event_type: &'static str,
    pub time_cycle: TimerCell,
    pub time_date: TimerCell,
    pub time_duration: TimerCell,
}

/// A timer property of `bpmn:TimerEventDefinition`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimerProperty {
    TimeCycle,
    TimeDate,
    TimeDuration,
}

/// A property-level feature and the version that introduced it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Feature {
    pub key: &'static str,
    pub since: CamundaVersion,
    pub description: &'static str,
}

/// An inbound connector property and the connectors (`inbound.type`) that take it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct InboundProperty {
    pub name: &'static str,
    pub since: CamundaVersion,
    pub connectors: &'static [&'static str],
}

/// The severity the plugin's configs give a rule.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RuleSeverity {
    Error,
    Warn,
}

/// Whether BPMN Kit runs a plugin rule, and how closely.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RuleCoverage {
    Implemented,
    Partial,
    Existing,
    NotImplemented,
}

/// One rule of the plugin's `camunda-cloud-*` configs.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CompatRule {
    pub name: &'static str,
    pub severity: RuleSeverity,
    /// First config that enables it; `None` for every version.
    pub since: Option<CamundaVersion>,
    /// First config that no longer enables it; `None` for still enabled.
    pub until: Option<CamundaVersion>,
    pub coverage: RuleCoverage,
    /// BPMN Kit findings outside `compat/*` that report the same problem.
    pub equivalents: &'static [&'static str],
    pub note: Option<&'static str>,
}

impl ElementSupport {
    /// The first version supporting `event_definition` (`None` for no definition);
    /// a single version applies to every definition.
    pub fn since(self, event_definition: Option<&str>) -> Option<CamundaVersion> {
        match self {
            ElementSupport::Since(v) => Some(v),
            ElementSupport::ByEventDefinition(map) => {
                let key = event_definition.unwrap_or(NO_EVENT_DEFINITION);
                map.iter().find(|(d, _)| *d == key).map(|(_, v)| *v)
            }
        }
    }
}

impl TimerCell {
    /// The first version allowed for this combination; `None` means never.
    pub fn since(self, interrupting: bool, in_event_sub_process: bool) -> Option<CamundaVersion> {
        let pair = if interrupting {
            self.interrupting
        } else {
            self.non_interrupting
        };
        if in_event_sub_process {
            pair.in_event_sub_process
        } else {
            pair.elsewhere
        }
    }
}

/// First version supporting a BPMN element type (and event definition); `None`
/// when no version does.
pub fn element_since(bpmn_type: &str, event_definition: Option<&str>) -> Option<CamundaVersion> {
    ELEMENT_SUPPORT
        .iter()
        .find(|(t, _)| *t == bpmn_type)
        .and_then(|(_, s)| s.since(event_definition))
}

/// First version `bpmn_type` accepts `kind` in.
pub fn implementation_since(
    kind: ImplementationKind,
    bpmn_type: &str,
    event_definition: Option<&str>,
) -> Option<CamundaVersion> {
    IMPLEMENTATION_SUPPORT
        .iter()
        .find(|(k, _)| *k == kind)
        .and_then(|(_, map)| map.iter().find(|(t, _)| *t == bpmn_type))
        .and_then(|(_, s)| s.since(event_definition))
}

/// First version a timer property is allowed on an event type; `None` means never.
pub fn timer_since(
    event_type: &str,
    property: TimerProperty,
    interrupting: bool,
    in_event_sub_process: bool,
) -> Option<CamundaVersion> {
    let e = TIMER_SUPPORT.iter().find(|e| e.event_type == event_type)?;
    let cell = match property {
        TimerProperty::TimeCycle => e.time_cycle,
        TimerProperty::TimeDate => e.time_date,
        TimerProperty::TimeDuration => e.time_duration,
    };
    cell.since(interrupting, in_event_sub_process)
}

/// First version a FEEL built-in is available in; `None` when every version has it.
pub fn feel_builtin_since(name: &str) -> Option<CamundaVersion> {
    FEEL_BUILTIN_SINCE
        .iter()
        .find(|(n, _)| *n == name)
        .map(|(_, v)| *v)
}

/// The feature called `key`.
pub fn feature(key: &str) -> Option<&'static Feature> {
    FEATURE_SINCE.iter().find(|f| f.key == key)
}

/// The plugin rule called `name`.
pub fn rule(name: &str) -> Option<&'static CompatRule> {
    RULES.iter().find(|r| r.name == name)
}

impl CompatRule {
    /// Whether the plugin's config for `version` enables this rule.
    pub fn enabled_in(&self, version: CamundaVersion) -> bool {
        self.since.is_none_or(|s| version >= s) && self.until.is_none_or(|u| version < u)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::spec_json;
    use serde_json::Value;

    fn v(s: &str) -> CamundaVersion {
        CamundaVersion::parse(s).unwrap_or_else(|| panic!("version {s}"))
    }

    fn opt(json: &Value) -> Option<CamundaVersion> {
        json.as_str().map(v)
    }

    fn kebab(s: &str) -> String {
        let mut out = String::new();
        for (i, c) in s.chars().enumerate() {
            if c.is_uppercase() && i > 0 {
                out.push('-');
            }
            out.extend(c.to_lowercase());
        }
        out
    }

    fn camel(s: &str) -> String {
        let mut c = s.chars();
        c.next()
            .map(|f| f.to_lowercase().chain(c).collect())
            .unwrap_or_default()
    }

    fn assert_support(json: &Value, s: &ElementSupport, what: &str) {
        match s {
            ElementSupport::Since(version) => {
                assert_eq!(json.as_str(), Some(version.as_str()), "{what}")
            }
            ElementSupport::ByEventDefinition(map) => {
                let obj = json.as_object().unwrap_or_else(|| panic!("{what}: object"));
                assert_eq!(obj.len(), map.len(), "{what}");
                for (d, version) in *map {
                    assert_eq!(obj[*d].as_str(), Some(version.as_str()), "{what} {d}");
                }
            }
        }
    }

    #[test]
    fn versions_match_spec_file() {
        let spec = spec_json("compat-rules.json");
        let json: Vec<&str> = spec["versions"]
            .as_array()
            .expect("versions")
            .iter()
            .map(|x| x.as_str().expect("version"))
            .collect();
        let ours: Vec<&str> = CamundaVersion::ALL.iter().map(|x| x.as_str()).collect();
        assert_eq!(json, ours);
        assert_eq!(spec["source"]["pluginVersion"], PLUGIN_VERSION);
        assert_eq!(opt(&spec["cronTimerSince"]), Some(CRON_TIMER_SINCE));
        assert!(CamundaVersion::ALL.windows(2).all(|w| w[0] < w[1]));
        assert_eq!(CamundaVersion::parse("9.0"), None);
    }

    #[test]
    fn element_and_implementation_support_match_spec_file() {
        let spec = spec_json("compat-rules.json");
        let elements = spec["elementSupport"].as_object().expect("elements");
        assert_eq!(elements.len(), ELEMENT_SUPPORT.len());
        for (t, s) in ELEMENT_SUPPORT {
            assert_support(&elements[*t], s, t);
        }
        let kinds = spec["implementationSupport"].as_object().expect("kinds");
        assert_eq!(kinds.len(), IMPLEMENTATION_SUPPORT.len());
        for (kind, map) in IMPLEMENTATION_SUPPORT {
            let json = kinds[&camel(&format!("{kind:?}"))]
                .as_object()
                .expect("kind");
            assert_eq!(json.len(), map.len());
            for (t, s) in *map {
                assert_support(&json[*t], s, t);
            }
        }
    }

    #[test]
    fn timer_support_matches_spec_file() {
        let spec = spec_json("compat-rules.json");
        let timers = spec["timerSupport"].as_object().expect("timers");
        assert_eq!(timers.len(), TIMER_SUPPORT.len());
        for e in TIMER_SUPPORT {
            for (name, cell) in [
                ("timeCycle", e.time_cycle),
                ("timeDate", e.time_date),
                ("timeDuration", e.time_duration),
            ] {
                let json = &timers[e.event_type][name];
                for (interrupting, key) in [(true, "interrupting"), (false, "nonInterrupting")] {
                    assert_eq!(
                        cell.since(interrupting, true),
                        opt(&json[key]["inEventSubProcess"]),
                        "{} {name} {key}",
                        e.event_type
                    );
                    assert_eq!(
                        cell.since(interrupting, false),
                        opt(&json[key]["elsewhere"]),
                        "{} {name} {key}",
                        e.event_type
                    );
                }
            }
        }
    }

    #[test]
    fn features_feel_and_inbound_match_spec_file() {
        let spec = spec_json("compat-rules.json");
        let features = spec["featureSince"].as_object().expect("features");
        assert_eq!(features.len(), FEATURE_SINCE.len());
        for f in FEATURE_SINCE {
            assert_eq!(features[f.key]["since"], f.since.as_str());
            assert_eq!(features[f.key]["description"], f.description);
        }
        let feel = spec["feelBuiltinSince"].as_object().expect("feel");
        assert_eq!(feel.len(), FEEL_BUILTIN_SINCE.len());
        for (n, version) in FEEL_BUILTIN_SINCE {
            assert_eq!(feel[*n], version.as_str());
        }
        let inbound = spec["inboundConnectorPropertySince"]
            .as_object()
            .expect("inbound");
        assert_eq!(inbound.len(), INBOUND_CONNECTOR_PROPERTY_SINCE.len());
        for p in INBOUND_CONNECTOR_PROPERTY_SINCE {
            assert_eq!(inbound[p.name]["since"], p.since.as_str());
            let json: Vec<&str> = inbound[p.name]["connectors"]
                .as_array()
                .expect("connectors")
                .iter()
                .map(|c| c.as_str().expect("connector"))
                .collect();
            assert_eq!(json, p.connectors, "{}", p.name);
        }
    }

    #[test]
    fn rules_match_spec_file() {
        let spec = spec_json("compat-rules.json");
        let rules = spec["rules"].as_object().expect("rules");
        assert_eq!(rules.len(), RULES.len());
        for r in RULES {
            let json = &rules[r.name];
            assert_eq!(
                json["severity"].as_str(),
                Some(kebab(&format!("{:?}", r.severity)).as_str())
            );
            assert_eq!(opt(&json["since"]), r.since, "{}", r.name);
            assert_eq!(opt(&json["until"]), r.until, "{}", r.name);
            assert_eq!(
                json["coverage"].as_str(),
                Some(kebab(&format!("{:?}", r.coverage)).as_str())
            );
            let eq: Vec<&str> = json["equivalents"]
                .as_array()
                .map(|a| a.iter().map(|x| x.as_str().expect("equivalent")).collect())
                .unwrap_or_default();
            assert_eq!(eq, r.equivalents, "{}", r.name);
            assert_eq!(json["note"].as_str(), r.note, "{}", r.name);
        }
    }

    #[test]
    fn lookups() {
        let signal = "bpmn:SignalEventDefinition";
        assert_eq!(element_since("bpmn:ServiceTask", None), Some(v("1.0")));
        assert_eq!(
            element_since("bpmn:StartEvent", Some(signal)),
            Some(v("8.2"))
        );
        assert_eq!(element_since("bpmn:StartEvent", None), Some(v("1.0")));
        assert_eq!(element_since("bpmn:ComplexGateway", None), None);
        assert_eq!(
            implementation_since(ImplementationKind::Script, "bpmn:ScriptTask", None),
            Some(v("8.2"))
        );
        assert_eq!(
            timer_since("bpmn:StartEvent", TimerProperty::TimeCycle, true, true),
            None
        );
        assert_eq!(
            timer_since("bpmn:BoundaryEvent", TimerProperty::TimeCycle, false, false),
            Some(v("1.0"))
        );
        assert_eq!(feel_builtin_since("uuid"), Some(v("8.6")));
        assert_eq!(feel_builtin_since("abs"), None);
        assert_eq!(feature("businessId").map(|f| f.since), Some(v("8.10")));
        assert!(v("8.9") < v("8.10"));
    }

    #[test]
    fn rule_enabled_range() {
        let r = rule("inclusive-gateway").expect("rule");
        assert!(!r.enabled_in(v("8.0")));
        assert!(r.enabled_in(v("8.1")));
        assert!(r.enabled_in(v("8.5")));
        assert!(!r.enabled_in(v("8.6")));
        assert!(rule("element-type").expect("rule").enabled_in(v("1.0")));
    }
}
