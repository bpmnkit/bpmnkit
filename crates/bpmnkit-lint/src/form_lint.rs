//! `lintForm` from `@bpmnkit/core`'s `form/lint.ts`: what Zeebe deploys without complaint
//! but Tasklist then fails on, read from the raw JSON so every problem is reported.

use crate::check_finding::{CheckFinding, CheckSeverity};
use crate::js;
use bpmnkit_form::Json;
use bpmnkit_spec::elements::{FormTrait, FORM_ELEMENTS};
use indexmap::IndexMap;

type Obj = IndexMap<String, Json>;

/// Properties that are not expressions even though a value may happen to start with `=`.
const NON_FEEL_KEYS: &[&str] = &["components", "id", "type", "key", "path", "values"];

fn known_types() -> impl Iterator<Item = &'static str> {
    FORM_ELEMENTS.elements.iter().map(|e| e.name)
}

fn has_trait(ty: &str, t: FormTrait) -> bool {
    FORM_ELEMENTS
        .elements
        .iter()
        .any(|e| e.name == ty && e.traits.contains(&t))
}

fn known_list() -> String {
    known_types().collect::<Vec<_>>().join(", ")
}

/// `^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$`.
fn valid_key(key: &str) -> bool {
    key.split('.').all(|part| {
        let mut chars = part.chars();
        chars
            .next()
            .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
            && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
    })
}

struct Walk {
    findings: Vec<CheckFinding>,
    ids: IndexMap<String, String>,
    /// Keys bound so far, per data scope (`""` is the form's root).
    keys: IndexMap<String, Vec<String>>,
}

impl Walk {
    fn push(
        &mut self,
        rule: &str,
        severity: CheckSeverity,
        element_id: Option<&str>,
        message: String,
        fix: impl Into<String>,
    ) {
        self.findings.push(CheckFinding {
            rule: rule.into(),
            severity,
            element_id: element_id.map(str::to_owned),
            message,
            fix: fix.into(),
        });
    }
}

fn single(rule: &str, message: String, fix: &str) -> Vec<CheckFinding> {
    vec![CheckFinding {
        rule: rule.into(),
        severity: CheckSeverity::Error,
        element_id: None,
        message,
        fix: fix.into(),
    }]
}

/// Checks a Camunda form (form-js JSON schema) for invalid schema shape, duplicate
/// component ids or keys, input fields bound to no variable, and FEEL that does not parse.
pub fn lint_form(json: &str) -> Vec<CheckFinding> {
    let root = match js::parse_json(json) {
        Ok(v) => v,
        Err(e) => {
            return single(
                "form/invalid-json",
                format!("The form is not valid JSON: {e}"),
                "Fix the JSON syntax (trailing commas, unquoted keys and single quotes are not allowed).",
            )
        }
    };
    let Json::Obj(root) = root else {
        return single(
            "form/invalid-schema",
            "The form's top level is not a JSON object.".into(),
            "Write the form as { \"id\": \"…\", \"type\": \"default\", \"components\": [ … ] }.",
        );
    };

    let mut w = Walk {
        findings: vec![],
        ids: IndexMap::new(),
        keys: IndexMap::new(),
    };
    let root_id = match root.get("id") {
        Some(Json::Str(s)) => Some(s.as_str()),
        _ => None,
    };
    if root_id.is_none_or(str::is_empty) {
        w.push(
            "form/missing-id",
            CheckSeverity::Error,
            None,
            "The form has no id.".into(),
            "Add a top-level \"id\" — a user task links the form by it (zeebe:formDefinition formId).",
        );
    }
    if root.get("type") != Some(&Json::Str("default".into())) {
        w.push(
            "form/invalid-schema",
            CheckSeverity::Error,
            None,
            format!(
                "The form's top-level \"type\" is {}, not \"default\".",
                js::stringify(root.get("type"))
            ),
            "Set \"type\": \"default\".",
        );
    }
    if let Some(sv) = root.get("schemaVersion") {
        if !matches!(sv, Json::Num(_)) {
            w.push(
                "form/invalid-schema",
                CheckSeverity::Warning,
                None,
                format!(
                    "\"schemaVersion\" is {}, not a number.",
                    js::stringify(Some(sv))
                ),
                "Set \"schemaVersion\" to a number, e.g. 16, or remove it.",
            );
        }
    }
    let Some(Json::Arr(components)) = root.get("components") else {
        w.push(
            "form/invalid-schema",
            CheckSeverity::Error,
            None,
            "The form has no \"components\" array.".into(),
            "Add \"components\": [ … ] with the form's fields.",
        );
        return w.findings;
    };

    if let Some(id) = root_id {
        w.ids.insert(id.to_owned(), "the form".into());
    }
    walk_components(components, "", "components", &mut w);
    w.findings
}

