//! `route_flows` and `semantic_layout_process` against TS `routeFlows` /
//! `semanticLayoutProcess`, dumped by `fixtures/semantic/dump.mjs` for a few
//! conformance diagrams. Every scope `semanticLayout` routes (top level and each
//! sub-process) is one `route_flows` case: its graph, bounds, band layout and
//! gutters come from the dump, so routing is tested without the other modules.

use bpmnkit_bpmn::model::{
    BpmnBoundaryEvent, BpmnDefinitions, BpmnFlowElement, BpmnProcessContents, BpmnSequenceFlow,
};
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_layout::hash::{IndexMap, IndexSet};
use bpmnkit_layout::semantic::bands::BandLayout;
use bpmnkit_layout::semantic::graph::SemanticGraph;
use bpmnkit_layout::semantic::route::route_flows;
use bpmnkit_layout::semantic::semantic_layout_process;
use bpmnkit_layout::{Bounds, LaneBand, LayoutEdge, LayoutNode, LayoutResult, Plane, Waypoint};
use serde_json::Value;
use std::cell::RefCell;

const CONFORMANCE: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/bpmn");

fn fixture() -> Vec<Value> {
    // SEMANTIC_FIXTURE points at a larger local dump (e.g. every conformance diagram).
    let text = match std::env::var("SEMANTIC_FIXTURE") {
        Ok(path) => std::fs::read_to_string(path).expect("SEMANTIC_FIXTURE"),
        Err(_) => include_str!("fixtures/semantic/cases.json").to_string(),
    };
    serde_json::from_str::<Value>(&text)
        .expect("fixture")
        .as_array()
        .expect("cases")
        .clone()
}

fn defs(name: &str) -> BpmnDefinitions {
    let xml = std::fs::read_to_string(format!("{CONFORMANCE}/{name}/input.bpmn")).expect("input");
    parse_bpmn(&xml).expect("parse")
}

fn str_of(v: &Value) -> String {
    v.as_str().expect("string").to_string()
}

fn strs(v: &Value) -> Vec<String> {
    v.as_array().expect("array").iter().map(str_of).collect()
}

fn num(v: &Value) -> f64 {
    v.as_f64().expect("number")
}

fn bounds(v: &Value) -> Bounds {
    Bounds {
        x: num(&v["x"]),
        y: num(&v["y"]),
        width: num(&v["width"]),
        height: num(&v["height"]),
    }
}

fn opt_bounds(v: Option<&Value>) -> Option<Bounds> {
    v.filter(|b| !b.is_null()).map(bounds)
}

fn waypoints(v: &Value) -> Vec<Waypoint> {
    v.as_array()
        .expect("waypoints")
        .iter()
        .map(|p| Waypoint {
            x: num(&p["x"]),
            y: num(&p["y"]),
        })
        .collect()
}

fn edge(v: &Value) -> LayoutEdge {
    LayoutEdge {
        id: str_of(&v["id"]),
        source_ref: str_of(&v["sourceRef"]),
        target_ref: str_of(&v["targetRef"]),
        waypoints: waypoints(&v["waypoints"]),
        label: v.get("label").map(str_of),
        label_bounds: opt_bounds(v.get("labelBounds")),
    }
}

fn node(v: &Value) -> LayoutNode {
    LayoutNode {
        id: str_of(&v["id"]),
        kind: str_of(&v["type"]),
        bounds: bounds(&v["bounds"]),
        layer: v["layer"].as_i64().expect("layer"),
        position: v["position"].as_i64().expect("position"),
        grid_row: v.get("gridRow").and_then(Value::as_i64),
        label: v.get("label").map(str_of),
        label_bounds: opt_bounds(v.get("labelBounds")),
        is_expanded: v.get("isExpanded").and_then(Value::as_bool),
    }
}

fn result(v: &Value) -> LayoutResult {
    LayoutResult {
        nodes: v["nodes"]
            .as_array()
            .expect("nodes")
            .iter()
            .map(node)
            .collect(),
        edges: v["edges"]
            .as_array()
            .expect("edges")
            .iter()
            .map(edge)
            .collect(),
        lanes: v.get("lanes").map(|l| {
            l.as_array()
                .expect("lanes")
                .iter()
                .map(|lane| LaneBand {
                    id: str_of(&lane["id"]),
                    bounds: bounds(&lane["bounds"]),
                })
                .collect()
        }),
        planes: v.get("planes").map(|p| {
            p.as_array()
                .expect("planes")
                .iter()
                .map(|plane| Plane {
                    element_id: str_of(&plane["elementId"]),
                    result: result(&plane["result"]),
                })
                .collect()
        }),
    }
}

/// Every flow element and every scope's contents, at any depth.
fn walk<'a>(
    contents: &'a BpmnProcessContents,
    elements: &mut IndexMap<String, &'a BpmnFlowElement>,
    scopes: &mut Vec<&'a BpmnProcessContents>,
) {
    scopes.push(contents);
    for el in &contents.flow_elements {
        elements.insert(el.base().id.clone(), el);
        if let Some(inner) = el.contents() {
            walk(inner, elements, scopes);
        }
    }
}

