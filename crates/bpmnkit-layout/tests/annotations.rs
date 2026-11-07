//! `pack_annotations` / `association_waypoints` against TS dumps (see fixtures/annotations).

use bpmnkit_bpmn::model::BpmnProcess;
use bpmnkit_layout::annotations::{association_waypoints, pack_annotations};
use bpmnkit_layout::{AnnotationSide, Bounds, LayoutEdge, LayoutNode, Waypoint};
use indexmap::IndexMap;
use serde_json::Value;

fn f(v: &Value) -> f64 {
    v.as_f64().unwrap()
}

fn bounds(v: &Value) -> Bounds {
    Bounds {
        x: f(&v["x"]),
        y: f(&v["y"]),
        width: f(&v["width"]),
        height: f(&v["height"]),
    }
}

fn fixture() -> Value {
    let raw = include_str!("fixtures/annotations/pack.json");
    serde_json::from_str(raw).unwrap()
}

fn side(s: &str) -> AnnotationSide {
    match s {
        "above" => AnnotationSide::Above,
        "below" => AnnotationSide::Below,
        "left" => AnnotationSide::Left,
        _ => AnnotationSide::Right,
    }
}

/// Sorted by id: serde_json objects do not keep the TS insertion order, and the
/// order of the result map is not what these cases are about.
fn expected_map(v: &Value) -> Vec<(String, Bounds)> {
    let mut out: Vec<(String, Bounds)> = v
        .as_object()
        .unwrap()
        .iter()
        .map(|(k, b)| (k.clone(), bounds(b)))
        .collect();
    out.sort_by(|a, b| a.0.cmp(&b.0));
    out
}

fn sorted(m: IndexMap<String, Bounds>) -> Vec<(String, Bounds)> {
    let mut out: Vec<_> = m.into_iter().collect();
    out.sort_by(|a, b| a.0.cmp(&b.0));
    out
}

#[test]
fn pack_annotations_matches_ts() {
    let fx = fixture();
    let cases = fx["cases"].as_array().unwrap();
    assert!(cases.len() >= 9);
    for case in cases {
        let name = case["file"].as_str().unwrap();
        let process: BpmnProcess = serde_json::from_value(case["process"].clone()).unwrap();
        let nodes: Vec<LayoutNode> = case["nodes"]
            .as_array()
            .unwrap()
            .iter()
            .map(|n| LayoutNode {
                id: n["id"].as_str().unwrap().to_string(),
                bounds: bounds(&n["bounds"]),
                label_bounds: n.get("labelBounds").filter(|b| !b.is_null()).map(bounds),
                ..LayoutNode::default()
            })
            .collect();
        let edges: Vec<LayoutEdge> = case["edges"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| LayoutEdge {
                id: e["id"].as_str().unwrap().to_string(),
                waypoints: e["waypoints"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .map(|w| Waypoint {
                        x: f(&w["x"]),
                        y: f(&w["y"]),
                    })
                    .collect(),
                ..LayoutEdge::default()
            })
            .collect();

        let got = pack_annotations(&process, &nodes, &edges, None);
        let want = expected_map(&case["expected"]);
        assert_eq!(sorted(got), want, "{name} (no sides)");

        let sides: IndexMap<String, AnnotationSide> = case["sides"]
            .as_object()
            .unwrap()
            .iter()
            .map(|(k, v)| (k.clone(), side(v.as_str().unwrap())))
            .collect();
        let got = pack_annotations(&process, &nodes, &edges, Some(&sides));
        let want = expected_map(&case["expectedSides"]);
        assert_eq!(sorted(got), want, "{name} (sides)");
    }
}

#[test]
fn association_waypoints_matches_ts() {
    let fx = fixture();
    let cases = fx["assoc"].as_array().unwrap();
    assert!(cases.len() >= 5);
    for (n, case) in cases.iter().enumerate() {
        let (p_elem, p_ann) =
            association_waypoints(&bounds(&case["element"]), &bounds(&case["annotation"]));
        let e = &case["expected"];
        assert_eq!(
            (p_elem.x, p_elem.y, p_ann.x, p_ann.y),
            (
                f(&e["pElem"]["x"]),
                f(&e["pElem"]["y"]),
                f(&e["pAnn"]["x"]),
                f(&e["pAnn"]["y"])
            ),
            "case {n}"
        );
    }
}

#[test]
fn no_annotations_gives_empty_map() {
    let process: BpmnProcess = serde_json::from_str(r#"{"id":"p"}"#).unwrap();
    assert!(pack_annotations(&process, &[], &[], None).is_empty());
}
