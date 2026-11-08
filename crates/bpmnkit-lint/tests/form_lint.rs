//! Ported from `packages/core/tests/form-lint.test.ts`.

use bpmnkit_lint::{lint_form, CheckSeverity};
use serde_json::{json, Value};

fn form(components: Value, root: Value) -> String {
    let mut f = json!({"id": "order-form", "type": "default", "schemaVersion": 16, "components": components});
    if let (Some(f), Some(r)) = (f.as_object_mut(), root.as_object()) {
        for (k, v) in r {
            if v.is_null() {
                f.remove(k);
            } else {
                f.insert(k.clone(), v.clone());
            }
        }
    }
    f.to_string()
}

fn rules(json: &str) -> Vec<String> {
    lint_form(json).into_iter().map(|f| f.rule).collect()
}

fn field(id: &str, key: &str, extra: Value) -> Value {
    let mut f = json!({"id": id, "type": "textfield", "key": key, "label": "x"});
    if let (Some(f), Some(e)) = (f.as_object_mut(), extra.as_object()) {
        f.extend(e.clone());
    }
    f
}

const NONE: &[&str] = &[];

#[test]
fn valid_form() {
    let json = form(
        json!([
            field("f1", "amount", json!({"conditional": {"hide": "=amount > 10"}})),
            {"id": "s1", "type": "select", "key": "tier", "values": [{"label": "Gold", "value": "gold"}]},
            {"id": "x1", "type": "expression", "key": "total", "expression": "=amount * 2"},
            {"id": "b1", "type": "button", "action": "submit"},
            {"id": "t1", "type": "text", "text": "Hello {{name}}"},
        ]),
        json!({}),
    );
    assert_eq!(lint_form(&json), vec![]);
}

#[test]
fn invalid_json() {
    let f = lint_form("{ id: 1, }");
    assert_eq!(f[0].rule, "form/invalid-json");
    assert_eq!(
        f[0].message,
        "The form is not valid JSON: Expected property name or '}' in JSON at position 2 (line 1 column 3)"
    );
}

