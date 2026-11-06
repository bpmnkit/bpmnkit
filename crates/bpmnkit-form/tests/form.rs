use bpmnkit_form::{export_form, parse_form, ComponentKind, FormDefinition};
use bpmnkit_spec::elements::FORM_ELEMENTS;
use std::path::{Path, PathBuf};

fn parse(json: &str) -> FormDefinition {
    parse_form(json).unwrap_or_else(|e| panic!("{e}"))
}

#[test]
fn parses_and_exports_a_small_form() {
    let form = parse(
        r#"{"id":"f","type":"default","components":[{"type":"textfield","id":"a","label":"A","key":"a"}]}"#,
    );
    assert_eq!(form.id, "f");
    assert_eq!(form.components.len(), 1);
    assert!(matches!(
        form.components[0].kind,
        ComponentKind::Textfield(_)
    ));
    // exportForm writes metadata first, `type` last and layout.columns as null.
    assert_eq!(
        export_form(&form),
        "{\n  \"id\": \"f\",\n  \"components\": [\n    {\n      \"label\": \"A\",\n      \"type\": \"textfield\",\n      \"id\": \"a\",\n      \"key\": \"a\"\n    }\n  ],\n  \"type\": \"default\"\n}"
    );
}

#[test]
fn model_serializes_like_json_stringify() {
    let form = parse(
        r#"{"id":"f","type":"default","schemaVersion":16,"components":[{"type":"number","id":"n","label":"N","key":"n","defaultValue":2,"layout":{"columns":null},"hint":"x"}]}"#,
    );
    let v = serde_json::to_value(&form).unwrap();
    assert_eq!(
        v,
        serde_json::json!({
            "id": "f", "type": "default", "schemaVersion": 16,
            "components": [{
                "type": "number", "id": "n", "label": "N", "key": "n", "defaultValue": 2,
                "layout": {"columns": null}, "extraProps": {"hint": "x"}
            }]
        })
    );
}

#[test]
fn rejects_what_ts_rejects() {
    for (json, msg) in [
        ("[]", "Form JSON must be an object"),
        (
            r#"{"type":"d","components":[]}"#,
            "Form must have a non-empty 'id' string",
        ),
        (
            r#"{"id":"f","components":[]}"#,
            "Form must have a 'type' string",
        ),
        (
            r#"{"id":"f","type":"d"}"#,
            "Form must have a 'components' array",
        ),
        (
            r#"{"id":"f","type":"d","components":[{"type":"group","id":"g","label":"G","components":[1]}]}"#,
            "components[0].components[0]: component must be an object",
        ),
    ] {
        assert_eq!(parse_form(json).unwrap_err().to_string(), msg);
    }
}

#[test]
fn syntax_errors_carry_the_ts_prefix() {
    let e = parse_form("{ id: 1, }").unwrap_err().to_string();
    assert!(e.starts_with("Failed to parse form JSON: "), "{e}");
}

#[test]
fn every_spec_component_has_a_parser() {
    // A spec type with no arm in the parser would come back as Unknown or fail outright.
    for el in FORM_ELEMENTS.elements {
        let json = format!(
            r#"{{"id":"f","type":"d","components":[{{"type":"{0}","id":"c","label":"L","key":"k","text":"t","components":[]}}]}}"#,
            el.name
        );
        let form = parse(&json);
        let kind = &form.components[0].kind;
        assert!(
            !matches!(kind, ComponentKind::Unknown(_)) && kind.type_name() == el.name,
            "{}",
            el.name
        );
    }
    let other = parse(r#"{"id":"f","type":"d","components":[{"type":"nope","id":"c"}]}"#);
    assert!(matches!(
        other.components[0].kind,
        ComponentKind::Unknown(_)
    ));
}

fn conformance_form_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/form")
}

/// parse(export(parse(x))) == parse(x) for every conformance input TS accepts.
#[test]
fn export_is_stable_over_the_conformance_inputs() {
    let mut checked = 0;
    for entry in std::fs::read_dir(conformance_form_dir()).unwrap() {
        let case = entry.unwrap().path();
        let Ok(input) = std::fs::read_to_string(case.join("input.form")) else {
            continue;
        };
        let Ok(first) = parse_form(&input) else {
            continue;
        };
        let text = export_form(&first);
        let second = parse_form(&text).unwrap_or_else(|e| panic!("{}: {e}", case.display()));
        assert_eq!(export_form(&second), text, "{}", case.display());
        checked += 1;
    }
    assert!(checked > 10, "only {checked} cases checked");
}