fn flow_map<'a>(scopes: &[&'a BpmnProcessContents]) -> IndexMap<String, &'a BpmnSequenceFlow> {
    let mut out = IndexMap::default();
    for s in scopes {
        for f in &s.sequence_flows {
            out.insert(f.id.clone(), f);
        }
    }
    out
}

fn graph_of<'a>(
    v: &Value,
    elements: &IndexMap<String, &'a BpmnFlowElement>,
    flows: &IndexMap<String, &'a BpmnSequenceFlow>,
) -> SemanticGraph<'a> {
    let el = |id: &Value| -> &'a BpmnFlowElement { elements[id.as_str().expect("id")] };
    let flow_lists = |v: &Value| -> IndexMap<String, Vec<&'a BpmnSequenceFlow>> {
        v.as_array()
            .expect("map")
            .iter()
            .map(|e| {
                let list = e[1]
                    .as_array()
                    .expect("flows")
                    .iter()
                    .map(|f| flows[f.as_str().expect("flow id")])
                    .collect();
                (str_of(&e[0]), list)
            })
            .collect()
    };
    let attachers = v["attachers"]
        .as_array()
        .expect("attachers")
        .iter()
        .map(|e| {
            let list: Vec<&'a BpmnBoundaryEvent> = e[1]
                .as_array()
                .expect("events")
                .iter()
                .map(|id| match el(id) {
                    BpmnFlowElement::BoundaryEvent(b) => b,
                    other => panic!("not a boundary event: {}", other.base().id),
                })
                .collect();
            (str_of(&e[0]), list)
        })
        .collect();
    SemanticGraph {
        nodes: v["nodes"]
            .as_array()
            .expect("nodes")
            .iter()
            .map(el)
            .collect(),
        by_id: v["byId"]
            .as_array()
            .expect("byId")
            .iter()
            .map(|id| (str_of(id), el(id)))
            .collect(),
        outgoing: flow_lists(&v["outgoing"]),
        incoming: flow_lists(&v["incoming"]),
        attachers,
        back_edges: strs(&v["backEdges"]).into_iter().collect(),
        components: v["components"]
            .as_array()
            .expect("components")
            .iter()
            .map(strs)
            .collect(),
        starts: strs(&v["starts"]),
        ranks: v["ranks"]
            .as_array()
            .expect("ranks")
            .iter()
            .map(|e| (str_of(&e[0]), e[1].as_i64().expect("rank")))
            .collect(),
        end_reach: RefCell::new(None),
    }
}

#[test]
fn route_flows_matches_ts() {
    let mut checked = 0;
    for case in fixture() {
        let name = str_of(&case["name"]);
        let defs = defs(&name);
        let process = defs
            .processes
            .iter()
            .find(|p| p.id == str_of(&case["process"]))
            .expect("process");
        let mut elements = IndexMap::default();
        let mut scopes = Vec::new();
        walk(&process.contents, &mut elements, &mut scopes);
        let flows = flow_map(&scopes);

        for (k, route) in case["routes"]
            .as_array()
            .expect("routes")
            .iter()
            .enumerate()
        {
            let flow_ids = strs(&route["flows"]);
            // routeFlows gets one scope's own sequenceFlows array.
            let scope_flows: &[BpmnSequenceFlow] = scopes
                .iter()
                .map(|s| s.sequence_flows.as_slice())
                .find(|fs| fs.iter().map(|f| &f.id).eq(flow_ids.iter()))
                .expect("scope with these flows");
            let graph = graph_of(&route["graph"], &elements, &flows);
            let bounds: IndexMap<String, Bounds> = route["bounds"]
                .as_array()
                .expect("bounds")
                .iter()
                .map(|e| (str_of(&e[0]), bounds(&e[1])))
                .collect();
            let bl = &route["bandLayout"];
            let band_layout = BandLayout {
                bands: bl["bands"]
                    .as_array()
                    .expect("bands")
                    .iter()
                    .map(|e| (str_of(&e[0]), e[1].as_i64().expect("band")))
                    .collect(),
                spine: strs(&bl["spine"]).into_iter().collect::<IndexSet<_>>(),
                straight_flows: strs(&bl["straightFlows"]).into_iter().collect(),
            };
            let gutter_x: IndexMap<i64, f64> = route["gutterX"]
                .as_array()
                .expect("gutterX")
                .iter()
                .map(|e| (e[0].as_i64().expect("rank"), num(&e[1])))
                .collect();
            let expected: Vec<LayoutEdge> = route["edges"]
                .as_array()
                .expect("edges")
                .iter()
                .map(edge)
                .collect();
            let actual = route_flows(&graph, scope_flows, &bounds, &band_layout, &gutter_x);
            assert_eq!(actual, expected, "{name} / {} scope {k}", case["process"]);
            checked += 1;
        }
    }
    assert!(checked > 0);
}

#[test]
fn semantic_layout_process_matches_ts() {
    for case in fixture() {
        let name = str_of(&case["name"]);
        let defs = defs(&name);
        let process = defs
            .processes
            .iter()
            .find(|p| p.id == str_of(&case["process"]))
            .expect("process");
        let actual = semantic_layout_process(process, &indexmap::IndexSet::default(), None);
        assert_eq!(
            actual,
            result(&case["result"]),
            "{name} / {}",
            case["process"]
        );
    }
}
