//! `repair_routes` against TS dumps (see fixtures/repair).

use bpmnkit_layout::repair::{repair_routes, ConnectionKind, PlaneEdge, PlaneShape};
use bpmnkit_layout::{Bounds, Waypoint};
use serde_json::Value;

fn f(v: &Value) -> f64 {
    v.as_f64().unwrap()
}

fn wps(v: &Value) -> Vec<Waypoint> {
    v.as_array()
        .unwrap()
        .iter()
        .map(|w| Waypoint {
            x: f(&w["x"]),
            y: f(&w["y"]),
        })
        .collect()
}

// `route_orthogonal` is a stub in the worktree this was written in; enable once ported.
#[test]
#[ignore = "needs orthogonal"]
fn repair_routes_matches_ts() {
    let raw = include_str!("fixtures/repair/repair.json");
    let cases: Vec<Value> = serde_json::from_str(raw).unwrap();
    assert!(!cases.is_empty());
    for case in &cases {
        let name = format!("{}:{}", case["file"], case["process"]);
        let shapes: Vec<PlaneShape> = case["shapes"]
            .as_array()
            .unwrap()
            .iter()
            .map(|s| PlaneShape {
                id: s["id"].as_str().unwrap().to_string(),
                bounds: Bounds {
                    x: f(&s["bounds"]["x"]),
                    y: f(&s["bounds"]["y"]),
                    width: f(&s["bounds"]["width"]),
                    height: f(&s["bounds"]["height"]),
                },
                container: s["container"].as_bool().unwrap(),
            })
            .collect();
        let mut edges: Vec<PlaneEdge> = case["input"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| PlaneEdge {
                kind: match e["kind"].as_str().unwrap() {
                    "message" => ConnectionKind::Message,
                    "association" => ConnectionKind::Association,
                    _ => ConnectionKind::Sequence,
                },
                source_ref: e["sourceRef"].as_str().unwrap().to_string(),
                target_ref: e["targetRef"].as_str().unwrap().to_string(),
                waypoints: wps(&e["waypoints"]),
            })
            .collect();
        repair_routes(&shapes, &mut edges, &|_| Vec::new(), &|_| None);
        let got: Vec<Vec<Waypoint>> = edges.into_iter().map(|e| e.waypoints).collect();
        let want: Vec<Vec<Waypoint>> = case["expected"]
            .as_array()
            .unwrap()
            .iter()
            .map(wps)
            .collect();
        assert_eq!(got, want, "{name}");
    }
}
