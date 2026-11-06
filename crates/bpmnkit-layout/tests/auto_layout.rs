//! Regression tests for `apply_auto_layout`, each the Rust twin of a TS test
//! (named in its doc comment) for a bug fixed on both sides.

use bpmnkit_bpmn::model::{BpmnBounds, BpmnDefinitions, BpmnWaypoint};
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_layout::{apply_auto_layout, apply_auto_layout_owned, LayoutEngine};
use indexmap::IndexMap;

fn laid_out(xml: &str) -> BpmnDefinitions {
    let defs = parse_bpmn(xml).expect("parse");
    apply_auto_layout(&defs, LayoutEngine::Semantic, None)
}

fn shapes(defs: &BpmnDefinitions) -> IndexMap<String, BpmnBounds> {
    defs.diagrams[0]
        .plane
        .shapes
        .iter()
        .map(|s| (s.bpmn_element.clone(), s.bounds.clone()))
        .collect()
}

/// `collaboration-layout.test.ts`: "draws the annotations of a participant whose
/// process holds nothing else, inside its pool". Such a participant used to become
/// a 60 px black box and its annotations got no shapes at all.
#[test]
fn annotations_only_participant_gets_a_pool_around_its_annotations() {
    let laid = laid_out(
        r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="t">
<bpmn:collaboration id="C"><bpmn:participant id="PA" processRef="Pn" /><bpmn:participant id="PB" processRef="Pw" /><bpmn:participant id="PX" /></bpmn:collaboration>
<bpmn:process id="Pn"><bpmn:textAnnotation id="Ann1"><bpmn:text>Note</bpmn:text></bpmn:textAnnotation><bpmn:textAnnotation id="Ann2"><bpmn:text>Another</bpmn:text></bpmn:textAnnotation></bpmn:process>
<bpmn:process id="Pw"><bpmn:startEvent id="s" /><bpmn:task id="t" /><bpmn:endEvent id="e" /><bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t" /><bpmn:sequenceFlow id="f2" sourceRef="t" targetRef="e" /></bpmn:process>
</bpmn:definitions>"#,
    );
    let shapes = shapes(&laid);
    let pool = &shapes["PA"];
    let work = &shapes["PB"];
    let black_box = &shapes["PX"];
    for id in ["Ann1", "Ann2"] {
        let ann = shapes
            .get(id)
            .unwrap_or_else(|| panic!("{id} has no shape"));
        assert!(ann.x >= pool.x + 30.0, "{id} left of the pool's content");
        assert!(ann.y > pool.y);
        assert!(ann.x + ann.width < pool.x + pool.width);
        assert!(ann.y + ann.height < pool.y + pool.height);
    }
    // The black box still takes the width of the widest pool with content.
    assert_eq!(black_box.width, pool.width.max(work.width));
}

/// `auto-layout-keeps-di.test.ts`: "does not fall back to a taken id when the
/// element's own `X_di` is the one claimed twice". `A` takes the source id `B_di`
/// first, and `B`'s generated id is that same `B_di`, which used to skip the
/// collision check and emit it twice.
#[test]
fn di_ids_stay_unique_when_the_generated_id_is_the_taken_one() {
    let laid = laid_out(
        r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="D" targetNamespace="t">
<bpmn:process id="P"><bpmn:startEvent id="A" /><bpmn:task id="B" /><bpmn:sequenceFlow id="F" sourceRef="A" targetRef="B" /></bpmn:process>
<bpmndi:BPMNDiagram id="Dg"><bpmndi:BPMNPlane id="Pl" bpmnElement="P">
<bpmndi:BPMNShape id="B_di" bpmnElement="A"><dc:Bounds x="0" y="0" width="36" height="36" /></bpmndi:BPMNShape>
<bpmndi:BPMNShape id="B_di" bpmnElement="B"><dc:Bounds x="100" y="0" width="100" height="80" /></bpmndi:BPMNShape>
</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>"#,
    );
    let plane = &laid.diagrams[0].plane;
    let id_of = |element: &str| {
        plane
            .shapes
            .iter()
            .find(|s| s.bpmn_element == element)
            .map(|s| s.id.as_str())
    };
    assert_eq!(id_of("A"), Some("B_di"));
    assert_eq!(id_of("B"), Some("B_di_2"));
}

