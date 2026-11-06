//! Regression tests for `apply_auto_layout`, each the Rust twin of a TS test
//! (named in its doc comment) for a bug fixed on both sides.

use bpmnkit_bpmn::model::{BpmnBounds, BpmnDefinitions, BpmnWaypoint};
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_layout::{apply_auto_layout, LayoutEngine};
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
