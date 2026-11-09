//! Replays `conformance/compact` (BPMN cases; the `dmn-*` ones belong to the DMN compact
//! job): compactify, expand and the compact stream against what TS recorded.

use std::fs;
use std::path::{Path, PathBuf};

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_text::compact::{
    compactify, expand, CompactDiagram, CompactStream, CompactStreamOptions, ExpandOptions,
};
use serde_json::Value;

fn corpus() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/compact")
}

fn read(path: &Path) -> Option<String> {
    fs::read_to_string(path).ok()
}

/// `case.json` `expand`: the options the case's diagram is expanded with.
fn case_options(case_dir: &Path) -> ExpandOptions {
    let spec: Value = fs::read_to_string(case_dir.join("case.json"))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or(Value::Null);
    let options = &spec["expand"];
    ExpandOptions {
        validate: options["validate"].as_bool().unwrap_or(true),
        placeholders: options["placeholders"].as_bool().unwrap_or(false),
        camunda_version: options["camundaVersion"].as_str().map(str::to_owned),
    }
}

/// Numbers as f64 so `18` and `18.0` agree; keys are sorted by `Value` already.
fn norm(v: Value) -> Value {
    match v {
        Value::Number(n) => serde_json::Number::from_f64(n.as_f64().unwrap_or(0.0))
            .map_or(Value::Null, Value::Number),
        Value::Array(a) => Value::Array(a.into_iter().map(norm).collect()),
        Value::Object(o) => Value::Object(o.into_iter().map(|(k, v)| (k, norm(v))).collect()),
        other => other,
    }
}

fn to_value<T: serde::Serialize>(t: &T) -> Value {
    norm(serde_json::to_value(t).unwrap())
}

fn input_path(dir: &Path, name: &str) -> Option<PathBuf> {
    let direct = dir.join(name);
    if direct.exists() {
        return Some(direct);
    }
    let case: Value = serde_json::from_str(&read(&dir.join("case.json"))?).ok()?;
    let rel = case.get("input")?.as_str()?;
    let local = dir.join(rel);
    Some(if local.exists() {
        local
    } else {
        corpus().join("..").join(rel)
    })
}

fn check_expand(
    name: &str,
    diagram: &CompactDiagram,
    dir: &Path,
    out_file: &str,
    err_file: &str,
    failures: &mut Vec<String>,
) {
    let expected = dir.join("expected");
    reset_id_counter();
    match expand(diagram, &case_options(dir)) {
        Ok(defs) => {
            if let Some(err) = read(&expected.join(err_file)) {
                failures.push(format!("{name}: expected error {err:?}, got a model"));
                return;
            }
            let want = read(&expected.join(out_file)).unwrap_or_default();
            let got = serialize_bpmn(&defs);
            if got != want {
                failures.push(format!("{name}: {out_file} differs"));
            }
            if let Some(model) = read(&expected.join("model.json")) {
                let want: Value = norm(serde_json::from_str(&model).unwrap());
                if to_value(&defs) != want {
                    failures.push(format!("{name}: model.json differs"));
                }
            }
        }
        Err(e) => {
            let want = read(&expected.join(err_file));
            if want.as_deref() != Some(&format!("{}\n", e.message)) {
                failures.push(format!("{name}: error {:?} vs {want:?}", e.message));
            }
        }
    }
}