fn walk_components(components: &[Json], scope: &str, path: &str, w: &mut Walk) {
    for (index, component) in components.iter().enumerate() {
        let at = format!("{path}[{index}]");
        let Json::Obj(c) = component else {
            w.push(
                "form/invalid-schema",
                CheckSeverity::Error,
                None,
                format!("{at} is not an object."),
                "Write each component as { \"id\": \"…\", \"type\": \"…\", … }.",
            );
            continue;
        };
        check_component(c, scope, &at, w);
    }
}

fn str_prop<'a>(c: &'a Obj, key: &str) -> Option<&'a str> {
    match c.get(key) {
        Some(Json::Str(s)) => Some(s),
        _ => None,
    }
}

fn check_component(c: &Obj, scope: &str, at: &str, w: &mut Walk) {
    let id = str_prop(c, "id").filter(|s| !s.is_empty());
    let label = match id {
        Some(id) => format!("Component \"{id}\""),
        None => at.to_owned(),
    };
    let ty = str_prop(c, "type");

    match ty {
        None => w.push(
            "form/invalid-schema",
            CheckSeverity::Error,
            id,
            format!("{label} has no \"type\"."),
            format!("Set \"type\" to one of {}.", known_list()),
        ),
        Some(t) if !known_types().any(|k| k == t) => w.push(
            "form/unknown-type",
            CheckSeverity::Warning,
            id,
            format!("{label} has type \"{t}\", which form-js does not provide."),
            format!(
                "Use one of {} — unless \"{t}\" is a custom component registered in your Tasklist.",
                known_list()
            ),
        ),
        Some(_) => {}
    }

    match id {
        None => w.push(
            "form/missing-id",
            CheckSeverity::Error,
            None,
            format!(
                "{at}{} has no id.",
                ty.map(|t| format!(" ({t})")).unwrap_or_default()
            ),
            "Give every component a unique \"id\", e.g. \"Field_amount\".",
        ),
        Some(id) => {
            if let Some(first) = w.ids.get(id).cloned() {
                w.push(
                    "form/duplicate-id",
                    CheckSeverity::Error,
                    Some(id),
                    format!("The id \"{id}\" is used by {first} and by {at}."),
                    "Give each component its own id.",
                );
            } else {
                w.ids.insert(id.to_owned(), at.to_owned());
            }
        }
    }

    if let Some(t) = ty {
        if has_trait(t, FormTrait::Keyed) {
            check_key(c, t, scope, &label, id, w);
        }
        if has_trait(t, FormTrait::Options) {
            let has_values = matches!(c.get("values"), Some(Json::Arr(v)) if !v.is_empty());
            let has_source =
                str_prop(c, "valuesKey").is_some() || str_prop(c, "valuesExpression").is_some();
            if !has_values && !has_source {
                w.push(
                    "form/missing-options",
                    CheckSeverity::Error,
                    id,
                    format!("{label} ({t}) has no options."),
                    "Add \"values\": [{ \"label\": \"…\", \"value\": \"…\" }], or take them from a variable with \"valuesKey\" or \"valuesExpression\".",
                );
            }
        }
    }

    if ty == Some("expression") && str_prop(c, "expression").is_none_or(|e| js::trim(e).is_empty())
    {
        w.push(
            "form/missing-expression",
            CheckSeverity::Error,
            id,
            format!("{label} is an expression field with no \"expression\"."),
            "Set \"expression\" to a FEEL expression starting with \"=\", e.g. \"=amount * 1.2\".",
        );
    }

    if ty == Some("button") {
        if let Some(action) = c.get("action") {
            let ok = matches!(action, Json::Str(s) if s == "submit" || s == "reset");
            if !ok {
                w.push(
                    "form/invalid-schema",
                    CheckSeverity::Error,
                    id,
                    format!("{label} has button action {}.", js::stringify(Some(action))),
                    "Use \"action\": \"submit\" or \"reset\".",
                );
            }
        }
    }

    check_conditional(c, &label, id, w);
    check_validation(c, &label, id, w);
    check_feel_properties(c, "", &label, id, w);

    if let Some(Json::Arr(children)) = c.get("components") {
        let path = str_prop(c, "path").filter(|p| !p.is_empty());
        let nested = match (ty, path) {
            (Some(t), Some(p)) if has_trait(t, FormTrait::Scope) => {
                if scope.is_empty() {
                    p.to_owned()
                } else {
                    format!("{scope}.{p}")
                }
            }
            _ => scope.to_owned(),
        };
        walk_components(children, &nested, &format!("{at}.components"), w);
    }
}

