//! Oracle tests for the helpers the builder and text crates share. Expected values come
//! from `tests/oracle/helpers.mjs` (TS, run against `packages/core/dist`).

use bpmnkit_bpmn::element_shape::{create_flow_element, BpmnElementType, CreateFlowElementOptions};
use bpmnkit_bpmn::rest_connector::{
    rest_connector_retries, rest_connector_to_io_mapping_inputs, rest_connector_to_task_headers,
    RestConnectorConfig,
};
use bpmnkit_bpmn::slug::{slugify, unique_id};
use bpmnkit_bpmn::stable_ids::{
    assert_explicit_flow_ids_unique, assign_event_definition_ids, assign_stable_flow_ids,
    root_definition_id, FlowTags,
};
use bpmnkit_bpmn::zeebe::{ensure_zeebe_extension, make_conditional_definition};
use bpmnkit_bpmn::{BpmnEventDefinition, BpmnFlowElement, BpmnSequenceFlow, XmlElement};
use indexmap::IndexSet;
use serde_json::Value;

fn oracle() -> Value {
    let text = include_str!("oracle/helpers.json");
    serde_json::from_str(text).expect("helpers.json")
}

/// Numbers compared by value, as JS has only one number type.
fn norm(v: Value) -> Value {
    match v {
        Value::Number(n) => serde_json::json!(n.as_f64()),
        Value::Array(a) => Value::Array(a.into_iter().map(norm).collect()),
        Value::Object(o) => Value::Object(o.into_iter().map(|(k, v)| (k, norm(v))).collect()),
        v => v,
    }
}

fn to<T: serde::de::DeserializeOwned>(v: &Value) -> T {
    serde_json::from_value(v.clone()).expect("deserialize")
}

fn json<T: serde::Serialize>(v: &T) -> Value {
    norm(serde_json::to_value(v).expect("serialize"))
}

fn strs(v: &Value) -> Vec<String> {
    v.as_array()
        .map(|a| {
            a.iter()
                .map(|s| s.as_str().unwrap_or_default().to_owned())
                .collect()
        })
        .unwrap_or_default()
}

#[test]
fn slugs_and_unique_ids() {
    let o = oracle();
    for case in o["slugs"].as_array().unwrap() {
        assert_eq!(
            slugify(case["text"].as_str().unwrap()),
            case["slug"],
            "{case}"
        );
    }
    let mut taken: IndexSet<String> = ["a", "a_2", "b"].map(String::from).into();
    for case in o["uniques"].as_array().unwrap() {
        assert_eq!(
            unique_id(case["base"].as_str().unwrap(), &mut taken),
            case["id"]
        );
    }
}

#[test]
fn stable_flow_ids() {
    for case in oracle()["flowCases"].as_array().unwrap() {
        let mut elements: Vec<BpmnFlowElement> = to(&case["elements"]);
        let mut flows: Vec<BpmnSequenceFlow> = to(&case["flows"]);
        let mut tags = FlowTags::default();
        for (flow, branch) in case["branch"].as_object().unwrap() {
            tags.set_flow_discriminator_source(flow, branch.as_str().unwrap());
        }
        for id in strs(&case["explicit"]) {
            tags.mark_explicit_flow_id(&id);
        }
        let preserve: Option<IndexSet<String>> = case["preserve"]
            .as_array()
            .map(|_| strs(&case["preserve"]).into_iter().collect());
        let result =
            assign_stable_flow_ids(&mut elements, &mut flows, &mut tags, preserve.as_ref())
                .and_then(|()| assert_explicit_flow_ids_unique(&elements, &flows, &tags));
        let got = match result {
            Ok(()) => {
                serde_json::json!({ "ok": { "elements": json(&elements), "flows": json(&flows) } })
            }
            Err(error) => serde_json::json!({ "error": error }),
        };
        assert_eq!(got, norm(case["result"].clone()), "{}", case["name"]);
    }
}

#[test]
fn root_and_event_definition_ids() {
    let o = oracle();
    for case in o["roots"].as_array().unwrap() {
        let existing = strs(&case["existing"]);
        let id = root_definition_id(
            case["prefix"].as_str().unwrap(),
            case["source"].as_str().unwrap(),
            existing.iter().map(String::as_str),
        );
        assert_eq!(id, case["id"], "{case}");
    }
    for case in o["eventDefs"].as_array().unwrap() {
        let mut defs: Vec<BpmnEventDefinition> = to(&case["defs"]);
        assign_event_definition_ids(case["owner"].as_str().unwrap(), &mut defs);
        assert_eq!(json(&defs), norm(case["out"].clone()), "{case}");
    }
}

#[test]
fn rest_connector() {
    // Typed straight from the text: a `Value` would sort the header keys.
    #[derive(serde::Deserialize)]
    struct Rest {
        rest: Vec<Case>,
    }
    #[derive(serde::Deserialize)]
    struct Case {
        config: RestConnectorConfig,
    }
    let typed: Rest = serde_json::from_str(include_str!("oracle/helpers.json")).unwrap();
    for (case, typed) in oracle()["rest"].as_array().unwrap().iter().zip(typed.rest) {
        let config = typed.config;
        assert_eq!(
            json(&rest_connector_to_io_mapping_inputs(&config)),
            norm(case["inputs"].clone())
        );
        assert_eq!(
            json(&rest_connector_to_task_headers(&config)),
            norm(case["headers"].clone())
        );
        assert_eq!(rest_connector_retries(&config), case["retries"]);
    }
}

#[test]
fn created_shapes() {
    for case in oracle()["shapes"].as_array().unwrap() {
        let ty = BpmnElementType::parse(case["type"].as_str().unwrap()).unwrap();
        let el = create_flow_element(
            &format!("{ty}_1"),
            ty,
            CreateFlowElementOptions {
                name: Some("N".into()),
                documentation: Some("D".into()),
                extension_elements: None,
            },
        );
        assert_eq!(json(&el), norm(case["element"].clone()), "{ty}");
    }
}

#[test]
fn conditional_definitions_and_ensured_extensions() {
    let o = oracle();
    for case in o["conditionals"].as_array().unwrap() {
        let events = case["events"].as_array().map(|_| strs(&case["events"]));
        let def =
            make_conditional_definition(case["condition"].as_str().unwrap(), events.as_deref());
        assert_eq!(json(&def), norm(case["definition"].clone()), "{case}");
    }
    for case in o["ensures"].as_array().unwrap() {
        let mut ext: Vec<XmlElement> = to(&case["extensionElements"]);
        let result = ensure_zeebe_extension(
            case["type"].as_str().unwrap(),
            &mut ext,
            case["extension"].as_str().unwrap(),
        )
        .map(|el| {
            el.attributes.insert("marked".into(), "yes".into());
        });
        let got = match result {
            Ok(()) => serde_json::json!({ "ok": json(&ext) }),
            Err(error) => serde_json::json!({ "error": error }),
        };
        assert_eq!(got, norm(case["result"].clone()), "{case}");
    }
}