/// True when a segment of `route` enters the interior of `b`.
fn crosses(route: &[BpmnWaypoint], b: &BpmnBounds) -> bool {
    route.windows(2).any(|w| {
        let (a, c) = (&w[0], &w[1]);
        a.x.max(c.x) > b.x
            && a.x.min(c.x) < b.x + b.width
            && a.y.max(c.y) > b.y
            && a.y.min(c.y) < b.y + b.height
    })
}

/// `layout-routing.test.ts`: "re-routes an association of a nested sub-process that
/// runs through a shape". Only the process's own associations were registered for
/// repair, so the straight line from `se` to `N` cut through task `C`.
#[test]
fn nested_sub_process_associations_are_repaired() {
    let laid = laid_out(
        r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="t">
<bpmn:process id="P"><bpmn:startEvent id="s"/><bpmn:subProcess id="Sub">
<bpmn:startEvent id="ss"/><bpmn:task id="A" name="A"/><bpmn:task id="B" name="B"/><bpmn:task id="C" name="C"/><bpmn:endEvent id="se"/>
<bpmn:sequenceFlow id="f1" sourceRef="ss" targetRef="A"/><bpmn:sequenceFlow id="f2" sourceRef="A" targetRef="B"/><bpmn:sequenceFlow id="f3" sourceRef="B" targetRef="C"/><bpmn:sequenceFlow id="f4" sourceRef="C" targetRef="se"/>
<bpmn:textAnnotation id="N"><bpmn:text>Shared note</bpmn:text></bpmn:textAnnotation>
<bpmn:association id="As1" sourceRef="A" targetRef="N"/><bpmn:association id="As2" sourceRef="C" targetRef="N"/><bpmn:association id="As3" sourceRef="se" targetRef="N"/><bpmn:association id="As4" sourceRef="ss" targetRef="N"/>
</bpmn:subProcess><bpmn:endEvent id="e"/>
<bpmn:sequenceFlow id="g1" sourceRef="s" targetRef="Sub"/><bpmn:sequenceFlow id="g2" sourceRef="Sub" targetRef="e"/>
</bpmn:process></bpmn:definitions>"#,
    );
    let c = &shapes(&laid)["C"];
    let edge = laid.diagrams[0]
        .plane
        .edges
        .iter()
        .find(|e| e.bpmn_element == "As3")
        .expect("As3 drawn");
    assert!(edge
        .waypoints
        .windows(2)
        .all(|w| w[0].x == w[1].x || w[0].y == w[1].y));
    assert!(!crosses(&edge.waypoints, c), "As3 runs through C");
}

/// `auto-layout-keeps-di.test.ts`: "keeps each root process on its own source diagram
/// when the first one draws another process". The primary plane used to take the first
/// source diagram's ids, which the second process's plane kept too: two diagrams, one id.
#[test]
fn root_processes_keep_their_own_source_diagram_ids() {
    let xml = std::fs::read_to_string(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../conformance/layout/edge-existing-di-diagram-order/input.bpmn"
    ))
    .expect("input");
    let laid = laid_out(&xml);
    let ids: Vec<_> = laid
        .diagrams
        .iter()
        .map(|d| {
            (
                d.id.as_str(),
                d.plane.id.as_str(),
                d.plane.bpmn_element.as_str(),
            )
        })
        .collect();
    assert_eq!(
        ids,
        [
            ("DiagramA", "PlaneA", "ProcessA"),
            ("DiagramB", "PlaneB", "ProcessB")
        ]
    );
}

const NS: &str =
    r#"xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="t""#;

