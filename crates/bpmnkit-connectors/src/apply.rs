//! Resolving a template and a set of values into the bindings its active properties write:
//! port of `apply.ts`'s `resolveValues` / `resolveBindings` (the half independent of where the
//! result goes).

use crate::jsval::{js_string, truthy_opt};
use crate::template::{property_key, Condition, ElementTemplate, TemplateProperty};
use bpmnkit_feel::ParseOptions;
use indexmap::IndexMap;
use serde::Serialize;
use std::collections::{HashMap, HashSet};

/// What kind of problem, where it matters to callers.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProblemKind {
    /// A required field has no value.
    MissingRequired,
    /// A `values` key the template has no property for.
    UnknownKey,
    /// A FEEL value that does not parse.
    InvalidFeel,
    /// A template with no resolvable task type.
    NoTaskType,
    /// An error Zeebe would raise on deploy for the applied element.
    NotDeployable,
}

/// `ApplyProblem`: a non-empty list means the template was not fully applied.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Problem {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kind: Option<ProblemKind>,
    pub message: String,
}

impl Problem {
    pub(crate) fn keyed(key: &str, message: impl Into<String>) -> Self {
        Self {
            key: Some(key.to_owned()),
            kind: None,
            message: message.into(),
        }
    }

    pub(crate) fn msg(message: impl Into<String>) -> Self {
        Self {
            key: None,
            kind: None,
            message: message.into(),
        }
    }
}

type Strs = IndexMap<String, String>;

/// Everything a template's active properties resolve to, before it is written anywhere.
#[derive(Default)]
pub(crate) struct Accumulator {
    pub inputs: Vec<(String, String)>,
    pub outputs: Vec<(String, String)>,
    pub task_headers: Strs,
    pub zeebe_properties: Vec<(String, String)>,
    pub task_type: Option<String>,
    pub retries: Option<String>,
    pub ad_hoc: Strs,
    pub agent_type: Option<String>,
    pub message: Strs,
    pub subscription: Strs,
    pub linked_resources: IndexMap<String, Strs>,
    pub user_task: bool,
    pub task_extensions: IndexMap<String, Strs>,
}

const RESOURCE_BINDING_TYPES: [&str; 3] = ["latest", "deployment", "versionTag"];
const TASK_EXTENSION_BINDINGS: [&str; 7] = [
    "zeebe:calledElement",
    "zeebe:calledDecision",
    "zeebe:formDefinition",
    "zeebe:assignmentDefinition",
    "zeebe:taskSchedule",
    "zeebe:priorityDefinition",
    "zeebe:script",
];

fn eval_condition(cond: &Condition, values: &HashMap<String, String>) -> bool {
    if let Some(all) = &cond.all_match {
        return all.iter().all(|c| eval_condition(c, values));
    }
    let value = cond.property.as_ref().and_then(|p| values.get(p));
    if let Some(eq) = &cond.equals {
        return value.map(String::as_str) == Some(js_string(Some(eq)).as_str());
    }
    if let Some(one_of) = &cond.one_of {
        let v = value.map_or("", String::as_str);
        return one_of.iter().any(|o| o == v);
    }
    if let Some(active) = cond.is_active {
        return value.is_some_and(|v| !v.is_empty()) == active;
    }
    if let Some(empty) = cond.is_empty {
        return value.is_none_or(String::is_empty) == empty;
    }
    true
}

fn default_value_of(prop: &TemplateProperty) -> Option<String> {
    prop.value.as_ref().map(|v| js_string(Some(v)))
}

/// The effective value of every active property: user override, else template default. Only an
/// active property has a value, so a dropdown hidden by its own condition does not keep its
/// default; conditions can chain, so this repeats until nothing changes.
pub(crate) fn resolve_values(template: &ElementTemplate, values: &Strs) -> HashMap<String, String> {
    let mut resolved: HashMap<String, String> = HashMap::new();
    for _ in 0..=template.properties.len() {
        let mut next: HashMap<String, String> = HashMap::new();
        for prop in &template.properties {
            let key = property_key(prop);
            if key.is_empty() || next.contains_key(&key) {
                continue;
            }
            if prop
                .condition
                .as_ref()
                .is_some_and(|c| !eval_condition(c, &resolved))
            {
                continue;
            }
            if let Some(v) = values.get(&key).cloned().or_else(|| default_value_of(prop)) {
                next.insert(key, v);
            }
        }
        if next == resolved {
            return next;
        }
        resolved = next;
    }
    resolved
}

