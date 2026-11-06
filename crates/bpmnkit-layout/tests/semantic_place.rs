//! Oracle tests for `semantic/{graph,bands,place}.rs`: the fixture is dumped from the
//! TS build (`packages/core/dist/layout/semantic`) for the first process of each input,
//! with maps compared as ordered entry lists so insertion order is checked too.

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_layout::hash::{IndexMap, IndexSet};
use bpmnkit_layout::semantic::bands::assign_bands;
use bpmnkit_layout::semantic::graph::build_semantic_graph;
use bpmnkit_layout::semantic::place::{place, size_of};
use bpmnkit_layout::{GridFill, GridHint};
use serde_json::Value;
use std::path::PathBuf;

fn root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..")
}

fn strings(v: &Value) -> Vec<String> {
    v.as_array()
        .unwrap()
        .iter()
        .map(|s| s.as_str().unwrap().to_string())
        .collect()
}

fn flow_lists(v: &Value) -> Vec<(String, Vec<String>)> {
    v.as_array()
        .unwrap()
        .iter()
        .map(|e| (e[0].as_str().unwrap().to_string(), strings(&e[1])))
        .collect()
}

fn quad(v: &Value) -> [f64; 4] {
    let a = v.as_array().unwrap();
    [0, 1, 2, 3].map(|i| a[i].as_f64().unwrap())
}

#[test]
fn semantic_graph_bands_and_place_match_ts() {
    let path = root().join("crates/bpmnkit-layout/tests/fixtures/semantic/oracle.json");
    let cases: Value = serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
    let cases = cases.as_array().unwrap();
    assert!(cases.len() >= 10);

    for case in cases {
        let name = case["name"].as_str().unwrap();
        let xml = std::fs::read_to_string(root().join(case["file"].as_str().unwrap())).unwrap();
        let defs = parse_bpmn(&xml).unwrap();
        let process = &defs.processes[0];
        let flow_elements = &process.contents.flow_elements;
        let graph = build_semantic_graph(flow_elements, &process.contents.sequence_flows);

        // Graph.
        let g = &case["graph"];
        let ids: Vec<String> = graph.nodes.iter().map(|n| n.base().id.clone()).collect();
        assert_eq!(ids, strings(&g["nodes"]), "{name}: nodes");
        let by_id: Vec<String> = graph.by_id.keys().cloned().collect();
        assert_eq!(by_id, strings(&g["byId"]), "{name}: byId");
        let flows = |m: &IndexMap<String, Vec<&bpmnkit_bpmn::model::BpmnSequenceFlow>>| {
            m.iter()
                .map(|(k, v)| (k.clone(), v.iter().map(|f| f.id.clone()).collect()))
                .collect::<Vec<(String, Vec<String>)>>()
        };
        assert_eq!(
            flows(&graph.outgoing),
            flow_lists(&g["outgoing"]),
            "{name}: outgoing"
        );
        assert_eq!(
            flows(&graph.incoming),
            flow_lists(&g["incoming"]),
            "{name}: incoming"
        );
        let attachers: Vec<(String, Vec<String>)> = graph
            .attachers
            .iter()
            .map(|(k, v)| (k.clone(), v.iter().map(|e| e.base.id.clone()).collect()))
            .collect();
        assert_eq!(attachers, flow_lists(&g["attachers"]), "{name}: attachers");
        let back: Vec<String> = graph.back_edges.iter().cloned().collect();
        assert_eq!(back, strings(&g["backEdges"]), "{name}: backEdges");
        let components: Vec<Vec<String>> = g["components"]
            .as_array()
            .unwrap()
            .iter()
            .map(strings)
            .collect();
        assert_eq!(graph.components, components, "{name}: components");
        assert_eq!(graph.starts, strings(&g["starts"]), "{name}: starts");
        let ranks: Vec<(String, i64)> = graph.ranks.iter().map(|(k, v)| (k.clone(), *v)).collect();
        let want_ranks: Vec<(String, i64)> = g["ranks"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| (e[0].as_str().unwrap().to_string(), e[1].as_i64().unwrap()))
            .collect();
        assert_eq!(ranks, want_ranks, "{name}: ranks");

        // Bands.
        let titled: IndexSet<String> = strings(&case["titled"]).into_iter().collect();
        let layout = assign_bands(&graph, &titled);
        let b = &case["bands"];
        let bands: Vec<(String, i64)> = layout.bands.iter().map(|(k, v)| (k.clone(), *v)).collect();
        let want_bands: Vec<(String, i64)> = b["bands"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| (e[0].as_str().unwrap().to_string(), e[1].as_i64().unwrap()))
            .collect();
        assert_eq!(bands, want_bands, "{name}: bands");
        let spine: Vec<String> = layout.spine.iter().cloned().collect();
        assert_eq!(spine, strings(&b["spine"]), "{name}: spine");
        let straight: Vec<String> = layout.straight_flows.iter().cloned().collect();
        assert_eq!(
            straight,
            strings(&b["straightFlows"]),
            "{name}: straightFlows"
        );

        // Place.
        let sizes: IndexMap<String, (f64, f64)> = flow_elements
            .iter()
            .map(|el| (el.base().id.clone(), size_of(el, None)))
            .collect();
        let grid = case["grid"].as_object().map(|o| GridHint {
            columns: o.get("columns").and_then(|c| c.as_i64()),
            fill: o.get("fill").map(|f| match f.as_str().unwrap() {
                "column" => GridFill::Column,
                _ => GridFill::Row,
            }),
        });
        let placement = place(
            &graph,
            &layout,
            &sizes,
            process.lane_set.as_ref(),
            case["packLoose"].as_bool().unwrap(),
            &titled,
            grid.as_ref(),
            &IndexMap::default(),
        );
        let p = &case["place"];
        let bounds: Vec<(String, [f64; 4])> = placement
            .bounds
            .iter()
            .map(|(k, b)| (k.clone(), [b.x, b.y, b.width, b.height]))
            .collect();
        let want_bounds: Vec<(String, [f64; 4])> = p["bounds"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| (e[0].as_str().unwrap().to_string(), quad(&e[1])))
            .collect();
        assert_eq!(bounds, want_bounds, "{name}: bounds");
        let lanes: Vec<(String, [f64; 4])> = placement
            .lanes
            .iter()
            .map(|l| {
                (
                    l.id.clone(),
                    [l.bounds.x, l.bounds.y, l.bounds.width, l.bounds.height],
                )
            })
            .collect();
        let want_lanes: Vec<(String, [f64; 4])> = p["lanes"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| (e[0].as_str().unwrap().to_string(), quad(&e[1])))
            .collect();
        assert_eq!(lanes, want_lanes, "{name}: lanes");
        let gutter: Vec<(i64, f64)> = placement.gutter_x.iter().map(|(k, v)| (*k, *v)).collect();
        let want_gutter: Vec<(i64, f64)> = p["gutterX"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| (e[0].as_i64().unwrap(), e[1].as_f64().unwrap()))
            .collect();
        assert_eq!(gutter, want_gutter, "{name}: gutterX");
    }
}