const LANES: &str = r#"<bpmn:process id="P"><bpmn:laneSet id="LS">
<bpmn:lane id="L1"><bpmn:flowNodeRef>s</bpmn:flowNodeRef><bpmn:flowNodeRef>a</bpmn:flowNodeRef></bpmn:lane>
<bpmn:lane id="L2"><bpmn:flowNodeRef>b</bpmn:flowNodeRef><bpmn:flowNodeRef>e</bpmn:flowNodeRef></bpmn:lane>
</bpmn:laneSet>
<bpmn:startEvent id="s" /><bpmn:task id="a" /><bpmn:task id="b" /><bpmn:endEvent id="e" />
<bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="a" /><bpmn:sequenceFlow id="f2" sourceRef="a" targetRef="b" /><bpmn:sequenceFlow id="f3" sourceRef="b" targetRef="e" />
</bpmn:process>"#;

fn definitions(body: &str) -> String {
    format!("<bpmn:definitions {NS}>{body}</bpmn:definitions>")
}

fn inside(x: f64, y: f64, w: f64, h: f64, outer: &BpmnBounds) -> bool {
    x >= outer.x
        && y >= outer.y
        && x + w <= outer.x + outer.width
        && y + h <= outer.y + outer.height
}

/// `layout-lanes-annotations.test.ts`: "draws the semantic engine's lane bands
/// around their nodes, header clear". The engine placed nodes in lane bands, but
/// no lane shapes were written, so the bands were invisible.
#[test]
fn process_lanes_outside_a_pool_are_drawn_around_their_nodes() {
    let shapes = shapes(&laid_out(&definitions(LANES)));
    let (l1, l2) = (&shapes["L1"], &shapes["L2"]);
    assert_eq!(l1.x, 0.0);
    assert_eq!(l2.y, l1.y + l1.height);
    for (id, lane) in [("s", l1), ("a", l1), ("b", l2), ("e", l2)] {
        let n = &shapes[id];
        assert!(
            inside(n.x, n.y, n.width, n.height, lane),
            "{id} outside its lane"
        );
        assert!(n.x >= lane.x + 30.0, "{id} under the lane header");
    }
}

/// `layout-lanes-annotations.test.ts`: "tiles lanes over the content with the grid engine".
#[test]
fn process_lanes_outside_a_pool_are_tiled_by_the_grid_engine() {
    let defs = parse_bpmn(&definitions(LANES)).expect("parse");
    let shapes = shapes(&apply_auto_layout(&defs, LayoutEngine::Grid, None));
    let (l1, l2) = (&shapes["L1"], &shapes["L2"]);
    let top = l1.y.min(l2.y);
    let bottom = (l1.y + l1.height).max(l2.y + l2.height);
    for id in ["s", "a", "b", "e"] {
        let n = &shapes[id];
        assert!(
            n.y >= top && n.y + n.height <= bottom,
            "{id} outside the lanes"
        );
        assert!(n.x >= 30.0, "{id} under the lane header");
    }
}

