//! The layered engine on small processes, mirroring `packages/core/tests/layered-layout.test.ts`.
//! Exact coordinates are covered by the `conformance/layout/layered-*` cases.

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_layout::{layout_process, Bounds, LayoutEngine, LayoutResult, Waypoint};
use indexmap::IndexSet;

/// `kind:id` or `kind:id:extra` per node; `a>b` per flow (id `f<index>` unless `id=a>b`).
fn process(nodes: &[&str], flows: &[&str], lanes: &str) -> bpmnkit_bpmn::model::BpmnProcess {
    let mut xml = String::from(
        "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" id=\"d\" targetNamespace=\"t\"><process id=\"p\">",
    );
    xml.push_str(lanes);
    for n in nodes {
        let parts: Vec<&str> = n.split(':').collect();
        match parts[0] {
            "boundary" => xml.push_str(&format!(
                "<boundaryEvent id=\"{}\" attachedToRef=\"{}\"><errorEventDefinition/></boundaryEvent>",
                parts[1], parts[2]
            )),
            kind => xml.push_str(&format!("<{kind} id=\"{}\"/>", parts[1])),
        }
    }
    for (i, f) in flows.iter().enumerate() {
        let (id, ends) = f
            .split_once('=')
            .map_or((format!("f{}", i + 1), *f), |(a, b)| (a.to_string(), b));
        let (s, t) = ends.split_once('>').unwrap();
        xml.push_str(&format!(
            "<sequenceFlow id=\"{id}\" sourceRef=\"{s}\" targetRef=\"{t}\"/>"
        ));
    }
    xml.push_str("</process></definitions>");
    parse_bpmn(&xml).unwrap().processes.remove(0)
}

fn run(p: &bpmnkit_bpmn::model::BpmnProcess, engine: LayoutEngine) -> LayoutResult {
    layout_process(p, engine, &IndexSet::new(), None, false)
}

fn bounds(r: &LayoutResult, id: &str) -> Bounds {
    r.nodes.iter().find(|n| n.id == id).unwrap().bounds
}

fn edge<'a>(r: &'a LayoutResult, id: &str) -> &'a [Waypoint] {
    &r.edges.iter().find(|e| e.id == id).unwrap().waypoints
}

fn cx(b: &Bounds) -> f64 {
    b.x + b.width / 2.0
}

fn cy(b: &Bounds) -> f64 {
    b.y + b.height / 2.0
}

#[test]
fn linear_process_stays_on_one_straight_line() {
    let p = process(
        &[
            "startEvent:s",
            "serviceTask:a",
            "serviceTask:b",
            "endEvent:e",
        ],
        &["s>a", "a>b", "b>e"],
        "",
    );
    let r = run(&p, LayoutEngine::Layered);
    let ys: IndexSet<u64> = r.nodes.iter().map(|n| cy(&n.bounds).to_bits()).collect();
    assert_eq!(ys.len(), 1);
    for e in &r.edges {
        assert_eq!(e.waypoints.len(), 2, "{}", e.id);
    }
}

#[test]
fn detour_stacks_under_the_join_and_flows_up_into_it() {
    let p = process(
        &[
            "startEvent:s",
            "exclusiveGateway:g",
            "serviceTask:detour",
            "exclusiveGateway:j",
            "endEvent:e",
        ],
        &["s>g", "skip=g>j", "in=g>detour", "up=detour>j", "j>e"],
        "",
    );
    let r = run(&p, LayoutEngine::Layered);
    let detour = bounds(&r, "detour");
    let join = bounds(&r, "j");
    assert_eq!(cx(&detour), cx(&join));
    assert!(detour.y > join.y + join.height);
    assert_eq!(
        edge(&r, "up"),
        [
            Waypoint {
                x: cx(&join),
                y: detour.y
            },
            Waypoint {
                x: cx(&join),
                y: join.y + join.height
            },
        ]
    );
    assert_eq!(edge(&r, "skip").len(), 2);
}

#[test]
fn boundary_handler_drops_straight_down_from_its_event() {
    let p = process(
        &[
            "startEvent:s",
            "serviceTask:t",
            "boundary:b:t",
            "serviceTask:h",
            "endEvent:e",
            "endEvent:he",
        ],
        &["s>t", "t>e", "fb=b>h", "h>he"],
        "",
    );
    let r = run(&p, LayoutEngine::Layered);
    let event = bounds(&r, "b");
    let handler = bounds(&r, "h");
    assert_eq!(cx(&event), cx(&handler));
    let drop = edge(&r, "fb");
    assert_eq!(drop.len(), 2);
    assert_eq!(drop[0].y, event.y + event.height);
    assert_eq!(drop[1].y, handler.y);
}

#[test]
fn loop_runs_in_a_corridor_past_both_ends() {
    let p = process(
        &[
            "startEvent:s",
            "exclusiveGateway:m",
            "serviceTask:a",
            "exclusiveGateway:g",
            "endEvent:e",
        ],
        &["s>m", "m>a", "a>g", "back=g>m", "g>e"],
        "",
    );
    let r = run(&p, LayoutEngine::Layered);
    let back = edge(&r, "back");
    assert_eq!(back.len(), 4);
    assert_eq!(back[0].x, cx(&bounds(&r, "g")));
    assert_eq!(back[3].x, cx(&bounds(&r, "m")));
    assert_eq!(back[1].y, back[2].y);
}

#[test]
fn scope_with_lanes_falls_back_to_semantic() {
    let lanes = "<laneSet id=\"ls\"><lane id=\"l1\"><flowNodeRef>s</flowNodeRef><flowNodeRef>a</flowNodeRef></lane><lane id=\"l2\"><flowNodeRef>e</flowNodeRef></lane></laneSet>";
    let p = process(
        &["startEvent:s", "serviceTask:a", "endEvent:e"],
        &["s>a", "a>e"],
        lanes,
    );
    assert_eq!(
        run(&p, LayoutEngine::Layered),
        run(&p, LayoutEngine::Semantic)
    );
}