#[test]
fn compact_corpus() {
    let mut names: Vec<_> = fs::read_dir(corpus())
        .unwrap()
        .map(|e| e.unwrap().path())
        .filter(|p| p.is_dir())
        .collect();
    names.sort();
    let mut failures = Vec::new();
    let (mut passed, mut skipped) = (0, Vec::new());
    for dir in names {
        let name = dir.file_name().unwrap().to_string_lossy().into_owned();
        if name.starts_with("dmn-") {
            continue;
        }
        let before = failures.len();
        if let Some(input) = input_path(&dir, "input.bpmn") {
            let xml = fs::read_to_string(input).unwrap();
            reset_id_counter();
            let defs = parse_bpmn(&xml).expect("parse");
            let compact = compactify(&defs);
            let want: Value = norm(
                serde_json::from_str(&read(&dir.join("expected/compact.json")).unwrap()).unwrap(),
            );
            if to_value(&compact) != want {
                failures.push(format!("{name}: compact.json differs"));
            }
            check_expand(
                &name,
                &compact,
                &dir,
                "expanded.bpmn",
                "expanded.error.txt",
                &mut failures,
            );
        } else if dir.join("input.json").exists() {
            let text = fs::read_to_string(dir.join("input.json")).unwrap();
            match serde_json::from_str::<CompactDiagram>(&text) {
                Ok(diagram) => check_expand(
                    &name,
                    &diagram,
                    &dir,
                    "output.bpmn",
                    "error.txt",
                    &mut failures,
                ),
                Err(_) => {
                    // TS's argument guard reports the shape; the typed input cannot be built.
                    skipped.push(name.clone());
                    continue;
                }
            }
        } else if dir.join("case.json").exists() {
            let case: Value = serde_json::from_str(&read(&dir.join("case.json")).unwrap()).unwrap();
            let base = match case.get("base") {
                Some(b) if !b.is_null() => Some(serde_json::from_value(b.clone()).unwrap()),
                _ => None,
            };
            let mut stream = CompactStream::new(CompactStreamOptions { base });
            reset_id_counter();
            let expected = dir.join("expected");
            let frames: Value =
                serde_json::from_str(&read(&expected.join("frames.json")).unwrap()).unwrap();
            for (i, chunk) in case["chunks"].as_array().unwrap().iter().enumerate() {
                let got = stream.push(chunk.as_str().unwrap());
                match (&frames[i], got) {
                    (Value::Null, None) => {}
                    (Value::String(file), Some(defs)) => {
                        let want = read(&expected.join(file)).unwrap();
                        if serialize_bpmn(&defs) != want {
                            failures.push(format!("{name}: frame {i} differs"));
                        }
                    }
                    (want, got) => failures.push(format!(
                        "{name}: frame {i} expected {want}, got {}",
                        if got.is_some() { "a frame" } else { "null" }
                    )),
                }
            }
        } else {
            continue;
        }
        if failures.len() == before {
            passed += 1;
        }
    }
    eprintln!("passed {passed}, skipped (shape guard) {skipped:?}");
    assert!(
        failures.is_empty(),
        "{} failures:\n{}",
        failures.len(),
        failures.join("\n")
    );
}

fn expand_json_str(json: &str) -> bpmnkit_bpmn::BpmnDefinitions {
    reset_id_counter();
    // Fragments: the tests below are about single fields, not deploying.
    expand(
        &serde_json::from_str::<CompactDiagram>(json).unwrap(),
        &ExpandOptions::ungated(),
    )
    .unwrap()
}

#[test]
fn link_name_round_trips_through_expand_and_compactify() {
    let defs = expand_json_str(
        r#"{"id":"d","processes":[{"id":"p","elements":[
            {"id":"t","type":"intermediateThrowEvent","eventType":"link","linkName":"jump"},
            {"id":"c","type":"intermediateCatchEvent","eventType":"link","linkName":"jump"}
        ],"flows":[]}]}"#,
    );
    let xml = serialize_bpmn(&defs);
    assert_eq!(xml.matches("name=\"jump\"").count(), 2, "{xml}");
    let compact = to_value(&compactify(&defs));
    let elements = &compact["processes"][0]["elements"];
    assert_eq!(elements[0]["linkName"], "jump");
    assert_eq!(elements[1]["linkName"], "jump");
}

#[test]
fn expand_turns_flow_and_multi_instance_conditions_into_feel() {
    let defs = expand_json_str(
        r#"{"id":"d","processes":[{"id":"p","elements":[
            {"id":"a","type":"serviceTask","multiInstance":{"collection":"=items","completionCondition":"${done}"}},
            {"id":"b","type":"task"},{"id":"c","type":"task"}
        ],"flows":[
            {"id":"f1","from":"a","to":"b","condition":"amount > 5"},
            {"id":"f2","from":"a","to":"c","condition":"=already"}
        ]}]}"#,
    );
    let xml = serialize_bpmn(&defs);
    assert!(xml.contains(">=amount &gt; 5<"), "{xml}");
    assert!(xml.contains(">=already<"), "{xml}");
    assert!(xml.contains("<bpmn:completionCondition"), "{xml}");
    assert!(xml.contains(">=done<"), "{xml}");
}