fn apply_binding(prop: &TemplateProperty, value: String, accum: &mut Accumulator) {
    let b = &prop.binding;
    let name = || b.name.clone().unwrap_or_else(|| "undefined".into());
    let property = || b.property.clone().unwrap_or_else(|| "undefined".into());
    match b.kind.as_str() {
        "zeebe:input" => accum.inputs.push((value, name())),
        // `source` is the template's fixed FEEL read expression; `value` the variable to write it to.
        "zeebe:output" => accum.outputs.push((
            b.source.clone().unwrap_or_else(|| "undefined".into()),
            value,
        )),
        "zeebe:taskHeader" => {
            accum
                .task_headers
                .insert(b.key.clone().unwrap_or_else(|| "undefined".into()), value);
        }
        "zeebe:taskDefinition" => {
            if b.property.as_deref() == Some("type") {
                accum.task_type = Some(value);
            } else {
                accum.retries = Some(value);
            }
        }
        "zeebe:taskDefinition:type" => accum.task_type = Some(value),
        "zeebe:property" => accum.zeebe_properties.push((name(), value)),
        "zeebe:adHoc" => {
            accum.ad_hoc.insert(property(), value);
        }
        "zeebe:agentDefinition" => {
            if b.property.as_deref() == Some("agentType") {
                accum.agent_type = Some(value);
            }
        }
        kind if TASK_EXTENSION_BINDINGS.contains(&kind) => {
            accum
                .task_extensions
                .entry(kind.to_owned())
                .or_default()
                .insert(property(), value);
        }
        "bpmn:Message#property" => {
            accum.message.insert(name(), value);
        }
        "bpmn:Message#zeebe:subscription#property" => {
            accum.subscription.insert(name(), value);
        }
        "zeebe:linkedResource" => {
            accum
                .linked_resources
                .entry(b.link_name.clone().unwrap_or_else(|| "undefined".into()))
                .or_default()
                .insert(property(), value);
        }
        _ => {}
    }
}

/// An extension whose required attribute resolved to nothing is not written; say so.
fn incomplete_task_extensions(accum: &Accumulator) -> Vec<Problem> {
    let required: [(&str, &[&str]); 4] = [
        ("zeebe:calledElement", &["processId"]),
        ("zeebe:calledDecision", &["decisionId", "resultVariable"]),
        ("zeebe:script", &["expression"]),
        ("zeebe:priorityDefinition", &["priority"]),
    ];
    let mut problems = vec![];
    for (ty, names) in required {
        let Some(written) = accum.task_extensions.get(ty) else {
            continue;
        };
        let missing: Vec<&str> = names
            .iter()
            .copied()
            .filter(|n| !written.contains_key(*n))
            .collect();
        if !missing.is_empty() {
            problems.push(Problem::msg(format!(
                "<{ty}> needs {}; it was not written",
                missing.join(", ")
            )));
        }
    }
    if let Some(form) = accum.task_extensions.get("zeebe:formDefinition") {
        let (ext, id) = (form.get("externalReference"), form.get("formId"));
        if ext.is_some() && id.is_some() {
            problems.push(Problem::msg(
                "<zeebe:formDefinition> has both formId and externalReference; only externalReference was written",
            ));
        }
        if id.is_none() && ext.is_none() {
            problems.push(Problem::msg(
                "<zeebe:formDefinition> needs formId or externalReference; it was not written",
            ));
        }
    }
    problems
}

/// What `omit_defaults` and the other apply options change.
#[derive(Debug, Clone, Copy, Default)]
pub struct ApplyOptions {
    /// Leave out properties that would only carry the template's default, so the element holds
    /// what the caller chose. Hidden and required properties are always written.
    pub omit_defaults: bool,
}