#[test]
fn invalid_schema() {
    assert_eq!(rules("[]"), ["form/invalid-schema"]);
    assert_eq!(
        rules(&form(json!([]), json!({"type": "form"}))),
        ["form/invalid-schema"]
    );
    assert_eq!(
        rules(r#"{"id":"a","type":"default"}"#),
        ["form/invalid-schema"]
    );
    let sv = lint_form(&form(json!([]), json!({"schemaVersion": "16"})));
    assert_eq!(sv.len(), 1);
    assert_eq!(
        (sv[0].rule.as_str(), sv[0].severity),
        ("form/invalid-schema", CheckSeverity::Warning)
    );
    assert_eq!(sv[0].message, r#""schemaVersion" is "16", not a number."#);
    assert_eq!(
        rules(&form(json!([42]), json!({}))),
        ["form/invalid-schema"]
    );
    assert_eq!(
        rules(&form(json!([{"id": "a"}]), json!({}))),
        ["form/invalid-schema"]
    );
    assert_eq!(
        rules(&form(
            json!([{"id": "b1", "type": "button", "action": "send"}]),
            json!({})
        )),
        ["form/invalid-schema"]
    );
    let missing_type = lint_form(r#"{"id":"a","components":[]}"#);
    assert_eq!(
        missing_type[0].message,
        r#"The form's top-level "type" is undefined, not "default"."#
    );
}

#[test]
fn missing_id() {
    assert_eq!(
        rules(&form(json!([]), json!({"id": null}))),
        ["form/missing-id"]
    );
    assert_eq!(
        rules(&form(json!([{"type": "textfield", "key": "a"}]), json!({}))),
        ["form/missing-id"]
    );
}

#[test]
fn unknown_type_is_a_warning() {
    let f = lint_form(&form(json!([{"id": "c", "type": "slider"}]), json!({})));
    assert_eq!(f[0].rule, "form/unknown-type");
    assert_eq!(f[0].severity, CheckSeverity::Warning);
    assert_eq!(f[0].element_id.as_deref(), Some("c"));
}

#[test]
fn duplicates() {
    let nested = json!([field("f1", "a", json!({})), {"id": "g", "type": "group", "components": [field("f1", "b", json!({}))]}]);
    assert_eq!(rules(&form(nested, json!({}))), ["form/duplicate-id"]);
    assert_eq!(
        rules(&form(
            json!([field("f1", "a", json!({})), field("f2", "a", json!({}))]),
            json!({})
        )),
        ["form/duplicate-key"]
    );
    let scoped = json!([field("f1", "a", json!({})), {"id": "g", "type": "group", "path": "nested", "components": [field("f2", "a", json!({}))]}]);
    assert_eq!(rules(&form(scoped, json!({}))), NONE);
    let unscoped = json!([field("f1", "a", json!({})), {"id": "g", "type": "group", "components": [field("f2", "a", json!({}))]}]);
    assert_eq!(rules(&form(unscoped, json!({}))), ["form/duplicate-key"]);
}

#[test]
fn keys() {
    let f = lint_form(&form(json!([{"id": "f1", "type": "number"}]), json!({})));
    assert_eq!(
        (f[0].rule.as_str(), f[0].element_id.as_deref()),
        ("form/missing-key", Some("f1"))
    );
    assert_eq!(
        rules(&form(
            json!([{"id": "x", "type": "expression", "expression": "=1"}]),
            json!({})
        )),
        NONE
    );
    assert_eq!(
        rules(&form(
            json!([field("f1", "1st-name", json!({}))]),
            json!({})
        )),
        ["form/invalid-key"]
    );
    assert_eq!(
        rules(&form(
            json!([field("f1", "customer.name", json!({}))]),
            json!({})
        )),
        NONE
    );
}

#[test]
fn options_and_expressions() {
    assert_eq!(
        rules(&form(
            json!([{"id": "s", "type": "radio", "key": "r"}]),
            json!({})
        )),
        ["form/missing-options"]
    );
    assert_eq!(
        rules(&form(
            json!([{"id": "s", "type": "radio", "key": "r", "valuesKey": "opts"}]),
            json!({})
        )),
        NONE
    );
    assert_eq!(
        rules(&form(
            json!([{"id": "x", "type": "expression", "key": "t"}]),
            json!({})
        )),
        ["form/missing-expression"]
    );
}

#[test]
fn conditional_not_feel() {
    let f = lint_form(&form(
        json!([field("f1", "a", json!({"conditional": {"hide": "a > 1"}}))]),
        json!({}),
    ));
    assert_eq!(f[0].rule, "form/conditional-not-feel");
    assert!(f[0].fix.contains(r#""=a > 1""#));
}

#[test]
fn feel_syntax() {
    let one = |c: Value| rules(&form(json!([c]), json!({})));
    assert_eq!(
        one(field("f1", "a", json!({"conditional": {"hide": "=a * "}}))),
        ["form/feel-syntax"]
    );
    assert_eq!(
        one(json!({"id": "x", "type": "expression", "key": "t", "expression": "=1 +"})),
        ["form/feel-syntax"]
    );
    assert_eq!(
        one(field(
            "f1",
            "a",
            json!({"readonly": "=(a", "label": "=\"ok\""})
        )),
        ["form/feel-syntax"]
    );
}

#[test]
fn invalid_validation() {
    let f = lint_form(&form(
        json!([field("f1", "a", json!({"validate": {"pattern": "([a-z"}}))]),
        json!({}),
    ));
    assert_eq!(f.len(), 1);
    assert_eq!(
        f[0].message,
        "Component \"f1\"'s validate.pattern is not a valid regular expression: Invalid regular expression: /([a-z/: Unterminated character class"
    );
    let range = lint_form(&form(
        json!([field(
            "f1",
            "a",
            json!({"validate": {"minLength": 5, "maxLength": 2}})
        )]),
        json!({}),
    ));
    assert_eq!(range[0].message, "Component \"f1\" has validate.minLength 5 greater than validate.maxLength 2; no value can pass.");
    assert_eq!(
        rules(&form(
            json!([{"id": "n", "type": "number", "key": "n", "validate": {"min": 1, "max": 10}}]),
            json!({})
        )),
        NONE
    );
}
