//! Oracle test for the process-text token helpers; expected values from
//! `tests/oracle/pt_tokens.mjs` (TS, run against `packages/core/dist`). The helpers that
//! are not public are checked against the same dump by unit tests in `tokens.rs`.

use bpmnkit_text::process_text::tokens::{
    condition_or_label, duration, edge_label, match_doc_line, match_note_line, split_feel,
    split_mappings, tokenize_path, EdgeLabel, MappingDirection,
};
use serde_json::{json, Value};

fn section(name: &str) -> Vec<Value> {
    let all: Value = serde_json::from_str(include_str!("oracle/pt_tokens.json")).expect("oracle");
    all[name].as_array().expect(name).clone()
}

fn opt(v: &Option<String>) -> Value {
    v.as_ref().map_or(Value::Null, |s| json!(s))
}

fn label_json(e: &EdgeLabel) -> Value {
    json!({
        "name": opt(&e.name),
        "condition": opt(&e.condition),
        "isDefault": e.is_default,
    })
}

fn label_from(v: &Value) -> EdgeLabel {
    EdgeLabel {
        name: v["name"].as_str().map(str::to_owned),
        condition: v["condition"].as_str().map(str::to_owned),
        is_default: v["isDefault"].as_bool(),
    }
}

#[test]
fn tokenize_path_matches_ts() {
    for case in section("tokenize") {
        let text = case[0].as_str().unwrap();
        let got = match tokenize_path(text) {
            Err(error) => json!({ "error": error }),
            Ok(t) => json!({
                "refs": t.refs.iter().map(|r| json!({"id": r.id, "spec": opt(&r.spec)})).collect::<Vec<_>>(),
                "labels": t.labels.iter().map(opt).collect::<Vec<_>>(),
                "note": opt(&t.note),
                "joined": t.joined.iter().map(|j| json!({"written": j.written, "id": j.id})).collect::<Vec<_>>(),
                "unclosed": t.unclosed,
                "bracketless": t.bracketless,
            }),
        };
        assert_eq!(got, case[1], "tokenize_path({text:?})");
    }
}

#[test]
fn split_feel_matches_ts() {
    for case in section("splitFeel") {
        let text = case[0].as_str().unwrap();
        let r = split_feel(text);
        assert_eq!(
            json!({"plain": r.plain, "feel": opt(&r.feel)}),
            case[1],
            "split_feel({text:?})"
        );
    }
}

#[test]
fn split_mappings_matches_ts() {
    for case in section("splitMappings") {
        let text = case[0].as_str().unwrap();
        let r = split_mappings(text);
        let mappings: Vec<Value> = r
            .mappings
            .iter()
            .map(|m| {
                let direction = match m.direction {
                    MappingDirection::In => "in",
                    MappingDirection::Out => "out",
                };
                json!({"direction": direction, "target": m.target, "value": m.value})
            })
            .collect();
        assert_eq!(
            json!({"plain": r.plain, "mappings": mappings}),
            case[1],
            "split_mappings({text:?})"
        );
    }
}

#[test]
fn duration_matches_ts() {
    for case in section("duration") {
        let text = case[0].as_str().unwrap();
        assert_eq!(opt(&duration(text)), case[1], "duration({text:?})");
    }
}

#[test]
fn edge_label_matches_ts() {
    for case in section("edgeLabel") {
        let label = case[0].as_str();
        assert_eq!(
            label_json(&edge_label(label)),
            case[1],
            "edge_label({label:?})"
        );
    }
}

#[test]
fn condition_or_label_matches_ts() {
    for case in section("conditionOrLabel") {
        let edge = label_from(&case[0]);
        let (kept, problem) = condition_or_label(edge.clone());
        assert_eq!(
            json!({"edge": label_json(&kept), "problem": opt(&problem)}),
            case[1],
            "condition_or_label({edge:?})"
        );
    }
}

#[test]
fn note_and_doc_lines_match_ts() {
    for case in section("noteDoc") {
        let text = case[0].as_str().unwrap();
        let pair = |m: Option<(&str, &str)>| m.map_or(Value::Null, |(a, b)| json!([a, b]));
        assert_eq!(pair(match_note_line(text)), case[1], "note {text:?}");
        assert_eq!(pair(match_doc_line(text)), case[2], "doc {text:?}");
    }
}