/// `layout-lanes-annotations.test.ts`: "draws the lanes of a second root process
/// on that process's own plane".
#[test]
fn second_root_process_draws_its_lanes_on_its_own_plane() {
    let body = format!(r#"<bpmn:process id="Q"><bpmn:startEvent id="q" /></bpmn:process>{LANES}"#);
    let laid = laid_out(&definitions(&body));
    assert!(!shapes(&laid).contains_key("L1"));
    let plane = &laid
        .diagrams
        .iter()
        .find(|d| d.plane.bpmn_element == "P")
        .expect("plane for P")
        .plane;
    for id in ["L1", "L2"] {
        assert!(
            plane.shapes.iter().any(|s| s.bpmn_element == id),
            "{id} missing"
        );
    }
}

fn edge_points(defs: &BpmnDefinitions, id: &str) -> Vec<(f64, f64)> {
    defs.diagrams[0]
        .plane
        .edges
        .iter()
        .find(|e| e.bpmn_element == id)
        .unwrap_or_else(|| panic!("{id} has no edge"))
        .waypoints
        .iter()
        .map(|w| (w.x, w.y))
        .collect()
}

/// `layout-lanes-annotations.test.ts`: "draws them and packs the linked
/// annotation beside its partner". Only an annotation linked to a flow node got
/// its association drawn.
#[test]
fn association_between_two_annotations_is_drawn() {
    let laid = laid_out(&definitions(
        r#"<bpmn:process id="P"><bpmn:startEvent id="s" /><bpmn:task id="t" /><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="t" />
<bpmn:textAnnotation id="N1"><bpmn:text>On t</bpmn:text></bpmn:textAnnotation>
<bpmn:textAnnotation id="N2"><bpmn:text>On N1</bpmn:text></bpmn:textAnnotation>
<bpmn:association id="a1" sourceRef="t" targetRef="N1" /><bpmn:association id="a2" sourceRef="N2" targetRef="N1" />
</bpmn:process>"#,
    ));
    let shapes = shapes(&laid);
    let (n1, n2) = (&shapes["N1"], &shapes["N2"]);
    let points = edge_points(&laid, "a2");
    assert_eq!(points.len(), 2);
    assert!(inside(points[0].0, points[0].1, 0.0, 0.0, n2));
    assert!(inside(points[1].0, points[1].1, 0.0, 0.0, n1));
    assert!((n2.x - n1.x).abs() <= n1.width);
    assert!((n2.y - n1.y).abs() <= n1.height + 40.0);
}

/// `layout-lanes-annotations.test.ts`: "draws them inside a pool that holds only annotations".
#[test]
fn association_between_two_annotations_is_drawn_in_an_annotation_only_pool() {
    let laid = laid_out(&definitions(
        r#"<bpmn:collaboration id="C"><bpmn:participant id="PA" processRef="Pn" /><bpmn:participant id="PB" processRef="Pw" /></bpmn:collaboration>
<bpmn:process id="Pn"><bpmn:textAnnotation id="A1"><bpmn:text>Note</bpmn:text></bpmn:textAnnotation><bpmn:textAnnotation id="A2"><bpmn:text>Another</bpmn:text></bpmn:textAnnotation><bpmn:association id="a" sourceRef="A1" targetRef="A2" /></bpmn:process>
<bpmn:process id="Pw"><bpmn:startEvent id="s" /><bpmn:endEvent id="e" /><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="e" /></bpmn:process>"#,
    ));
    let pool = &shapes(&laid)["PA"];
    for (x, y) in edge_points(&laid, "a") {
        assert!(inside(x, y, 0.0, 0.0, pool), "({x}, {y}) outside the pool");
    }
}

/// `apply_auto_layout_owned` moves the model instead of copying it; the output must
/// not change. Covers a plain process, pools with lanes and message flows, nested
/// sub-processes, existing DI with several diagrams, and a model with no process.
#[test]
fn owned_variant_matches_borrowing_variant() {
    let root = std::path::Path::new(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../conformance/bpmn"
    ));
    for case in [
        "sample-order-process",
        "collaboration",
        "miwg-a-4-0",
        "miwg-c-10-0",
        "compensation-subprocess",
        "root-elements",
    ] {
        let xml = std::fs::read_to_string(root.join(case).join("input.bpmn")).unwrap();
        let defs = parse_bpmn(&xml).unwrap_or_else(|e| panic!("{case}: {e:?}"));
        for engine in [LayoutEngine::Semantic, LayoutEngine::Grid] {
            let borrowed = serialize_bpmn(&apply_auto_layout(&defs, engine, None));
            let owned = serialize_bpmn(&apply_auto_layout_owned(defs.clone(), engine, None));
            assert_eq!(owned, borrowed, "{case} {engine:?}");
        }
    }
    let empty = parse_bpmn(
        r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="t" />"#,
    )
    .expect("parse");
    assert_eq!(
        apply_auto_layout_owned(empty.clone(), LayoutEngine::Semantic, None),
        apply_auto_layout(&empty, LayoutEngine::Semantic, None)
    );
}