fn check_key(c: &Obj, ty: &str, scope: &str, label: &str, id: Option<&str>, w: &mut Walk) {
    let Some(key) = str_prop(c, "key").filter(|k| !k.is_empty()) else {
        // An expression field may compute a value without binding it.
        if ty == "expression" {
            return;
        }
        w.push(
            "form/missing-key",
            CheckSeverity::Error,
            id,
            format!("{label} ({ty}) is not bound to a variable — it has no \"key\"."),
            "Set \"key\" to the process variable the field reads and writes, e.g. \"amount\".",
        );
        return;
    };
    if !valid_key(key) {
        w.push(
            "form/invalid-key",
            CheckSeverity::Error,
            id,
            format!("{label} has key \"{key}\", which is not a variable name or dotted path."),
            "Use letters, digits, `_` and `$`, not starting with a digit; separate nested names with dots.",
        );
    }
    let keys = w.keys.entry(scope.to_owned()).or_default();
    let duplicate = keys.iter().any(|k| k == key);
    if !duplicate {
        keys.push(key.to_owned());
    }
    if duplicate {
        let within = if scope.is_empty() {
            String::new()
        } else {
            format!(" (in \"{scope}\")")
        };
        w.push(
            "form/duplicate-key",
            CheckSeverity::Error,
            id,
            format!("{label} binds key \"{key}\"{within}, which another field already binds."),
            "Give each field its own key; two fields on one key overwrite each other's value on submit.",
        );
    }
}

fn check_conditional(c: &Obj, label: &str, id: Option<&str>, w: &mut Walk) {
    let Some(Json::Obj(cond)) = c.get("conditional") else {
        return;
    };
    let Some(hide) = str_prop(cond, "hide") else {
        return;
    };
    let trimmed = js::trim(hide);
    if !trimmed.is_empty() && !trimmed.starts_with('=') {
        w.push(
            "form/conditional-not-feel",
            CheckSeverity::Warning,
            id,
            format!("{label}'s conditional.hide is \"{hide}\", which is not an expression."),
            format!("Prefix it with \"=\" to make it FEEL, e.g. \"={trimmed}\"."),
        );
    }
}

fn check_validation(c: &Obj, label: &str, id: Option<&str>, w: &mut Walk) {
    let Some(Json::Obj(v)) = c.get("validate") else {
        return;
    };
    if let Some(pattern) = str_prop(v, "pattern") {
        if let Some(message) = crate::js_regex::syntax_error(pattern) {
            w.push(
                "form/invalid-validation",
                CheckSeverity::Error,
                id,
                format!("{label}'s validate.pattern is not a valid regular expression: {message}"),
                "Fix the pattern; backslashes must be doubled in JSON (`\\\\d`).",
            );
        }
    }
    for (lo, hi) in [("min", "max"), ("minLength", "maxLength")] {
        if let (Some(Json::Num(a)), Some(Json::Num(b))) = (v.get(lo), v.get(hi)) {
            if a > b {
                w.push(
                    "form/invalid-validation",
                    CheckSeverity::Error,
                    id,
                    format!(
                        "{label} has validate.{lo} {} greater than validate.{hi} {}; no value can pass.",
                        js::number_to_string(*a),
                        js::number_to_string(*b)
                    ),
                    format!("Swap them, or lower {lo} below {hi}."),
                );
            }
        }
    }
}

/// Parses every string property that form-js reads as FEEL (one starting with `=`).
fn check_feel_properties(value: &Obj, prefix: &str, label: &str, id: Option<&str>, w: &mut Walk) {
    for (key, v) in js::entries(value) {
        if prefix.is_empty() && NON_FEEL_KEYS.contains(&key.as_str()) {
            continue;
        }
        let prop = if prefix.is_empty() {
            key.clone()
        } else {
            format!("{prefix}.{key}")
        };
        match v {
            Json::Str(s) => {
                let trimmed = js::trim(s);
                let Some(expr) = trimmed.strip_prefix('=') else {
                    continue;
                };
                let errors = bpmnkit_feel::parse_partial(expr, &Default::default()).errors;
                let Some(first) = errors.first() else {
                    continue;
                };
                w.push(
                    "form/feel-syntax",
                    CheckSeverity::Error,
                    id,
                    format!(
                        "{label}'s {prop} is not valid FEEL: {} in `{trimmed}`.",
                        first.message
                    ),
                    "Fix the FEEL after the `=`; strings need double quotes, and `and`/`or` join conditions.",
                );
            }
            Json::Obj(o) => check_feel_properties(o, &prop, label, id, w),
            _ => {}
        }
    }
}
