//! Oracle tests for the grid engine: fixtures are TS `gridLayoutFlowNodes` output for the
//! first process of each conformance input (nodes: id, type, bounds, layer, position,
//! label, labelBounds, isExpanded; edges: id, refs, waypoints, label, labelBounds).

use bpmnkit_layout::grid::engine::grid_layout_flow_nodes;
use bpmnkit_layout::{Bounds, LayoutResult, Waypoint};
use serde_json::{json, Value};

fn bounds(b: &Bounds) -> Value {
    json!({"x": b.x, "y": b.y, "width": b.width, "height": b.height})
}

fn wps(w: &[Waypoint]) -> Value {
    Value::Array(w.iter().map(|p| json!({"x": p.x, "y": p.y})).collect())
}

fn to_json(r: &LayoutResult) -> Value {
    let nodes: Vec<Value> = r
        .nodes
        .iter()
        .map(|n| {
            let mut o = serde_json::Map::new();
            o.insert("id".into(), json!(n.id));
            o.insert("type".into(), json!(n.kind));
            o.insert("bounds".into(), bounds(&n.bounds));
            o.insert("layer".into(), json!(n.layer));
            o.insert("position".into(), json!(n.position));
            if let Some(l) = &n.label {
                o.insert("label".into(), json!(l));
            }
            if let Some(b) = &n.label_bounds {
                o.insert("labelBounds".into(), bounds(b));
            }
            if let Some(e) = n.is_expanded {
                o.insert("isExpanded".into(), json!(e));
            }
            Value::Object(o)
        })
        .collect();
    let edges: Vec<Value> = r
        .edges
        .iter()
        .map(|e| {
            let mut o = serde_json::Map::new();
            o.insert("id".into(), json!(e.id));
            o.insert("sourceRef".into(), json!(e.source_ref));
            o.insert("targetRef".into(), json!(e.target_ref));
            o.insert("waypoints".into(), wps(&e.waypoints));
            if let Some(l) = &e.label {
                o.insert("label".into(), json!(l));
            }
            if let Some(b) = &e.label_bounds {
                o.insert("labelBounds".into(), bounds(b));
            }
            Value::Object(o)
        })
        .collect();
    json!({"nodes": nodes, "edges": edges})
}

/// JSON ints and floats are different `Number`s; compare everything as f64.
fn normalize(v: Value) -> Value {
    match v {
        Value::Number(n) => json!(n.as_f64()),
        Value::Array(a) => Value::Array(a.into_iter().map(normalize).collect()),
        Value::Object(o) => Value::Object(o.into_iter().map(|(k, v)| (k, normalize(v))).collect()),
        other => other,
    }
}

fn check(name: &str) {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let xml = std::fs::read_to_string(
        root.join("../../conformance/bpmn")
            .join(name)
            .join("input.bpmn"),
    )
    .expect("input");
    let defs = bpmnkit_bpmn::parse_bpmn(&xml).expect("parse");
    let p = &defs.processes[0];
    let got = grid_layout_flow_nodes(&p.contents.flow_elements, &p.contents.sequence_flows);
    let want: Value = serde_json::from_str(
        &std::fs::read_to_string(
            root.join("tests/fixtures/grid")
                .join(format!("{name}.json")),
        )
        .expect("fixture"),
    )
    .expect("fixture json");
    assert_eq!(normalize(to_json(&got)), normalize(want), "{name}");
}

#[test]
fn sample_order_process() {
    check("sample-order-process");
}

#[test]
fn events_and_containers() {
    check("events-and-containers");
}

#[test]
fn miwg_a_4_0() {
    check("miwg-a-4-0");
}

#[test]
fn layout_kyc_onboarding() {
    check("layout-kyc-onboarding");
}

#[test]
fn compensation_subprocess() {
    check("compensation-subprocess");
}

#[test]
fn layout_quote_to_cash() {
    check("layout-quote-to-cash");
}

#[test]
fn miwg_c_1_0() {
    check("miwg-c-1-0");
}

#[test]
fn miwg_b_2_0() {
    check("miwg-b-2-0");
}

#[test]
fn empty_input_is_empty_result() {
    let r = grid_layout_flow_nodes(&[], &[]);
    assert!(r.nodes.is_empty() && r.edges.is_empty());
}