pub(crate) fn resolve_bindings(
    template: &ElementTemplate,
    values: &Strs,
    generate: &mut dyn FnMut(&str, &TemplateProperty) -> Option<String>,
    options: ApplyOptions,
) -> (Accumulator, Vec<Problem>) {
    let resolved = resolve_values(template, values);
    let mut problems = vec![];

    let known: HashSet<String> = template
        .properties
        .iter()
        .map(property_key)
        .filter(|k| !k.is_empty())
        .collect();
    for (key, _) in bpmnkit_bpmn::js::object_entries(values) {
        if key != "name" && !known.contains(key) {
            problems.push(Problem {
                key: Some(key.clone()),
                kind: Some(ProblemKind::UnknownKey),
                message: format!(
                    "Unknown value key \"{key}\" for template \"{}\"",
                    template.id
                ),
            });
        }
    }

    let mut accum = Accumulator::default();
    for prop in &template.properties {
        let key = property_key(prop);
        if prop
            .condition
            .as_ref()
            .is_some_and(|c| !eval_condition(c, &resolved))
        {
            continue;
        }
        let not_empty = prop
            .constraints
            .as_ref()
            .and_then(|c| c.not_empty)
            .unwrap_or(false);
        if options.omit_defaults
            && !values.contains_key(&key)
            && prop.kind != "Hidden"
            && !not_empty
            && !truthy_opt(prop.generated_value.as_ref())
        {
            continue;
        }

        // A flag binding has no value of its own: the property being active is the signal.
        if prop.binding.kind == "zeebe:userTask" {
            if resolved.get(&key).map(String::as_str) != Some("false") {
                accum.user_task = true;
            }
            continue;
        }

        let mut value = resolved.get(&key).cloned();
        if value.as_deref().is_none_or(str::is_empty) && truthy_opt(prop.generated_value.as_ref()) {
            value = generate(&key, prop);
        }
        let Some(value) = value.filter(|v| !v.is_empty()) else {
            if prop.kind != "Hidden" && not_empty {
                problems.push(Problem {
                    key: Some(key.clone()),
                    kind: Some(ProblemKind::MissingRequired),
                    message: format!(
                        "Missing required value for \"{}\" ({key})",
                        prop.label.as_deref().unwrap_or(&key)
                    ),
                });
            }
            continue;
        };

        if matches!(prop.feel.as_deref(), Some("required" | "optional")) {
            if let Some(expr) = value.strip_prefix('=') {
                for err in bpmnkit_feel::parse_partial(expr, &ParseOptions::default()).errors {
                    problems.push(Problem {
                        key: Some(key.clone()),
                        kind: Some(ProblemKind::InvalidFeel),
                        message: format!("Invalid FEEL expression for \"{key}\": {}", err.message),
                    });
                }
            }
        }

        let property = prop.binding.property.as_deref();
        if property == Some("bindingType") && !RESOURCE_BINDING_TYPES.contains(&value.as_str()) {
            problems.push(Problem::keyed(
                &key,
                format!(
                "Invalid bindingType \"{value}\" for \"{key}\": expected one of {}; it was not written",
                RESOURCE_BINDING_TYPES.join(", ")
            ),
            ));
            continue;
        }
        if matches!(
            property,
            Some("propagateAllParentVariables" | "propagateAllChildVariables")
        ) && value != "true"
            && value != "false"
        {
            problems.push(Problem::keyed(
                &key,
                format!(
                "Invalid value \"{value}\" for \"{key}\": expected true or false; it was not written"
            ),
            ));
            continue;
        }

        apply_binding(prop, value, &mut accum);
    }

    problems.extend(incomplete_task_extensions(&accum));
    (accum, problems)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn template(props: &str) -> ElementTemplate {
        ElementTemplate::from_json(&format!(
            r#"{{"id":"t","appliesTo":[],"properties":[{props}]}}"#
        ))
        .unwrap()
    }

    fn vals(pairs: &[(&str, &str)]) -> Strs {
        pairs
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect()
    }

    #[test]
    fn a_hidden_dropdown_does_not_switch_on_its_dependants() {
        let t = template(
            r#"{"id":"mode","type":"Dropdown","value":"x","condition":{"property":"gate","equals":"on"},"binding":{"type":"zeebe:input","name":"mode"}},
               {"id":"dep","type":"String","value":"d","condition":{"property":"mode","equals":"x"},"binding":{"type":"zeebe:input","name":"dep"}},
               {"id":"gate","type":"String","value":"off","binding":{"type":"zeebe:input","name":"gate"}}"#,
        );
        let off = resolve_values(&t, &Strs::new());
        assert_eq!(off.get("gate").map(String::as_str), Some("off"));
        assert!(!off.contains_key("mode") && !off.contains_key("dep"));
        let on = resolve_values(&t, &vals(&[("gate", "on")]));
        assert_eq!(on.get("dep").map(String::as_str), Some("d"));
    }

    #[test]
    fn conditions_cover_every_operator() {
        let v: HashMap<String, String> = [
            ("a".to_owned(), "1".to_owned()),
            ("e".to_owned(), String::new()),
        ]
        .into();
        let c = |j: &str| eval_condition(&serde_json::from_str(j).unwrap(), &v);
        assert!(c(r#"{"property":"a","equals":1}"#));
        assert!(c(r#"{"property":"a","oneOf":["2","1"]}"#));
        assert!(c(r#"{"property":"a","isActive":true}"#));
        assert!(c(r#"{"property":"e","isActive":false}"#));
        assert!(c(r#"{"property":"missing","isEmpty":true}"#));
        assert!(!c(
            r#"{"allMatch":[{"property":"a","equals":"1"},{"property":"e","isActive":true}]}"#
        ));
        assert!(c(r#"{"property":"a"}"#));
    }

    #[test]
    fn problems_for_unknown_keys_missing_values_and_bad_feel() {
        let t = template(
            r#"{"id":"r","label":"R","type":"String","constraints":{"notEmpty":true},"binding":{"type":"zeebe:input","name":"r"}},
               {"id":"f","type":"String","feel":"optional","value":"=1 +","binding":{"type":"zeebe:input","name":"f"}}"#,
        );
        let (accum, problems) = resolve_bindings(
            &t,
            &vals(&[("zz", "1")]),
            &mut |_, _| None,
            ApplyOptions::default(),
        );
        let kinds: Vec<_> = problems.iter().map(|p| p.kind).collect();
        assert_eq!(
            kinds,
            [
                Some(ProblemKind::UnknownKey),
                Some(ProblemKind::MissingRequired),
                Some(ProblemKind::InvalidFeel)
            ]
        );
        assert_eq!(accum.inputs.len(), 1);
    }

    #[test]
    fn omit_defaults_keeps_hidden_required_and_given_values() {
        let t = template(
            r#"{"id":"h","type":"Hidden","value":"1","binding":{"type":"zeebe:input","name":"h"}},
               {"id":"d","type":"String","value":"2","binding":{"type":"zeebe:input","name":"d"}},
               {"id":"g","type":"String","value":"3","binding":{"type":"zeebe:input","name":"g"}}"#,
        );
        let (accum, _) = resolve_bindings(
            &t,
            &vals(&[("g", "x")]),
            &mut |_, _| None,
            ApplyOptions {
                omit_defaults: true,
            },
        );
        let targets: Vec<&str> = accum.inputs.iter().map(|(_, t)| t.as_str()).collect();
        assert_eq!(targets, ["h", "g"]);
    }

    #[test]
    fn user_task_flag_and_generated_values() {
        let t = template(
            r#"{"type":"Hidden","binding":{"type":"zeebe:userTask"}},
               {"id":"m","type":"Hidden","generatedValue":{"type":"uuid"},"binding":{"type":"bpmn:Message#property","name":"name"}}"#,
        );
        let (accum, problems) = resolve_bindings(
            &t,
            &Strs::new(),
            &mut |k, _| Some(format!("gen-{k}")),
            ApplyOptions::default(),
        );
        assert!(accum.user_task && problems.is_empty());
        assert_eq!(accum.message.get("name").map(String::as_str), Some("gen-m"));
    }
}
