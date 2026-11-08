//! Regression tests for lossless export and parser robustness; each has a twin in
//! `packages/core/tests/form/lossless.test.ts`.

use bpmnkit_form::{export_form, parse_form, ComponentKind, FormDefinition};
use serde_json::{json, Value};

fn parse(json: &str) -> FormDefinition {
    parse_form(json).unwrap_or_else(|e| panic!("{e}"))
}

fn form_of(components: &str) -> String {
    format!(r#"{{"id":"f","type":"default","components":[{components}]}}"#)
}

fn round_trip(components: &str) -> Value {
    let out = export_form(&parse(&form_of(components)));
    serde_json::from_str::<Value>(&out).unwrap()["components"].clone()
}

#[test]
fn export_keeps_values_expression_of_radio_and_checklist() {
    let out = round_trip(
        r#"{"type":"radio","id":"r","label":"R","key":"r","valuesExpression":"=opts"},
           {"type":"checklist","id":"c","label":"C","key":"c","valuesExpression":"=opts"}"#,
    );
    assert_eq!(out[0]["valuesExpression"], "=opts");
    assert_eq!(out[1]["valuesExpression"], "=opts");
}

#[test]
fn validation_models_form_js_keys_and_keeps_the_rest() {
    let validate = r#"{"required":true,"min":1,"max":9,"pattern":"^a","validationType":"email","custom":{"a":1},"minLength":"3"}"#;
    let json =
        format!(r#"{{"type":"number","id":"n","label":"N","key":"n","validate":{validate}}}"#);
    let form = parse(&form_of(&json));
    let ComponentKind::Number(n) = &form.components[0].kind else {
        panic!("not a number");
    };
    let v = n.validate.as_ref().unwrap();
    assert_eq!(v.pattern.as_deref(), Some("^a"));
    assert_eq!(v.validation_type.as_deref(), Some("email"));
    assert!(v.min.is_some() && v.max.is_some());
    assert_eq!(v.extra_props.as_ref().unwrap().len(), 2);
    assert_eq!(
        round_trip(&json)[0]["validate"],
        serde_json::from_str::<Value>(validate).unwrap()
    );
}

#[test]
fn datetime_and_taglist_validate_is_parsed_into_the_model() {
    let form = parse(&form_of(
        r#"{"type":"datetime","id":"d","key":"d","validate":{"required":true}},
           {"type":"taglist","id":"t","label":"T","key":"t","validate":{"required":true}}"#,
    ));
    for c in &form.components {
        assert!(c.extra_props.is_none());
    }
    assert!(matches!(&form.components[0].kind,
        ComponentKind::Datetime(d) if d.validate.as_ref().unwrap().required == Some(true)));
    assert!(matches!(&form.components[1].kind,
        ComponentKind::Taglist(t) if t.validate.as_ref().unwrap().required == Some(true)));
    assert_eq!(
        parse_form(&form_of(
            r#"{"type":"datetime","id":"d","key":"d","validate":3}"#
        ))
        .unwrap_err()
        .to_string(),
        "components[0].validate: must be an object"
    );
}

#[test]
fn values_items_and_layout_keep_extra_keys() {
    let out = round_trip(
        r#"{"type":"select","id":"s","label":"S","key":"s",
            "values":[{"label":"A","value":"a","disabled":true}],
            "layout":{"row":"r1","columns":4,"hint":"x"}}"#,
    );
    assert_eq!(
        out[0]["values"],
        json!([{"label":"A","value":"a","disabled":true}])
    );
    assert_eq!(out[0]["layout"], json!({"row":"r1","columns":4,"hint":"x"}));
}

#[test]
fn unknown_component_round_trips_null_layout_and_raw_extra_props() {
    let out = round_trip(
        r#"{"type":"plugin","id":"p","layout":null},
           {"type":"plugin","id":"q","extraProps":"abc"}"#,
    );
    assert_eq!(out[0], json!({"type":"plugin","id":"p","layout":null}));
    assert_eq!(out[1], json!({"type":"plugin","id":"q","extraProps":"abc"}));
}

#[test]
fn null_table_column_is_a_parse_error() {
    assert_eq!(
        parse_form(&form_of(r#"{"type":"table","id":"t","columns":[null]}"#))
            .unwrap_err()
            .to_string(),
        "components[0].columns[0]: must be an object"
    );
}
