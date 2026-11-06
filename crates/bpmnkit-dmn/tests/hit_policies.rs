//! Hit policies and `typeRef` as DMN 1.3 and Zeebe define them; mirrors
//! `packages/engine/tests/dmn-hit-policies.test.ts`.

use bpmnkit_dmn::{evaluate_decision_graph, parse_dmn};
use bpmnkit_feel::{Context, Value};

#[derive(Default)]
struct Table<'a> {
    type_in: Option<&'a str>,
    type_out: Option<&'a str>,
    output_values: Option<&'a str>,
    rules: Vec<(&'a str, &'a str)>,
}

fn eval(hit_policy: &str, t: Table, x: Value) -> Result<Value, String> {
    let rules: String = t
        .rules
        .iter()
        .enumerate()
        .map(|(i, (when, then))| {
            format!(
                r#"<rule id="r{i}"><inputEntry id="ri{i}"><text>{when}</text></inputEntry><outputEntry id="ro{i}"><text>{then}</text></outputEntry></rule>"#
            )
        })
        .collect();
    let attr = |a: &str, v: Option<&str>| v.map(|v| format!(r#" {a}="{v}""#)).unwrap_or_default();
    let values = t
        .output_values
        .map(|v| format!("<outputValues><text>{v}</text></outputValues>"))
        .unwrap_or_default();
    let xml = format!(
        r#"<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="d" namespace="n"><decision id="t"><decisionTable id="tt" hitPolicy="{hit_policy}">
<input id="i"><inputExpression id="ie"{}><text>x</text></inputExpression></input>
<output id="o" name="o"{}>{values}</output>
{rules}</decisionTable></decision></definitions>"#,
        attr("typeRef", t.type_in),
        attr("typeRef", t.type_out),
    );
    let defs = parse_dmn(&xml).unwrap();
    let mut ctx = Context::new();
    ctx.insert("x", x);
    evaluate_decision_graph(&defs, "t", &ctx)
        .map(|g| g.result)
        .map_err(|e| e.to_string())
}

fn strings(v: &[&str]) -> Value {
    Value::List(v.iter().map(|s| Value::String((*s).to_owned())).collect())
}

fn s(v: &str) -> Value {
    Value::String(v.to_owned())
}

#[test]
fn unique_fails_when_several_rules_match() {
    let rules = vec![("> 1", "\"a\""), ("> 2", "\"b\""), ("&lt; 0", "\"c\"")];
    let t = || Table {
        rules: rules.clone(),
        ..Default::default()
    };
    assert_eq!(
        eval("UNIQUE", t(), Value::from(5)).unwrap_err(),
        "Hit policy UNIQUE violated in decision 't': 2 rules match (r0, r1)"
    );
    assert_eq!(eval("UNIQUE", t(), Value::from(2)).unwrap(), s("a"));
    assert_eq!(eval("UNIQUE", t(), Value::from(1)).unwrap(), Value::Null);
}

fn ranked() -> Table<'static> {
    Table {
        output_values: Some("\"gold\",\"silver\",\"bronze\""),
        rules: vec![
            ("-", "\"bronze\""),
            ("-", "\"gold\""),
            ("-", "\"other\""),
            ("-", "\"silver\""),
        ],
        ..Default::default()
    }
}

#[test]
fn priority_returns_the_match_ranked_first_by_the_output_values() {
    assert_eq!(
        eval("PRIORITY", ranked(), Value::from(1)).unwrap(),
        s("gold")
    );
}

#[test]
fn output_order_sorts_by_the_output_values_unlisted_last() {
    assert_eq!(
        eval("OUTPUT ORDER", ranked(), Value::from(1)).unwrap(),
        strings(&["gold", "silver", "bronze", "other"])
    );
}

#[test]
fn without_output_values_rule_order_stays() {
    let t = || Table {
        rules: vec![("-", "\"b\""), ("-", "\"a\"")],
        ..Default::default()
    };
    assert_eq!(
        eval("OUTPUT ORDER", t(), Value::from(1)).unwrap(),
        strings(&["b", "a"])
    );
    assert_eq!(eval("PRIORITY", t(), Value::from(1)).unwrap(), s("b"));
}

fn typed_in(type_in: &str, x: Value) -> Result<Value, String> {
    eval(
        "FIRST",
        Table {
            type_in: Some(type_in),
            rules: vec![("-", "1")],
            ..Default::default()
        },
        x,
    )
}

#[test]
fn a_value_that_is_not_of_its_type_ref_fails_the_decision() {
    assert_eq!(typed_in("number", Value::from(1)).unwrap(), Value::from(1));
    assert_eq!(
        typed_in("number", s("1")).unwrap_err(),
        "Decision 't': input 'x' is of type 'string' but its typeRef is 'number'"
    );
    let out = Table {
        type_out: Some("string"),
        rules: vec![("-", "1")],
        ..Default::default()
    };
    assert_eq!(
        eval("FIRST", out, Value::from(1)).unwrap_err(),
        "Decision 't': output 'o' of rule 'r0' is of type 'number' but its typeRef is 'string'"
    );
}

#[test]
fn null_any_legacy_numbers_and_unknown_types_are_not_checked() {
    let one = Value::from(1);
    assert_eq!(typed_in("Any", s("s")).unwrap(), one);
    assert_eq!(typed_in("double", Value::from(2)).unwrap(), one);
    assert_eq!(typed_in("frobnicate", s("s")).unwrap(), one);
    assert_eq!(typed_in("number", Value::Null).unwrap(), one);
}

#[test]
fn a_string_converts_to_a_temporal_type_ref() {
    let t = || Table {
        type_in: Some("date"),
        rules: vec![
            ("&lt; date(&quot;2025-01-01&quot;)", "\"old\""),
            ("-", "\"new\""),
        ],
        ..Default::default()
    };
    assert_eq!(eval("FIRST", t(), s("2024-06-01")).unwrap(), s("old"));
    assert!(eval("FIRST", t(), s("nonsense"))
        .unwrap_err()
        .contains("typeRef is 'date'"));
}
