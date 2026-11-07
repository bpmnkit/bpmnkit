//! Minimal replay of the `kind: "dmn"` cases of `conformance/builder` (script language in
//! `conformance/README.md`) against the DMN builders. A full runner comes later.

use std::collections::HashMap;
use std::path::PathBuf;

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_builder::drd::{drg_id, DrdBuilder, DrdDecisionOptions, DrgRef};
use bpmnkit_builder::options::{HitPolicy, InputOptions, OutputOptions, RuleOptions};
use bpmnkit_builder::{DecisionTableBuilder, Dmn};
use bpmnkit_dmn::{serialize_dmn, DmnDefinitions};
use serde_json::Value;

fn norm(v: Value) -> Value {
    match v {
        Value::Number(n) => serde_json::json!(n.as_f64()),
        Value::Array(a) => Value::Array(a.into_iter().map(norm).collect()),
        Value::Object(o) => Value::Object(o.into_iter().map(|(k, v)| (k, norm(v))).collect()),
        v => v,
    }
}

fn s(v: &Value) -> &str {
    v.as_str().expect("string argument")
}

fn replay_table(b: &mut DecisionTableBuilder, ops: &[Value]) {
    for op in ops {
        let op = op.as_array().expect("op");
        let args = &op[1..];
        match s(&op[0]) {
            "name" => drop(b.name(s(&args[0]))),
            "hitPolicy" => {
                let policy: HitPolicy = serde_json::from_value(args[0].clone()).unwrap();
                b.hit_policy(policy);
            }
            "input" => {
                let o: InputOptions = serde_json::from_value(args[0].clone()).unwrap();
                b.input(o);
            }
            "output" => {
                let o: OutputOptions = serde_json::from_value(args[0].clone()).unwrap();
                b.output(o);
            }
            "rule" => {
                let o: RuleOptions = serde_json::from_value(args[0].clone()).unwrap();
                b.rule(o);
            }
            other => panic!("unknown table op {other}"),
        }
    }
}

fn callback_ops(v: &Value) -> Vec<Value> {
    v["$ops"].as_array().expect("$ops").clone()
}

fn resolve_ref(v: &Value, handles: &HashMap<String, DrgRef>) -> DrgRef {
    if let Some(name) = v.get("$ref") {
        return handles[s(name)].clone();
    }
    if let Some(id) = v.get("$drgId") {
        return drg_id(s(id)).into();
    }
    drg_id(s(v)).into()
}

fn replay_drd(b: &mut DrdBuilder, ops: &[Value]) -> Option<Result<DmnDefinitions, String>> {
    let mut handles: HashMap<String, DrgRef> = HashMap::new();
    for op in ops {
        let op = op.as_array().expect("op");
        let (name, rest): (Option<&str>, &[Value]) = if s(&op[0]) == "$let" {
            (Some(s(&op[1])), &op[2..])
        } else {
            (None, &op[..])
        };
        let args = &rest[1..];
        let handle: Option<DrgRef> = match s(&rest[0]) {
            "inputData" => Some(b.input_data(s(&args[0]), args.get(1).map(s)).into()),
            "decision" => {
                let table_ops = callback_ops(&args[1]);
                let requires = args
                    .get(2)
                    .and_then(|o| o.get("requires"))
                    .and_then(Value::as_array)
                    .map(|a| a.iter().map(|r| resolve_ref(r, &handles)).collect())
                    .unwrap_or_default();
                Some(
                    b.decision(
                        s(&args[0]),
                        |t| replay_table(t, &table_ops),
                        DrdDecisionOptions { requires },
                    )
                    .into(),
                )
            }
            "build" => {
                return Some(b.build().map_err(|e| e.message));
            }
            other => panic!("unknown drd op {other}"),
        };
        if let (Some(name), Some(h)) = (name, handle) {
            handles.insert(name.to_owned(), h);
        }
    }
    None
}

fn run_case(dir: &std::path::Path) -> Result<DmnDefinitions, String> {
    let case: Value =
        serde_json::from_str(&std::fs::read_to_string(dir.join("case.json")).unwrap()).unwrap();
    let script = case["script"].as_array().unwrap();
    reset_id_counter();
    let first = script[0].as_array().unwrap();
    match s(&first[0]) {
        "createDecisionTable" => {
            let mut b = Dmn::create_decision_table(s(&first[1]));
            let (last, init) = script[1..].split_last().unwrap();
            replay_table(&mut b, init);
            assert_eq!(s(&last[0]), "build");
            b.build().map_err(|e| e.message)
        }
        "drd" => {
            let mut b = Dmn::drd(first.get(1).map(s));
            replay_drd(&mut b, &script[1..]).expect("script ends with build")
        }
        other => panic!("unknown start {other}"),
    }
}

#[test]
fn builder_dmn_cases() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../conformance/builder");
    let mut entries: Vec<_> = std::fs::read_dir(&root)
        .unwrap()
        .map(|e| e.unwrap().path())
        .collect();
    entries.sort();
    let (mut pass, mut failed) = (0, vec![]);
    for dir in entries {
        let Ok(text) = std::fs::read_to_string(dir.join("case.json")) else {
            continue;
        };
        let case: Value = serde_json::from_str(&text).unwrap();
        if case["kind"] != "dmn" {
            continue;
        }
        let name = dir.file_name().unwrap().to_string_lossy().into_owned();
        let expected = dir.join("expected");
        let outcome = run_case(&dir);
        let ok = match (
            &outcome,
            std::fs::read_to_string(expected.join("error.txt")),
        ) {
            (Err(message), Ok(want)) => format!("{message}\n") == want,
            (Ok(defs), Err(_)) => {
                let model: Value = serde_json::from_str(
                    &std::fs::read_to_string(expected.join("model.json")).unwrap(),
                )
                .unwrap();
                let xml = std::fs::read_to_string(expected.join("output.dmn")).unwrap();
                norm(serde_json::to_value(defs).unwrap()) == norm(model)
                    && serialize_dmn(defs) == xml
            }
            _ => false,
        };
        if ok {
            pass += 1;
        } else {
            failed.push(name);
        }
    }
    eprintln!("builder dmn: {pass} passed, {} failed", failed.len());
    assert!(failed.is_empty(), "failed: {failed:?}");
    assert!(pass > 30);
}
