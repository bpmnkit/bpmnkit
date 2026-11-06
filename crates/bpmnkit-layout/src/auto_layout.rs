//! Twin of `bpmn/auto-layout.ts`.

use crate::annotations::{association_waypoints, pack_annotations};
use crate::collaboration::alignment::{align_pools, MessageLink};
use crate::collaboration::ordering::{order_pools, PoolLink};
use crate::engine::{layout_process, LayoutEngine};
use crate::grid::router::collapse_collinear;
use crate::hash::{IndexMap as FxIndexMap, IndexSet as FxIndexSet};
use crate::js;
use crate::orthogonal::Side;
use crate::repair::{repair_routes, ConnectionKind, PlaneEdge, PlaneShape};
use crate::types::{
    Bounds, LaneBand, LayoutEdge, LayoutHints, LayoutNode, LayoutResult, Plane, Waypoint,
};
use bpmnkit_bpmn::model::{
    BpmnBounds, BpmnCollaboration, BpmnDefinitions, BpmnDiEdge, BpmnDiLabel, BpmnDiPlane,
    BpmnDiShape, BpmnDiagram, BpmnFlowElement, BpmnLane, BpmnLaneSet, BpmnProcess, BpmnWaypoint,
};
use bpmnkit_bpmn::Attrs;
use indexmap::{IndexMap, IndexSet};
use std::borrow::Cow;

const POOL_HEADER: f64 = 30.0;
const LANE_HEADER: f64 = 30.0;
const PADDING: f64 = 20.0;
const POOL_GAP: f64 = 30.0;

const EMPTY_POOL_HEIGHT: f64 = 60.0;
/// Sideways step when nudging a message flow out of a shape.
const MESSAGE_FLOW_STEP: f64 = 10.0;
/// Stub a message flow leaves its element by before it may jog sideways.
const MESSAGE_FLOW_STEM: f64 = 20.0;
/// Stagger between the stems of consecutive flows.
const MESSAGE_FLOW_STEM_STEP: f64 = 8.0;
/// Step and reach of that sideways jog.
const MESSAGE_FLOW_JOG: f64 = 20.0;
const MESSAGE_FLOW_MAX_JOG: f64 = 2400.0;
const EMPTY_POOL_WIDTH: f64 = 300.0;

#[derive(Debug, Clone, Copy)]
struct BBox {
    min_x: f64,
    min_y: f64,
    max_x: f64,
    max_y: f64,
}

/// `contentBbox(nodes, extra)`.
fn content_bbox<'a>(nodes: &[LayoutNode], extra: impl IntoIterator<Item = &'a Bounds>) -> BBox {
    let mut b = BBox {
        min_x: f64::INFINITY,
        min_y: f64::INFINITY,
        max_x: f64::NEG_INFINITY,
        max_y: f64::NEG_INFINITY,
    };
    let mut add = |r: &Bounds| {
        b.min_x = js::min(b.min_x, r.x);
        b.min_y = js::min(b.min_y, r.y);
        b.max_x = js::max(b.max_x, r.x + r.width);
        b.max_y = js::max(b.max_y, r.y + r.height);
    };
    for n in nodes {
        add(&n.bounds);
        if let Some(lb) = &n.label_bounds {
            add(lb);
        }
    }
    for r in extra {
        add(r);
    }
    b
}

fn wp(x: f64, y: f64) -> BpmnWaypoint {
    BpmnWaypoint {
        x,
        y,
        unknown_attributes: None,
    }
}

fn rounded_bounds(b: &Bounds, dx: f64, dy: f64) -> BpmnBounds {
    BpmnBounds {
        x: js::round(b.x + dx),
        y: js::round(b.y + dy),
        width: js::round(b.width),
        height: js::round(b.height),
    }
}

fn new_shape(element: &str, bounds: BpmnBounds) -> BpmnDiShape {
    BpmnDiShape {
        id: format!("{element}_di"),
        bpmn_element: element.to_string(),
        is_marker_visible: None,
        is_expanded: None,
        is_horizontal: None,
        bounds,
        label: None,
        unknown_attributes: Attrs::new(),
    }
}

fn new_edge(element: &str, waypoints: Vec<BpmnWaypoint>) -> BpmnDiEdge {
    BpmnDiEdge {
        id: format!("{element}_di"),
        bpmn_element: element.to_string(),
        waypoints,
        label: None,
        unknown_attributes: Attrs::new(),
    }
}

/// `nodeToShape(node, dx, dy)`.
fn node_to_shape(node: &LayoutNode, dx: f64, dy: f64) -> BpmnDiShape {
    let mut shape = new_shape(&node.id, rounded_bounds(&node.bounds, dx, dy));
    if node.is_expanded.is_some() {
        shape.is_expanded = node.is_expanded;
    }
    // The bpmn-js Viewer draws the "X" only when the shape says so; the Modeler
    // assumes it. `keepDiAttributes` lets an explicit value in the source win.
    if node.kind == "exclusiveGateway" {
        shape.is_marker_visible = Some(true);
    }
    if let Some(lb) = &node.label_bounds {
        shape.label = Some(BpmnDiLabel {
            bounds: Some(rounded_bounds(lb, dx, dy)),
            unknown_attributes: None,
        });
    }
    shape
}

/// `edgeToShape(edge, dx, dy)`.
fn edge_to_shape(edge: &LayoutEdge, dx: f64, dy: f64) -> BpmnDiEdge {
    let waypoints = edge
        .waypoints
        .iter()
        .map(|p| wp(js::round(p.x + dx), js::round(p.y + dy)))
        .collect();
    let mut di = new_edge(&edge.id, waypoints);
    if let Some(lb) = &edge.label_bounds {
        di.label = Some(BpmnDiLabel {
            bounds: Some(rounded_bounds(lb, dx, dy)),
            unknown_attributes: None,
        });
    }
    di
}

/// `laneShapesFor(...)`: the engine's bands when it placed nodes by lane,
/// otherwise the top-level lanes tiled proportionally over the content height.
#[allow(clippy::too_many_arguments)]
fn lane_shapes_for(
    lanes: &[BpmnLane],
    lane_bands: Option<&Vec<LaneBand>>,
    nodes: &[LayoutNode],
    dy: f64,
    top: f64,
    x: f64,
    width: f64,
    height: f64,
) -> Vec<BpmnDiShape> {
    let Some(bands) = lane_bands else {
        return build_lane_shapes(lanes, nodes, dy, top, x, width, height);
    };
    bands
        .iter()
        .map(|lane| {
            let mut s = new_shape(
                &lane.id,
                BpmnBounds {
                    x: js::round(x),
                    y: js::round(lane.bounds.y + dy),
                    width: js::round(width),
                    height: js::round(lane.bounds.height),
                },
            );
            s.is_horizontal = Some(true);
            s
        })
        .collect()
}

/// `buildLaneShapes(...)`: proportional lane tiling when the engine reported no bands.
#[allow(clippy::too_many_arguments)]
fn build_lane_shapes(
    lanes: &[BpmnLane],
    nodes: &[LayoutNode],
    dy: f64,
    pool_y: f64,
    pool_header_width: f64,
    lane_content_width: f64,
    pool_height: f64,
) -> Vec<BpmnDiShape> {
    let mut elem_to_lane: IndexMap<&str, &str> = IndexMap::new();
    for lane in lanes {
        for r in &lane.flow_node_refs {
            elem_to_lane.insert(r, &lane.id);
        }
    }

    // Compute per-lane mean Y (after shift) to sort lanes top-to-bottom
    let mut lane_accum: IndexMap<&str, (f64, f64)> = IndexMap::new();
    for lane in lanes {
        lane_accum.insert(&lane.id, (0.0, 0.0));
    }
    for node in nodes {
        let Some(lane_id) = elem_to_lane.get(node.id.as_str()) else {
            continue;
        };
        if let Some(acc) = lane_accum.get_mut(lane_id) {
            acc.0 += node.bounds.y + dy;
            acc.1 += 1.0;
        }
    }

    let mean = |lane: &BpmnLane| -> f64 {
        match lane_accum.get(lane.id.as_str()) {
            Some((sum, count)) if *count > 0.0 => sum / count,
            _ => f64::INFINITY,
        }
    };
    let mut sorted_lanes: Vec<&BpmnLane> = lanes.iter().collect();
    sorted_lanes.sort_by(|a, b| js::cmp_num(mean(a), mean(b)));

    // Compute proportional weight per lane: node count × row height, minimum 1 row
    const MIN_LANE_H: f64 = 80.0;

    let weights: Vec<f64> = sorted_lanes
        .iter()
        .map(|lane| {
            let count = nodes
                .iter()
                .filter(|n| elem_to_lane.get(n.id.as_str()) == Some(&lane.id.as_str()))
                .count();
            js::max(count as f64, 1.0)
        })
        .collect();
    let total_weight = weights.iter().fold(0.0, |a, b| a + b);

    // Scale proportionally to poolHeight so all lanes fill the pool exactly
    let mut scaled: Vec<f64> = weights
        .iter()
        .map(|w| js::round((w / total_weight) * pool_height))
        .collect();
    // Fix last lane for rounding drift
    if !scaled.is_empty() {
        let n = scaled.len();
        let head = scaled[..n - 1].iter().fold(0.0, |a, b| a + b);
        scaled[n - 1] = pool_height - head;
    }

    let mut cumulative_y = 0.0;
    sorted_lanes
        .iter()
        .enumerate()
        .map(|(i, lane)| {
            let lane_h = scaled.get(i).copied().unwrap_or(MIN_LANE_H);
            let mut shape = new_shape(
                &lane.id,
                BpmnBounds {
                    x: js::round(pool_header_width),
                    y: js::round(pool_y + cumulative_y),
                    width: js::round(lane_content_width),
                    height: js::round(lane_h),
                },
            );
            shape.is_horizontal = Some(true);
            cumulative_y += lane_h;
            shape
        })
        .collect()
}

/// `withNestedAnnotations(process)`: a view of `process` whose annotations and
/// associations include those declared inside (nested) sub-processes. The builder
/// stores them on the sub-process element, so packing only the process-level lists
/// left them without a shape or edge. Layout nodes are already flat in diagram
/// space, so one pass suffices.
fn with_nested_annotations(process: &BpmnProcess) -> Cow<'_, BpmnProcess> {
    let mut text_annotations = process.contents.text_annotations.clone();
    let mut associations = process.contents.associations.clone();
    fn walk(
        elements: &[BpmnFlowElement],
        text_annotations: &mut Vec<bpmnkit_bpmn::model::BpmnTextAnnotation>,
        associations: &mut Vec<bpmnkit_bpmn::model::BpmnAssociation>,
    ) {
        for el in elements {
            if let Some(c) = el.contents() {
                text_annotations.extend(c.text_annotations.iter().cloned());
                associations.extend(c.associations.iter().cloned());
                walk(&c.flow_elements, text_annotations, associations);
            }
        }
    }
    walk(
        &process.contents.flow_elements,
        &mut text_annotations,
        &mut associations,
    );
    if text_annotations.len() == process.contents.text_annotations.len()
        && associations.len() == process.contents.associations.len()
    {
        return Cow::Borrowed(process);
    }
    let mut p = process.clone();
    p.contents.text_annotations = text_annotations;
    p.contents.associations = associations;
    Cow::Owned(p)
}

/// `addAnnotationShapes(...)`: also used by `expand`, which lays out one process
/// without the pool handling of [`apply_auto_layout`].
pub fn add_annotation_shapes(
    process: &BpmnProcess,
    layout_nodes: &[LayoutNode],
    ann_local_bounds: &IndexMap<String, Bounds>,
    all_shapes: &mut Vec<BpmnDiShape>,
    all_edges: &mut Vec<BpmnDiEdge>,
    dx: f64,
    dy: f64,
) {
    if process.contents.text_annotations.is_empty() && process.contents.associations.is_empty() {
        return;
    }

    let node_by_id: IndexMap<&str, &LayoutNode> =
        layout_nodes.iter().map(|n| (n.id.as_str(), n)).collect();

    for ta in &process.contents.text_annotations {
        let Some(b) = ann_local_bounds.get(&ta.id) else {
            continue;
        };
        all_shapes.push(new_shape(
            &ta.id,
            BpmnBounds {
                x: js::round(b.x + dx),
                y: js::round(b.y + dy),
                width: b.width,
                height: b.height,
            },
        ));
    }

    for assoc in &process.contents.associations {
        // Two annotations: both boxes are packed, so dock edge to edge between them.
        if let (Some(source_ann), Some(target_ann)) = (
            ann_local_bounds.get(&assoc.source_ref),
            ann_local_bounds.get(&assoc.target_ref),
        ) {
            let (p_elem, p_ann) = association_waypoints(source_ann, target_ann);
            all_edges.push(new_edge(
                &assoc.id,
                vec![
                    wp(js::round(p_elem.x + dx), js::round(p_elem.y + dy)),
                    wp(js::round(p_ann.x + dx), js::round(p_ann.y + dy)),
                ],
            ));
            continue;
        }

        let ann_id: Option<&str> = if ann_local_bounds.contains_key(&assoc.source_ref) {
            Some(&assoc.source_ref)
        } else if ann_local_bounds.contains_key(&assoc.target_ref) {
            Some(&assoc.target_ref)
        } else {
            None
        };

        // An association does not have to involve a text annotation — a data
        // object may be associated with an activity. Both ends are placed, so
        // the same docking works.
        let Some(ann_id) = ann_id else {
            let (Some(source), Some(target)) = (
                node_by_id.get(assoc.source_ref.as_str()),
                node_by_id.get(assoc.target_ref.as_str()),
            ) else {
                continue;
            };
            let (p_elem, p_ann) = association_waypoints(&source.bounds, &target.bounds);
            all_edges.push(new_edge(
                &assoc.id,
                vec![
                    wp(js::round(p_elem.x + dx), js::round(p_elem.y + dy)),
                    wp(js::round(p_ann.x + dx), js::round(p_ann.y + dy)),
                ],
            ));
            continue;
        };

        let el_id = if ann_id == assoc.source_ref {
            &assoc.target_ref
        } else {
            &assoc.source_ref
        };
        let ann_b = ann_local_bounds.get(ann_id);
        let el_node = node_by_id.get(el_id.as_str());
        let (Some(ann_b), Some(el_node)) = (ann_b, el_node) else {
            continue;
        };

        let (p_elem, p_ann) = association_waypoints(&el_node.bounds, ann_b);
        // Shift into diagram space and honour the original sourceRef→targetRef order.
        let s_elem = wp(js::round(p_elem.x + dx), js::round(p_elem.y + dy));
        let s_ann = wp(js::round(p_ann.x + dx), js::round(p_ann.y + dy));
        let (wp1, wp2) = if assoc.source_ref == ann_id {
            (s_ann, s_elem)
        } else {
            (s_elem, s_ann)
        };
        all_edges.push(new_edge(&assoc.id, vec![wp1, wp2]));
    }
}

/// `collapsedSubProcesses(defs)`: sub-processes the source diagram draws collapsed.
/// A collapsed sub-process keeps its activity shape on the parent plane and carries
/// its contents on a plane of its own, so the layout must not inline them.
///
/// Either marker counts: an explicit `isExpanded="false"` on the shape, or the
/// presence of a separate plane for that sub-process.
fn collapsed_sub_processes(defs: &BpmnDefinitions) -> IndexSet<String> {
    let mut containers: IndexSet<&str> = IndexSet::new();
    fn walk<'a>(elements: &'a [BpmnFlowElement], containers: &mut IndexSet<&'a str>) {
        for el in elements {
            if let Some(c) = el.contents() {
                containers.insert(&el.base().id);
                walk(&c.flow_elements, containers);
            }
        }
    }
    for process in &defs.processes {
        walk(&process.contents.flow_elements, &mut containers);
    }

    let mut collapsed = IndexSet::new();
    for diagram in &defs.diagrams {
        if containers.contains(diagram.plane.bpmn_element.as_str()) {
            collapsed.insert(diagram.plane.bpmn_element.clone());
        }
        for shape in &diagram.plane.shapes {
            if shape.is_expanded == Some(false) && containers.contains(shape.bpmn_element.as_str())
            {
                collapsed.insert(shape.bpmn_element.clone());
            }
        }
    }
    collapsed
}

/// `childPlaneDiagrams(planes, defs, collapsed)`: one `BPMNDiagram` per collapsed
/// sub-process, its contents laid out at the origin.
fn child_plane_diagrams(
    planes: &[Plane],
    defs: &BpmnDefinitions,
    collapsed: &IndexSet<String>,
) -> Vec<BpmnDiagram> {
    let mut existing: IndexMap<&str, &BpmnDiagram> = IndexMap::new();
    for d in &defs.diagrams {
        existing.insert(&d.plane.bpmn_element, d);
    }
    let mut diagrams = Vec::new();
    let emitted: IndexSet<&str> = planes.iter().map(|p| p.element_id.as_str()).collect();

    // A collapsed sub-process that holds nothing still owns its plane; dropping it
    // would lose the drill-down target the source diagram declared.
    for (element_id, diagram) in &existing {
        if !collapsed.contains(*element_id) || emitted.contains(element_id) {
            continue;
        }
        diagrams.push(BpmnDiagram {
            id: diagram.id.clone(),
            plane: BpmnDiPlane {
                id: diagram.plane.id.clone(),
                bpmn_element: element_id.to_string(),
                shapes: vec![],
                edges: vec![],
                unknown_attributes: None,
            },
            unknown_attributes: None,
            unknown_children: vec![],
        });
    }

    for plane in planes {
        let bbox = content_bbox(&plane.result.nodes, []);
        if !bbox.min_x.is_finite() {
            continue;
        }
        let dx = PADDING - bbox.min_x;
        let dy = PADDING - bbox.min_y;
        let previous = existing.get(plane.element_id.as_str());
        diagrams.push(BpmnDiagram {
            id: previous
                .map(|p| p.id.clone())
                .unwrap_or_else(|| format!("BPMNDiagram_{}", plane.element_id)),
            plane: BpmnDiPlane {
                id: previous
                    .map(|p| p.plane.id.clone())
                    .unwrap_or_else(|| format!("BPMNPlane_{}", plane.element_id)),
                bpmn_element: plane.element_id.clone(),
                shapes: plane
                    .result
                    .nodes
                    .iter()
                    .map(|n| node_to_shape(n, dx, dy))
                    .collect(),
                edges: plane
                    .result
                    .edges
                    .iter()
                    .map(|e| edge_to_shape(e, dx, dy))
                    .collect(),
                unknown_attributes: None,
            },
            unknown_attributes: None,
            unknown_children: vec![],
        });
    }

    diagrams
}

#[derive(Debug, Clone, Copy)]
struct Gap {
    top: f64,
    bottom: f64,
}

/// `poolBands(shapes, participantIds)`: vertical bands between pools — clear ground
/// for a message flow to cross in.
fn pool_bands(shapes: &[BpmnDiShape], participant_ids: &IndexSet<&str>) -> Vec<Gap> {
    let mut pools: Vec<Gap> = shapes
        .iter()
        .filter(|s| participant_ids.contains(s.bpmn_element.as_str()))
        .map(|s| Gap {
            top: s.bounds.y,
            bottom: s.bounds.y + s.bounds.height,
        })
        .collect();
    pools.sort_by(|a, b| js::cmp_num(a.top, b.top));

    let mut gaps = Vec::new();
    for i in 0..pools.len().saturating_sub(1) {
        let above = pools[i];
        let below = pools[i + 1];
        if below.top > above.bottom {
            gaps.push(Gap {
                top: above.bottom,
                bottom: below.top,
            });
        }
    }
    gaps
}

/// Containment by reference: TS compares the bounds objects by identity, so two
/// shapes that happen to share bounds stay distinct.
fn includes(own: &[&BpmnBounds], o: &BpmnBounds) -> bool {
    own.iter().any(|w| std::ptr::eq(*w, o))
}

/// `columnBlocked(...)`: a vertical run at `x` between two heights would cross a shape.
fn column_blocked(
    x: f64,
    from_y: f64,
    to_y: f64,
    obstacles: &[&BpmnBounds],
    own: &[&BpmnBounds],
) -> bool {
    let top = js::min(from_y, to_y);
    let bottom = js::max(from_y, to_y);
    obstacles.iter().any(|o| {
        !includes(own, o) && o.x < x && x < o.x + o.width && o.y < bottom && top < o.y + o.height
    })
}

/// `clearColumn(...)`: shift a vertical run sideways until it misses every shape it
/// would otherwise pass through. The run has to stay on the element it docks onto,
/// so the search is bounded by that element's own width.
fn clear_column(
    x: f64,
    from_y: f64,
    to_y: f64,
    obstacles: &[&BpmnBounds],
    own: &[&BpmnBounds],
    dock: &BpmnBounds,
) -> f64 {
    if !column_blocked(x, from_y, to_y, obstacles, own) {
        return x;
    }
    let limit = (dock.width / 2.0).floor();
    let mut step = MESSAGE_FLOW_STEP;
    while step <= limit {
        if !column_blocked(x + step, from_y, to_y, obstacles, own) {
            return x + step;
        }
        if !column_blocked(x - step, from_y, to_y, obstacles, own) {
            return x - step;
        }
        step += MESSAGE_FLOW_STEP;
    }
    x
}

struct Leg {
    points: Vec<BpmnWaypoint>,
    blocked: bool,
}

/// `messageFlowLeg(...)`: one vertical leg of a message flow, from its dock to the
/// crossing band.
///
/// A straight drop is used when the column is clear. Otherwise the leg leaves the
/// element by a short stem and jogs sideways to a column that is clear for the rest
/// of the descent — the same move a modeller makes by hand, and the only way past a
/// shape sitting directly below the dock. `stem_offset` staggers the stem so two
/// flows jogging side by side do not share a line.
fn message_flow_leg(
    dock_x: f64,
    from_y: f64,
    to_y: f64,
    obstacles: &[&BpmnBounds],
    own: &[&BpmnBounds],
    dock: &BpmnBounds,
    stem_offset: f64,
) -> Leg {
    let straight = clear_column(dock_x, from_y, to_y, obstacles, own, dock);
    if !column_blocked(straight, from_y, to_y, obstacles, own) {
        return Leg {
            points: vec![wp(straight, from_y), wp(straight, to_y)],
            blocked: false,
        };
    }

    let down = to_y > from_y;
    let stem = MESSAGE_FLOW_STEM + stem_offset;
    let stem_y = if down { from_y + stem } else { from_y - stem };
    let row_blocked = |x: f64| -> bool {
        obstacles.iter().any(|o| {
            !includes(own, o)
                && o.x < js::max(dock_x, x)
                && js::min(dock_x, x) < o.x + o.width
                && o.y < stem_y
                && stem_y < o.y + o.height
        })
    };

    let mut offset = MESSAGE_FLOW_JOG;
    while offset <= MESSAGE_FLOW_MAX_JOG {
        for candidate in [dock_x + offset, dock_x - offset] {
            if row_blocked(candidate) {
                continue;
            }
            if column_blocked(candidate, stem_y, to_y, obstacles, own) {
                continue;
            }
            return Leg {
                points: vec![
                    wp(dock_x, from_y),
                    wp(dock_x, stem_y),
                    wp(candidate, stem_y),
                    wp(candidate, to_y),
                ],
                blocked: false,
            };
        }
        offset += MESSAGE_FLOW_JOG;
    }

    Leg {
        points: vec![wp(straight, from_y), wp(straight, to_y)],
        blocked: true,
    }
}

struct MessageRoute {
    source: Vec<BpmnWaypoint>,
    target: Vec<BpmnWaypoint>,
    gap: i64,
}

/// `messageFlowRoute(...)`: pick where a message flow crosses between pools and how
/// each of its two legs gets there.
///
/// Bands are tried nearest-first: the gaps between pools are clear ground, so a
/// route that reaches one has nothing left to cross. Each leg is checked over its
/// own stretch rather than the whole run, which is what lets a flow slip past shapes
/// on the far side of the band. `containers` holds the scopes holding an endpoint:
/// a route out of one has to cross it.
#[allow(clippy::too_many_arguments)]
fn message_flow_route(
    src: &BpmnBounds,
    tgt: &BpmnBounds,
    src_is_pool: bool,
    tgt_is_pool: bool,
    gaps: &[Gap],
    obstacles: &[&BpmnBounds],
    stem_offset: f64,
    containers: &[&BpmnBounds],
) -> MessageRoute {
    let src_below = src.y + src.height / 2.0 > tgt.y + tgt.height / 2.0;
    let sy = if src_below { src.y } else { src.y + src.height };
    let ty = if src_below { tgt.y + tgt.height } else { tgt.y };
    // The endpoints themselves, plus any expanded sub-process they sit inside:
    // leaving an element means crossing the border of whatever contains it, so
    // treating that border as an obstacle would leave the route no way out.
    let mut own: Vec<&BpmnBounds> = vec![src, tgt];
    own.extend(containers.iter().copied());
    let midpoint = (sy + ty) / 2.0;
    let low = js::min(sy, ty);
    let high = js::max(sy, ty);

    struct Built {
        source: Vec<BpmnWaypoint>,
        target: Vec<BpmnWaypoint>,
        blocked: bool,
    }

    let build = |band_y: f64| -> Built {
        let source = message_flow_leg(
            js::round(src.x + src.width / 2.0),
            sy,
            band_y,
            obstacles,
            &own,
            src,
            stem_offset,
        );
        let target = message_flow_leg(
            js::round(tgt.x + tgt.width / 2.0),
            ty,
            band_y,
            obstacles,
            &own,
            tgt,
            stem_offset,
        );
        // A pool has no position of its own to respect: dock it under whatever it
        // is talking to, so the flow drops straight instead of fanning into the
        // pool's centre along with every other flow.
        if tgt_is_pool && !src_is_pool {
            let x = source.points.last().map(|p| p.x).unwrap_or(0.0);
            return Built {
                source: source.points,
                target: vec![wp(x, ty), wp(x, band_y)],
                blocked: source.blocked,
            };
        }
        if src_is_pool && !tgt_is_pool {
            let x = target.points.last().map(|p| p.x).unwrap_or(0.0);
            return Built {
                source: vec![wp(x, sy), wp(x, band_y)],
                target: target.points,
                blocked: target.blocked,
            };
        }
        Built {
            source: source.points,
            target: target.points,
            blocked: source.blocked || target.blocked,
        }
    };

    let mut candidates: Vec<(usize, f64)> = gaps
        .iter()
        .enumerate()
        .map(|(index, gap)| (index, (gap.top + gap.bottom) / 2.0))
        .filter(|(_, y)| *y >= low && *y <= high)
        .collect();
    candidates.sort_by(|a, b| js::cmp_num((a.1 - midpoint).abs(), (b.1 - midpoint).abs()));

    for (index, y) in &candidates {
        let route = build(*y);
        if !route.blocked {
            return MessageRoute {
                source: route.source,
                target: route.target,
                gap: *index as i64,
            };
        }
    }

    let fallback = candidates.first();
    let route = build(fallback.map(|c| c.1).unwrap_or(midpoint));
    MessageRoute {
        source: route.source,
        target: route.target,
        gap: fallback.map(|c| c.0 as i64).unwrap_or(-1),
    }
}

/// `poolOwners(defs, collab)`: every element id in a collaboration mapped to the
/// index of the pool holding it.
fn pool_owners(defs: &BpmnDefinitions, collab: &BpmnCollaboration) -> IndexMap<String, usize> {
    let mut owners: IndexMap<String, usize> = IndexMap::new();
    let process_by_id = process_index(defs);

    fn walk(elements: &[BpmnFlowElement], index: usize, owners: &mut IndexMap<String, usize>) {
        for element in elements {
            owners.insert(element.base().id.clone(), index);
            if let Some(c) = element.contents() {
                if !c.flow_elements.is_empty() {
                    walk(&c.flow_elements, index, owners);
                }
            }
        }
    }

    for (index, participant) in collab.participants.iter().enumerate() {
        owners.insert(participant.id.clone(), index);
        let process = participant
            .process_ref
            .as_deref()
            .filter(|r| !r.is_empty())
            .and_then(|r| process_by_id.get(r));
        let Some(&process) = process else {
            continue;
        };
        walk(
            &defs.processes[process].contents.flow_elements,
            index,
            &mut owners,
        );
    }

    owners
}

/// `new Map(defs.processes.map((p) => [p.id, p]))`, as indices; the last duplicate wins.
fn process_index(defs: &BpmnDefinitions) -> IndexMap<&str, usize> {
    let mut m = IndexMap::new();
    for (i, p) in defs.processes.iter().enumerate() {
        m.insert(p.id.as_str(), i);
    }
    m
}

/// `poolLinks(collab, owners, depth)`: message flows as pool-to-pool relationships,
/// one per flow, each carrying how deep inside its pool the message leaves and arrives.
fn pool_links(
    collab: &BpmnCollaboration,
    owners: &IndexMap<String, usize>,
    depth: impl Fn(&str) -> Option<f64>,
) -> Vec<PoolLink> {
    let mut links = Vec::new();
    for flow in &collab.message_flows {
        let (Some(&from), Some(&to)) = (
            owners.get(flow.source_ref.as_str()),
            owners.get(flow.target_ref.as_str()),
        ) else {
            continue;
        };
        if from == to {
            continue;
        }
        links.push(PoolLink {
            from,
            to,
            weight: 1.0,
            from_depth: depth(&flow.source_ref),
            to_depth: depth(&flow.target_ref),
        });
    }
    links
}

/// `depthIndex(layouts)`: each laid-out element's vertical position within its own
/// process, 0 top to 1 bottom.
fn depth_index<'a>(layouts: impl Iterator<Item = &'a LayoutResult>) -> IndexMap<String, f64> {
    let mut depths = IndexMap::new();
    for layout in layouts {
        if layout.nodes.is_empty() {
            continue;
        }
        let b = content_bbox(&layout.nodes, []);
        let height = b.max_y - b.min_y;
        if height <= 0.0 {
            continue;
        }
        for node in &layout.nodes {
            depths.insert(
                node.id.clone(),
                (node.bounds.y + node.bounds.height / 2.0 - b.min_y) / height,
            );
        }
    }
    depths
}

/// `contentWidth(layout)`: width of a laid-out process, ignoring where in space it
/// happens to sit.
fn content_width(layout: &LayoutResult) -> f64 {
    if layout.nodes.is_empty() {
        return 0.0;
    }
    let b = content_bbox(&layout.nodes, []);
    b.max_x - b.min_x
}

/// One entry of TS's `pools`: a participant, a process, or both.
struct Pool {
    participant_id: Option<String>,
    /// Index into `defs.processes`.
    process: Option<usize>,
}

/// `messageLinks(collab, pools, layouts)`: message flows expressed as the x centres
/// of the two elements they connect, measured inside each pool's own content so
/// alignment can shift pools freely.
fn message_links(
    defs: &BpmnDefinitions,
    collab: Option<&BpmnCollaboration>,
    pools: &[Pool],
    layouts: &[LayoutResult],
) -> Vec<MessageLink> {
    let Some(collab) = collab else {
        return Vec::new();
    };

    let mut centres: IndexMap<&str, (usize, f64)> = IndexMap::new();
    for (index, pool) in pools.iter().enumerate() {
        let Some(layout) = layouts.get(index) else {
            continue;
        };
        if pool.participant_id.is_none() || layout.nodes.is_empty() {
            continue;
        }
        let b = content_bbox(&layout.nodes, []);
        let has_lanes = pool
            .process
            .and_then(|p| defs.processes[p].lane_set.as_ref())
            .is_some_and(|s| !s.lanes.is_empty());
        let elem_x = POOL_HEADER + if has_lanes { LANE_HEADER } else { 0.0 } + PADDING;
        for node in &layout.nodes {
            centres.insert(
                &node.id,
                (
                    index,
                    elem_x + node.bounds.x + node.bounds.width / 2.0 - b.min_x,
                ),
            );
        }
    }

    let mut links = Vec::new();
    for flow in &collab.message_flows {
        let (Some(from), Some(to)) = (
            centres.get(flow.source_ref.as_str()),
            centres.get(flow.target_ref.as_str()),
        ) else {
            continue;
        };
        if from.0 == to.0 {
            continue;
        }
        links.push(MessageLink {
            from_pool: from.0,
            to_pool: to.0,
            from_x: from.1,
            to_x: to.1,
        });
    }
    links
}

/// `ancestorIndex(defs, collab)`: every element inside a collaboration mapped to the
/// element that would contain it on a plane: its sub-process, or the participant of
/// its process. Following the chain finds the nearest ancestor a collapsed scope
/// leaves visible.
fn ancestor_index(defs: &BpmnDefinitions, collab: &BpmnCollaboration) -> IndexMap<String, String> {
    let mut parents: IndexMap<String, String> = IndexMap::new();
    let process_by_id = process_index(defs);

    fn walk(elements: &[BpmnFlowElement], parent: &str, parents: &mut IndexMap<String, String>) {
        for element in elements {
            let id = &element.base().id;
            parents.insert(id.clone(), parent.to_string());
            if let Some(c) = element.contents() {
                if !c.flow_elements.is_empty() {
                    walk(&c.flow_elements, id, parents);
                }
            }
        }
    }

    for participant in &collab.participants {
        let process = participant
            .process_ref
            .as_deref()
            .filter(|r| !r.is_empty())
            .and_then(|r| process_by_id.get(r));
        let Some(&process) = process else {
            continue;
        };
        walk(
            &defs.processes[process].contents.flow_elements,
            &participant.id,
            &mut parents,
        );
    }

    parents
}

struct Run {
    id: String,
    source: Vec<BpmnWaypoint>,
    target: Vec<BpmnWaypoint>,
    gap: i64,
}

struct RootPlane {
    element_id: String,
    shapes: Vec<BpmnDiShape>,
    edges: Vec<BpmnDiEdge>,
}

fn to_layout_bounds(b: &BpmnBounds) -> Bounds {
    Bounds {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
    }
}

/// `applyAutoLayout(defs, engine, hints)`: replace every diagram-interchange position
/// in `defs` with a computed layout, returning a new model.
///
/// - Handles plain processes (no collaboration) and collaborations with pools.
/// - When pools have lanes, lane shapes are tiled vertically around the process content.
///
/// `engine` picks the process layout algorithm. `hints` are the tool-grid shapes and
/// annotation sides the builder collected; they steer placement only and are not
/// written to `defs`.
pub fn apply_auto_layout(
    defs: &BpmnDefinitions,
    engine: LayoutEngine,
    hints: Option<&LayoutHints>,
) -> BpmnDefinitions {
    if defs.processes.is_empty() {
        return defs.clone();
    }

    let collab = defs.collaborations.first();
    let grids = hints.and_then(|h| h.grids.as_ref());
    let annotation_sides = hints.and_then(|h| h.annotation_sides.as_ref());

    // Build processId → participantId map
    let mut process_to_participant: IndexMap<&str, &str> = IndexMap::new();
    if let Some(collab) = collab {
        for p in &collab.participants {
            if let Some(r) = p.process_ref.as_deref().filter(|r| !r.is_empty()) {
                process_to_participant.insert(r, &p.id);
            }
        }
    }

    let mut all_shapes: Vec<BpmnDiShape> = Vec::new();
    let mut all_edges: Vec<BpmnDiEdge> = Vec::new();
    let mut child_planes: Vec<Plane> = Vec::new();
    let collapsed = collapsed_sub_processes(defs);
    let mut pool_y = 0.0_f64;

    // Walk the pools in declaration order so a black-box participant keeps its
    // place in the stack; processes no participant references follow.
    let process_by_id = process_index(defs);
    let mut pools: Vec<Pool> = Vec::new();
    // Layouts computed early, for ordering; reused rather than run twice. Keyed by
    // process index, since TS keys by object identity.
    let mut layout_of: IndexMap<usize, LayoutResult> = IndexMap::new();
    if let Some(collab) = collab {
        let participant_pools: Vec<Pool> = collab
            .participants
            .iter()
            .map(|participant| Pool {
                participant_id: Some(participant.id.clone()).filter(|s| !s.is_empty()),
                process: participant
                    .process_ref
                    .as_deref()
                    .filter(|r| !r.is_empty())
                    .and_then(|r| process_by_id.get(r).copied()),
            })
            .collect();
        // Pools that exchange messages read better next to each other, so the
        // stack follows the message flows rather than the declaration order.
        for pool in &participant_pools {
            if let Some(p) = pool.process {
                if !layout_of.contains_key(&p) {
                    layout_of.insert(
                        p,
                        layout_process(&defs.processes[p], engine, &collapsed, grids),
                    );
                }
            }
        }
        let depths = depth_index(layout_of.values());
        let order = order_pools(
            participant_pools.len(),
            &pool_links(collab, &pool_owners(defs, collab), |id| {
                depths.get(id).copied()
            }),
        );
        for index in order {
            // An index may repeat in TS; a pool is cheap to rebuild from its parts.
            if let Some(pool) = participant_pools.get(index) {
                pools.push(Pool {
                    participant_id: pool.participant_id.clone(),
                    process: pool.process,
                });
            }
        }
        for (i, process) in defs.processes.iter().enumerate() {
            if !process_to_participant.contains_key(process.id.as_str()) {
                pools.push(Pool {
                    participant_id: None,
                    process: Some(i),
                });
            }
        }
    } else {
        for i in 0..defs.processes.len() {
            pools.push(Pool {
                participant_id: None,
                process: Some(i),
            });
        }
    }

    // Lay every pool out first: alignment needs to see all of them before any
    // geometry is committed. An early layout is copied for all but the last pool
    // that shows its process, which takes it.
    let mut uses_left: FxIndexMap<usize, usize> = FxIndexMap::default();
    for p in pools.iter().filter_map(|pool| pool.process) {
        *uses_left.entry(p).or_default() += 1;
    }
    let layouts: Vec<LayoutResult> = pools
        .iter()
        .map(|pool| match pool.process {
            Some(p) => {
                let left = uses_left.get_mut(&p).map_or(0, |n| {
                    *n -= 1;
                    *n
                });
                let early = if left == 0 {
                    layout_of.swap_remove(&p)
                } else {
                    layout_of.get(&p).cloned()
                };
                early.unwrap_or_else(|| {
                    layout_process(&defs.processes[p], engine, &collapsed, grids)
                })
            }
            None => LayoutResult::default(),
        })
        .collect();
    let alignment = align_pools(
        pools.len(),
        &layouts.iter().map(content_width).collect::<Vec<_>>(),
        &message_links(defs, collab, &pools, &layouts),
    );

    // Pools with nothing to draw; widened to match the others once all are placed.
    // Held as indices into `all_shapes`.
    let mut black_box_pools: Vec<usize> = Vec::new();
    // Root processes that are not the primary one, each on a plane of its own.
    let mut root_planes: Vec<RootPlane> = Vec::new();
    let primary_process_id = defs.processes.first().map(|p| p.id.as_str());

    for (pool_index, pool) in pools.iter().enumerate() {
        let participant_id = pool.participant_id.as_deref();
        let process = pool.process.map(|p| &defs.processes[p]);
        let empty_lanes: Vec<BpmnLane> = Vec::new();
        let lanes: &[BpmnLane] = process
            .and_then(|p| p.lane_set.as_ref())
            .map(|s: &BpmnLaneSet| s.lanes.as_slice())
            .unwrap_or(&empty_lanes);
        let has_lanes = !lanes.is_empty();

        let result = &layouts[pool_index];
        let align_dx = alignment.get(pool_index).copied().unwrap_or(0.0);

        // A participant with no process, or one whose process has no flow nodes,
        // is a black box: it still needs a pool of its own to dock message flows
        // onto, and to stay visible at all. One whose process holds annotations
        // is not: it takes the content path below, so the pool is sized around them
        // and they get shapes instead of being dropped.
        let annotations_only_pool = participant_id.is_some()
            && process.is_some_and(|p| !p.contents.text_annotations.is_empty());
        if result.nodes.is_empty() && !annotations_only_pool {
            // A process can be nothing but annotations; they still belong on the plane.
            if let (None, Some(process)) = (participant_id, process) {
                if !process.contents.text_annotations.is_empty() {
                    let ann_only = pack_annotations(process, &[], &[], None);
                    let bbox = content_bbox(&[], ann_only.values());
                    add_annotation_shapes(
                        process,
                        &[],
                        &ann_only,
                        &mut all_shapes,
                        &mut all_edges,
                        PADDING - bbox.min_x,
                        PADDING - bbox.min_y,
                    );
                    continue;
                }
            }
            if let Some(participant_id) = participant_id {
                let mut shape = new_shape(
                    participant_id,
                    BpmnBounds {
                        x: 0.0,
                        y: pool_y,
                        width: EMPTY_POOL_WIDTH,
                        height: EMPTY_POOL_HEIGHT,
                    },
                );
                shape.is_horizontal = Some(true);
                black_box_pools.push(all_shapes.len());
                all_shapes.push(shape);
                pool_y += EMPTY_POOL_HEIGHT + POOL_GAP;
            }
            continue;
        }
        if let Some(planes) = &result.planes {
            child_planes.extend(planes.iter().cloned());
        }

        // The engine reports lane bands when it placed nodes by lane membership;
        // they replace the proportional tiling below.
        let engine_lanes: Option<&Vec<LaneBand>> = result.lanes.as_ref();

        // Pre-compute annotation positions in layout space so they're included in the bbox
        let ann_process = process.map(with_nested_annotations);
        let ann_bounds: IndexMap<String, Bounds> = match &ann_process {
            Some(p) => pack_annotations(p, &result.nodes, &result.edges, annotation_sides),
            None => IndexMap::new(),
        };

        let bbox = content_bbox(&result.nodes, ann_bounds.values());
        let content_w = bbox.max_x - bbox.min_x;
        let content_h = bbox.max_y - bbox.min_y;

        // Engine lane bands already stack the content vertically, so the pool
        // aligns to the band space rather than to the content bounding box —
        // otherwise the shapes drift out of the lanes drawn around them.
        let lane_bands = if has_lanes { engine_lanes } else { None };
        // Bands arrive outermost first and nested lanes overlap their parent, so the
        // pool spans their extent rather than the first band or the sum of heights.
        let band_top = lane_bands
            .map(|l| l.iter().fold(f64::INFINITY, |m, b| js::min(m, b.bounds.y)))
            .unwrap_or(0.0);
        let band_height = lane_bands
            .map(|l| {
                l.iter().fold(f64::NEG_INFINITY, |m, b| {
                    js::max(m, b.bounds.y + b.bounds.height)
                }) - band_top
            })
            .unwrap_or(0.0);

        // Below any pools already stacked; poolY is 0 without a collaboration.
        let process_top = if process.map(|p| p.id.as_str()) == primary_process_id {
            pool_y
        } else {
            0.0
        };
        let dx: f64;
        let dy: f64;
        if participant_id.is_some() {
            let elem_x = POOL_HEADER + if has_lanes { LANE_HEADER } else { 0.0 } + PADDING;
            dx = elem_x - bbox.min_x + align_dx;
            dy = if lane_bands.is_some() {
                pool_y - band_top
            } else {
                pool_y + PADDING - bbox.min_y
            };
        } else {
            // A process outside any pool draws its lanes on the plane itself (bpmn-js
            // imports lane DI under a process root), header at x 0, so the content
            // clears the lane header the way it does in a pool.
            // A layout pass must not invent a participant to hold them.
            dx = (if has_lanes { LANE_HEADER } else { 0.0 }) + PADDING - bbox.min_x;
            dy = if lane_bands.is_some() {
                process_top - band_top
            } else {
                process_top + PADDING - bbox.min_y
            };
        }
        // Lanes of a process outside any pool, drawn straight on its plane.
        let bare_lanes: Vec<BpmnDiShape> = if participant_id.is_none() && has_lanes {
            lane_shapes_for(
                lanes,
                lane_bands,
                &result.nodes,
                dy,
                process_top,
                0.0,
                LANE_HEADER + content_w + 2.0 * PADDING,
                if lane_bands.is_some() {
                    band_height
                } else {
                    content_h + 2.0 * PADDING
                },
            )
        } else {
            Vec::new()
        };

        // Only the primary process shares the root plane; any other root process
        // owns one, instead of being stacked on top of the first at the origin.
        if let (None, Some(process)) = (participant_id, process) {
            if Some(process.id.as_str()) != primary_process_id {
                let mut shapes: Vec<BpmnDiShape> = Vec::new();
                let mut edges: Vec<BpmnDiEdge> = Vec::new();
                for node in &result.nodes {
                    shapes.push(node_to_shape(node, dx, dy));
                }
                for edge in &result.edges {
                    edges.push(edge_to_shape(edge, dx, dy));
                }
                let ap: &BpmnProcess = ann_process.as_deref().unwrap_or(process);
                add_annotation_shapes(
                    ap,
                    &result.nodes,
                    &ann_bounds,
                    &mut shapes,
                    &mut edges,
                    dx,
                    dy,
                );
                shapes.extend(bare_lanes);
                root_planes.push(RootPlane {
                    element_id: process.id.clone(),
                    shapes,
                    edges,
                });
                continue;
            }
        }

        for node in &result.nodes {
            all_shapes.push(node_to_shape(node, dx, dy));
        }
        for edge in &result.edges {
            all_edges.push(edge_to_shape(edge, dx, dy));
        }
        if let Some(process) = process {
            let ap: &BpmnProcess = ann_process.as_deref().unwrap_or(process);
            add_annotation_shapes(
                ap,
                &result.nodes,
                &ann_bounds,
                &mut all_shapes,
                &mut all_edges,
                dx,
                dy,
            );
        }
        all_shapes.extend(bare_lanes);

        if let Some(participant_id) = participant_id {
            let inner_w =
                (if has_lanes { LANE_HEADER } else { 0.0 }) + content_w + 2.0 * PADDING + align_dx;
            // Lanes must tile the pool exactly, so the pool takes their height.
            let inner_h = if lane_bands.is_some() {
                band_height
            } else {
                content_h + 2.0 * PADDING
            };
            let pool_w = POOL_HEADER + inner_w;

            let mut pool_shape = new_shape(
                participant_id,
                BpmnBounds {
                    x: 0.0,
                    y: pool_y,
                    width: pool_w,
                    height: inner_h,
                },
            );
            pool_shape.is_horizontal = Some(true);
            all_shapes.push(pool_shape);

            if has_lanes {
                all_shapes.extend(lane_shapes_for(
                    lanes,
                    lane_bands,
                    &result.nodes,
                    dy,
                    pool_y,
                    POOL_HEADER,
                    inner_w,
                    inner_h,
                ));
            }

            pool_y += inner_h + POOL_GAP;
        }
    }

    // Give the black boxes the width of the widest pool that has content, so the
    // stack reads as one diagram rather than a ragged column.
    if !black_box_pools.is_empty() {
        let participant_ids: IndexSet<&str> = collab
            .map(|c| c.participants.iter().map(|p| p.id.as_str()).collect())
            .unwrap_or_default();
        let widest = all_shapes
            .iter()
            .enumerate()
            .filter(|(i, s)| {
                participant_ids.contains(s.bpmn_element.as_str()) && !black_box_pools.contains(i)
            })
            .fold(EMPTY_POOL_WIDTH, |max, (_, s)| js::max(max, s.bounds.width));
        for &i in &black_box_pools {
            all_shapes[i].bounds.width = widest;
        }
    }

    if let Some(collab) = collab.filter(|c| !c.message_flows.is_empty()) {
        let mut shape_by_element: IndexMap<&str, &BpmnBounds> = IndexMap::new();
        for s in &all_shapes {
            shape_by_element.insert(&s.bpmn_element, &s.bounds);
        }
        // An endpoint inside a collapsed sub-process has no shape on this plane;
        // the message docks on the nearest ancestor that does.
        let visible_ancestors = ancestor_index(defs, collab);
        let resolve = |id: &str| -> String {
            let mut current: Option<&str> = Some(id);
            while let Some(c) = current {
                if shape_by_element.contains_key(c) {
                    break;
                }
                current = visible_ancestors.get(c).map(|s| s.as_str());
            }
            current.unwrap_or(id).to_string()
        };
        let participant_ids: IndexSet<&str> =
            collab.participants.iter().map(|p| p.id.as_str()).collect();
        let lane_ids: IndexSet<&str> = defs
            .processes
            .iter()
            .flat_map(|p| {
                p.lane_set
                    .iter()
                    .flat_map(|s| s.lanes.iter().map(|l| l.id.as_str()))
            })
            .collect();
        // Pools and lanes are containers; message flows cross them by design. It is
        // the elements inside that a route has to miss.
        let obstacles: Vec<&BpmnBounds> = all_shapes
            .iter()
            .filter(|s| {
                !participant_ids.contains(s.bpmn_element.as_str())
                    && !lane_ids.contains(s.bpmn_element.as_str())
            })
            .map(|s| &s.bounds)
            .collect();
        let pool_gaps = pool_bands(&all_shapes, &participant_ids);

        let mut runs: Vec<Run> = Vec::new();

        // Bounds of every expanded scope an element sits inside.
        let containers_of = |id: &str| -> Vec<&BpmnBounds> {
            let mut out = Vec::new();
            let mut parent = visible_ancestors.get(id);
            while let Some(p) = parent {
                if let Some(bounds) = shape_by_element.get(p.as_str()) {
                    out.push(*bounds);
                }
                parent = visible_ancestors.get(p.as_str());
            }
            out
        };

        let mut stem_offset = 0.0_f64;
        for mf in &collab.message_flows {
            let source_ref = resolve(&mf.source_ref);
            let target_ref = resolve(&mf.target_ref);
            let (Some(src), Some(tgt)) = (
                shape_by_element.get(source_ref.as_str()),
                shape_by_element.get(target_ref.as_str()),
            ) else {
                continue;
            };
            let mut containers = containers_of(&source_ref);
            containers.extend(containers_of(&target_ref));
            let route = message_flow_route(
                src,
                tgt,
                participant_ids.contains(source_ref.as_str()),
                participant_ids.contains(target_ref.as_str()),
                &pool_gaps,
                &obstacles,
                stem_offset,
                &containers,
            );
            runs.push(Run {
                id: mf.id.clone(),
                source: route.source,
                target: route.target,
                gap: route.gap,
            });
            stem_offset = (stem_offset + MESSAGE_FLOW_STEM_STEP) % (MESSAGE_FLOW_STEM_STEP * 4.0);
        }

        // Flows sharing a gap get their own line inside it, so parallel runs do not
        // pile onto one row and cross every other flow's riser.
        let mut per_gap: IndexMap<i64, Vec<usize>> = IndexMap::new();
        for (i, run) in runs.iter().enumerate() {
            per_gap.entry(run.gap).or_default().push(i);
        }

        let end_x = |points: &[BpmnWaypoint]| -> f64 { points.last().map(|p| p.x).unwrap_or(0.0) };
        for (index, list) in per_gap.iter_mut() {
            let Some(gap) = usize::try_from(*index).ok().and_then(|i| pool_gaps.get(i)) else {
                continue;
            };
            let key = |i: usize| js::min(end_x(&runs[i].source), end_x(&runs[i].target));
            list.sort_by(|a, b| js::cmp_num(key(*a), key(*b)));
            for (i, run_index) in list.iter().enumerate() {
                // The gap is clear ground, so moving the crossing inside it cannot
                // introduce a collision.
                let y = js::round(
                    gap.top + ((i + 1) as f64 * (gap.bottom - gap.top)) / (list.len() + 1) as f64,
                );
                let run = &mut runs[*run_index];
                if let Some(last) = run.source.last_mut() {
                    last.y = y;
                }
                if let Some(last) = run.target.last_mut() {
                    last.y = y;
                }
            }
        }

        let mut flow_edges = Vec::new();
        for run in &runs {
            let mut pts: Vec<Waypoint> = run
                .source
                .iter()
                .map(|p| Waypoint { x: p.x, y: p.y })
                .collect();
            pts.extend(run.target.iter().rev().map(|p| Waypoint { x: p.x, y: p.y }));
            let waypoints = collapse_collinear(&pts)
                .into_iter()
                .map(|p| wp(p.x, p.y))
                .collect();
            flow_edges.push(new_edge(&run.id, waypoints));
        }
        all_edges.extend(flow_edges);
    }

    let repair = RouteRepair::new(defs);
    repair.apply(&all_shapes, &mut all_edges);
    for plane in &mut root_planes {
        repair.apply(&plane.shapes, &mut plane.edges);
    }

    let plane_bpmn_element = collab
        .map(|c| c.id.clone())
        .or_else(|| defs.processes.first().map(|p| p.id.clone()))
        .unwrap_or_else(|| "plane".to_string());
    // The primary plane keeps the ids of the source diagram that drew the same
    // element. The first diagram is the fallback only while no other plane
    // reuses it: a root or sub-process plane keeps its own source diagram, and
    // two diagrams with one id lose a plane to any reader that resolves by id.
    let claimed: IndexSet<&str> = root_planes
        .iter()
        .map(|plane| plane.element_id.as_str())
        .chain(child_planes.iter().map(|plane| plane.element_id.as_str()))
        .chain(collapsed.iter().map(String::as_str))
        .collect();
    let existing_diagram = defs
        .diagrams
        .iter()
        .find(|d| d.plane.bpmn_element == plane_bpmn_element)
        .or_else(|| {
            defs.diagrams
                .first()
                .filter(|d| !claimed.contains(d.plane.bpmn_element.as_str()))
        });

    let mut laid_out = vec![BpmnDiagram {
        id: existing_diagram
            .map(|d| d.id.clone())
            .unwrap_or_else(|| "BPMNDiagram_1".to_string()),
        plane: BpmnDiPlane {
            id: existing_diagram
                .map(|d| d.plane.id.clone())
                .unwrap_or_else(|| "BPMNPlane_1".to_string()),
            bpmn_element: plane_bpmn_element,
            shapes: all_shapes,
            edges: all_edges,
            unknown_attributes: None,
        },
        unknown_attributes: None,
        unknown_children: vec![],
    }];
    for plane in root_planes {
        let previous = defs
            .diagrams
            .iter()
            .find(|d| d.plane.bpmn_element == plane.element_id);
        laid_out.push(BpmnDiagram {
            id: previous
                .map(|d| d.id.clone())
                .unwrap_or_else(|| format!("BPMNDiagram_{}", plane.element_id)),
            plane: BpmnDiPlane {
                id: previous
                    .map(|d| d.plane.id.clone())
                    .unwrap_or_else(|| format!("BPMNPlane_{}", plane.element_id)),
                bpmn_element: plane.element_id,
                shapes: plane.shapes,
                edges: plane.edges,
                unknown_attributes: None,
            },
            unknown_attributes: None,
            unknown_children: vec![],
        });
    }
    laid_out.extend(child_plane_diagrams(&child_planes, defs, &collapsed));

    // Field by field so the source diagrams, replaced wholesale, are never cloned.
    BpmnDefinitions {
        id: defs.id.clone(),
        target_namespace: defs.target_namespace.clone(),
        exporter: defs.exporter.clone(),
        exporter_version: defs.exporter_version.clone(),
        namespaces: defs.namespaces.clone(),
        unknown_attributes: defs.unknown_attributes.clone(),
        documentation: defs.documentation.clone(),
        documentation_attributes: defs.documentation_attributes.clone(),
        categories: defs.categories.clone(),
        errors: defs.errors.clone(),
        escalations: defs.escalations.clone(),
        messages: defs.messages.clone(),
        signals: defs.signals.clone(),
        collaborations: defs.collaborations.clone(),
        processes: defs.processes.clone(),
        diagrams: keep_di_attributes(&defs.diagrams, laid_out),
        unknown_children: defs.unknown_children.clone(),
    }
}

/// `keepDiAttributes(source, laidOut)`: layout recomputes geometry only — bounds,
/// waypoints, label bounds, and the `isExpanded` / `isHorizontal` that describe
/// them. Everything else the source diagram said carries over by `bpmnElement` (DI
/// ids, gateway markers, colours and other vendor attributes, diagram names and label
/// styles), as a plain parse and export would keep it.
pub fn keep_di_attributes<'s>(
    source: &'s [BpmnDiagram],
    laid_out: Vec<BpmnDiagram>,
) -> Vec<BpmnDiagram> {
    // Diagrams match by the element their plane draws; `id` is optional in DI,
    // and matching on an empty one would hand every diagram the first one's
    // attributes and label styles (duplicate XML ids).
    let shape_count: usize = source.iter().map(|d| d.plane.shapes.len()).sum();
    let edge_count: usize = source.iter().map(|d| d.plane.edges.len()).sum();
    let mut diagram_by_element: FxIndexMap<&str, &BpmnDiagram> = FxIndexMap::default();
    let mut diagram_by_id: FxIndexMap<&str, &BpmnDiagram> = FxIndexMap::default();
    let mut shape_by_element: FxIndexMap<&str, &'s BpmnDiShape> =
        FxIndexMap::with_capacity_and_hasher(shape_count, Default::default());
    let mut edge_by_element: FxIndexMap<&str, &'s BpmnDiEdge> =
        FxIndexMap::with_capacity_and_hasher(edge_count, Default::default());
    let mut source_ids: FxIndexSet<&str> =
        FxIndexSet::with_capacity_and_hasher(shape_count + edge_count, Default::default());
    // `entry().or_insert`: the first diagram, shape or edge per key wins.
    for diagram in source {
        let element = diagram.plane.bpmn_element.as_str();
        if !element.is_empty() {
            diagram_by_element.entry(element).or_insert(diagram);
        }
        if !diagram.id.is_empty() {
            diagram_by_id.entry(&diagram.id).or_insert(diagram);
        }
        for shape in &diagram.plane.shapes {
            shape_by_element.entry(&shape.bpmn_element).or_insert(shape);
            source_ids.insert(&shape.id);
        }
        for edge in &diagram.plane.edges {
            edge_by_element.entry(&edge.bpmn_element).or_insert(edge);
            source_ids.insert(&edge.id);
        }
    }

    // A source id is reused only once, so a malformed source with two shapes
    // for one element cannot produce duplicate ids. A generated `X_di` may
    // already be the source id of another element (one renamed from `X`), so
    // generated ids steer clear of every source id.
    // The ids in use, split by where they came from so a reused source id is
    // borrowed rather than copied; an id is used when either set holds it.
    let mut used_source: FxIndexSet<&str> = FxIndexSet::default();
    let mut used_generated: FxIndexSet<String> = FxIndexSet::default();
    // An empty source id means the source omitted it; that is not one to keep.
    // Takes the generated id by value: its buffer is reused for whichever id is kept.
    let mut keep_id = |generated: String, previous: Option<&'s str>| -> String {
        let used = |id: &str, source: &FxIndexSet<&str>, generated: &FxIndexSet<String>| {
            source.contains(id) || generated.contains(id)
        };
        if let Some(p) =
            previous.filter(|p| !p.is_empty() && !used(p, &used_source, &used_generated))
        {
            used_source.insert(p);
            let mut id = generated;
            id.clear();
            id.push_str(p);
            return id;
        }
        // Checked even when `generated` equals a previous id already taken (two
        // source shapes sharing `X_di`): that id is in use, so it is not free.
        let mut id = generated;
        if source_ids.contains(id.as_str()) || used(&id, &used_source, &used_generated) {
            let base = id.clone();
            let mut n = 2;
            loop {
                id = format!("{base}_{n}");
                n += 1;
                if !(source_ids.contains(id.as_str()) || used(&id, &used_source, &used_generated)) {
                    break;
                }
            }
        }
        used_generated.insert(id.clone());
        id
    };
    let keep_label =
        |item_label: Option<BpmnDiLabel>, previous: &Option<BpmnDiLabel>| -> Option<BpmnDiLabel> {
            let Some(attrs) = previous
                .as_ref()
                .and_then(|l| l.unknown_attributes.as_ref())
            else {
                return item_label;
            };
            // When layout gives the element no label bounds, the label still carries
            // its style; BPMN DI allows a `BPMNLabel` without bounds.
            Some(BpmnDiLabel {
                bounds: item_label.and_then(|l| l.bounds),
                unknown_attributes: Some(attrs.clone()),
            })
        };

    laid_out
        .into_iter()
        .map(|diagram| {
            let previous_diagram = Some(diagram.plane.bpmn_element.as_str())
                .filter(|e| !e.is_empty())
                .and_then(|e| diagram_by_element.get(e))
                .or_else(|| {
                    Some(diagram.id.as_str())
                        .filter(|i| !i.is_empty())
                        .and_then(|i| diagram_by_id.get(i))
                })
                .copied();
            let shapes: Vec<BpmnDiShape> = diagram
                .plane
                .shapes
                .into_iter()
                .map(|shape| {
                    let Some(previous) = shape_by_element.get(shape.bpmn_element.as_str()) else {
                        let id = keep_id(shape.id, None);
                        return BpmnDiShape { id, ..shape };
                    };
                    let id = keep_id(shape.id, Some(&previous.id));
                    let mut kept = BpmnDiShape {
                        id,
                        unknown_attributes: previous.unknown_attributes.clone(),
                        ..shape
                    };
                    // Layout sets the marker only on exclusive gateways; a source value on
                    // any other shape is stale (left from an element whose type changed).
                    if kept.is_marker_visible.is_some() && previous.is_marker_visible.is_some() {
                        kept.is_marker_visible = previous.is_marker_visible;
                    }
                    kept.label = keep_label(kept.label.take(), &previous.label);
                    kept
                })
                .collect();
            let edges: Vec<BpmnDiEdge> = diagram
                .plane
                .edges
                .into_iter()
                .map(|edge| {
                    let Some(previous) = edge_by_element.get(edge.bpmn_element.as_str()) else {
                        let id = keep_id(edge.id, None);
                        return BpmnDiEdge { id, ..edge };
                    };
                    let id = keep_id(edge.id, Some(&previous.id));
                    let mut kept = BpmnDiEdge {
                        id,
                        unknown_attributes: previous.unknown_attributes.clone(),
                        ..edge
                    };
                    kept.label = keep_label(kept.label.take(), &previous.label);
                    kept
                })
                .collect();
            let mut plane = BpmnDiPlane {
                shapes,
                edges,
                ..diagram.plane
            };
            if let Some(attrs) = previous_diagram.and_then(|d| d.plane.unknown_attributes.as_ref())
            {
                plane.unknown_attributes = Some(attrs.clone());
            }

            let mut result = BpmnDiagram { plane, ..diagram };
            if let Some(d) = previous_diagram {
                if let Some(attrs) = &d.unknown_attributes {
                    result.unknown_attributes = Some(attrs.clone());
                }
                result.unknown_children = d.unknown_children.clone();
            }
            result
        })
        .collect()
}

struct Connection<'a> {
    kind: ConnectionKind,
    source: &'a str,
    target: &'a str,
}

/// `routeRepair(defs)`: the final pass over a finished plane: any connection still
/// running through a shape it is unrelated to gets an obstacle-aware route.
/// Relatedness is what a route may touch — its endpoints, the scopes and pools
/// holding them, and a boundary event's host (or a host's boundary events).
struct RouteRepair<'a> {
    parent: FxIndexMap<&'a str, &'a str>,
    attached_to: FxIndexMap<&'a str, &'a str>,
    attachers: FxIndexMap<&'a str, Vec<&'a str>>,
    connections: FxIndexMap<&'a str, Connection<'a>>,
    containers: FxIndexSet<&'a str>,
}

impl<'a> RouteRepair<'a> {
    fn new(defs: &'a BpmnDefinitions) -> Self {
        let mut me = RouteRepair {
            parent: FxIndexMap::default(),
            attached_to: FxIndexMap::default(),
            attachers: FxIndexMap::default(),
            connections: FxIndexMap::default(),
            containers: FxIndexSet::default(),
        };

        let mut participant_of: FxIndexMap<&str, &'a str> = FxIndexMap::default();
        for collab in &defs.collaborations {
            for participant in &collab.participants {
                me.containers.insert(&participant.id);
                if let Some(r) = participant.process_ref.as_deref().filter(|r| !r.is_empty()) {
                    participant_of.insert(r, &participant.id);
                }
            }
            for flow in &collab.message_flows {
                me.connect(
                    &flow.id,
                    ConnectionKind::Message,
                    &flow.source_ref,
                    &flow.target_ref,
                );
            }
            for a in &collab.associations {
                me.connect(
                    &a.id,
                    ConnectionKind::Association,
                    &a.source_ref,
                    &a.target_ref,
                );
            }
            for group in &collab.groups {
                me.containers.insert(&group.id);
            }
        }

        for process in &defs.processes {
            let owner = participant_of
                .get(process.id.as_str())
                .copied()
                .filter(|o| !o.is_empty());
            me.walk(&process.contents.flow_elements, owner);
            for flow in &process.contents.sequence_flows {
                me.connect(
                    &flow.id,
                    ConnectionKind::Sequence,
                    &flow.source_ref,
                    &flow.target_ref,
                );
            }
            for a in &process.contents.associations {
                me.connect(
                    &a.id,
                    ConnectionKind::Association,
                    &a.source_ref,
                    &a.target_ref,
                );
            }
            for group in &process.contents.groups {
                me.containers.insert(&group.id);
            }
            me.lanes(process.lane_set.as_ref());
        }
        me
    }

    fn connect(&mut self, id: &'a str, kind: ConnectionKind, source: &'a str, target: &'a str) {
        self.connections.insert(
            id,
            Connection {
                kind,
                source,
                target,
            },
        );
    }

    fn lanes(&mut self, set: Option<&'a BpmnLaneSet>) {
        let Some(set) = set else {
            return;
        };
        for lane in &set.lanes {
            self.containers.insert(&lane.id);
            self.lanes(lane.child_lane_set.as_ref());
        }
    }

    fn walk(&mut self, elements: &'a [BpmnFlowElement], owner: Option<&'a str>) {
        for element in elements {
            let id = element.base().id.as_str();
            if let Some(owner) = owner {
                self.parent.insert(id, owner);
            }
            if let BpmnFlowElement::BoundaryEvent(b) = element {
                self.attached_to.insert(id, &b.attached_to_ref);
                self.attachers
                    .entry(&b.attached_to_ref)
                    .or_default()
                    .push(id);
            }
            if let Some(c) = element.contents() {
                for flow in &c.sequence_flows {
                    self.connect(
                        &flow.id,
                        ConnectionKind::Sequence,
                        &flow.source_ref,
                        &flow.target_ref,
                    );
                }
                // A sub-process's associations are drawn on the same plane as the
                // process's own (with_nested_annotations), so they need the same repair.
                for a in &c.associations {
                    self.connect(
                        &a.id,
                        ConnectionKind::Association,
                        &a.source_ref,
                        &a.target_ref,
                    );
                }
                self.walk(&c.flow_elements, Some(id));
            }
        }
    }

    /// Appends the ids related to `id` to `out`.
    fn related(&self, id: &str, out: &mut Vec<&'a str>) {
        if let Some(attachers) = self.attachers.get(id) {
            out.extend_from_slice(attachers);
        }
        if let Some(&host) = self.attached_to.get(id).filter(|h| !h.is_empty()) {
            out.push(host);
        }
        let mut p = self.parent.get(id);
        while let Some(&cur) = p {
            out.push(cur);
            p = self.parent.get(cur);
        }
    }

    fn apply(&self, shapes: &[BpmnDiShape], edges: &mut [BpmnDiEdge]) {
        if edges.is_empty() {
            return;
        }
        let mut on_plane: FxIndexMap<&str, &BpmnBounds> =
            FxIndexMap::with_capacity_and_hasher(shapes.len(), Default::default());
        for s in shapes {
            on_plane.insert(&s.bpmn_element, &s.bounds);
        }
        let visible = |id: &'a str| -> &'a str {
            let mut current: Option<&'a str> = Some(id);
            while let Some(c) = current {
                if on_plane.contains_key(c) {
                    break;
                }
                current = self.parent.get(c).copied();
            }
            current.unwrap_or(id)
        };
        let plane_shapes: Vec<PlaneShape> = shapes
            .iter()
            .map(|s| PlaneShape {
                id: &s.bpmn_element,
                bounds: to_layout_bounds(&s.bounds),
                container: self.containers.contains(s.bpmn_element.as_str()),
            })
            .collect();
        let mut plane_edges: Vec<PlaneEdge> = Vec::with_capacity(edges.len());
        // Index of each plane edge's DI edge.
        let mut di_index: Vec<usize> = Vec::with_capacity(edges.len());
        for (i, di) in edges.iter().enumerate() {
            let Some(connection) = self.connections.get(di.bpmn_element.as_str()) else {
                continue;
            };
            plane_edges.push(PlaneEdge {
                kind: connection.kind,
                source_ref: visible(connection.source),
                target_ref: visible(connection.target),
                waypoints: di
                    .waypoints
                    .iter()
                    .map(|w| Waypoint { x: w.x, y: w.y })
                    .collect(),
            });
            di_index.push(i);
        }
        let boundary_side = |id: &str| -> Option<Side> {
            let host = self.attached_to.get(id).filter(|h| !h.is_empty());
            let own = on_plane.get(id);
            let host_bounds = host.and_then(|h| on_plane.get(*h));
            let (Some(own), Some(host_bounds)) = (own, host_bounds) else {
                return None;
            };
            if own.y + own.height / 2.0 <= host_bounds.y + 1.0 {
                Some(Side::Top)
            } else {
                Some(Side::Bottom)
            }
        };
        let related = |id: &str, out: &mut Vec<&'a str>| self.related(id, out);
        repair_routes(&plane_shapes, &mut plane_edges, &related, &boundary_side);
        for (edge, &i) in plane_edges.iter().zip(&di_index) {
            let di = &mut edges[i];
            // TS compares array identity: an unchanged route keeps its waypoints,
            // a rewritten one is rounded back onto the integer grid.
            let unchanged = edge.waypoints.len() == di.waypoints.len()
                && edge
                    .waypoints
                    .iter()
                    .zip(&di.waypoints)
                    .all(|(a, b)| a.x == b.x && a.y == b.y);
            if !unchanged {
                di.waypoints = edge
                    .waypoints
                    .iter()
                    .map(|w| wp(js::round(w.x), js::round(w.y)))
                    .collect();
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};

    fn shape(id: &str, element: &str) -> BpmnDiShape {
        BpmnDiShape {
            id: id.into(),
            ..new_shape(
                element,
                BpmnBounds {
                    x: 1.0,
                    y: 2.0,
                    width: 3.0,
                    height: 4.0,
                },
            )
        }
    }

    fn diagram(id: &str, element: &str, shapes: Vec<BpmnDiShape>) -> BpmnDiagram {
        BpmnDiagram {
            id: id.into(),
            plane: BpmnDiPlane {
                id: format!("{id}_plane"),
                bpmn_element: element.into(),
                shapes,
                edges: vec![],
                unknown_attributes: None,
            },
            unknown_attributes: None,
            unknown_children: vec![],
        }
    }

    #[test]
    fn no_processes_returns_unchanged() {
        let defs = BpmnDefinitions {
            id: "d".into(),
            ..Default::default()
        };
        assert_eq!(apply_auto_layout(&defs, LayoutEngine::Semantic, None), defs);
    }

    #[test]
    fn keep_di_keeps_source_ids_and_attributes() {
        let mut prev = shape("keep_me", "A");
        prev.unknown_attributes
            .insert("color:fill".into(), "red".into());
        prev.is_marker_visible = Some(false);
        prev.label = Some(BpmnDiLabel {
            bounds: None,
            unknown_attributes: Some(Attrs::from_iter([("k".to_string(), "v".to_string())])),
        });
        let source = vec![diagram("D", "P", vec![prev])];
        let mut fresh = shape("A_di", "A");
        fresh.is_marker_visible = Some(true);
        let out = keep_di_attributes(&source, vec![diagram("D2", "P", vec![fresh])]);
        let s = &out[0].plane.shapes[0];
        assert_eq!(s.id, "keep_me");
        assert_eq!(s.is_marker_visible, Some(false));
        assert_eq!(s.unknown_attributes.get("color:fill").unwrap(), "red");
        assert_eq!(
            s.label
                .as_ref()
                .unwrap()
                .unknown_attributes
                .as_ref()
                .unwrap()["k"],
            "v"
        );
        assert!(s.label.as_ref().unwrap().bounds.is_none());
    }

    #[test]
    fn keep_di_generated_ids_avoid_source_ids_and_duplicates() {
        // `B_di` belongs to another element in the source, so a fresh `B` must not take it.
        let source = vec![diagram("D", "P", vec![shape("B_di", "other")])];
        let laid = vec![diagram(
            "D",
            "P",
            vec![shape("B_di", "B"), shape("B_di", "C")],
        )];
        let out = keep_di_attributes(&source, laid);
        let ids: Vec<&str> = out[0].plane.shapes.iter().map(|s| s.id.as_str()).collect();
        assert_eq!(ids, ["B_di_2", "B_di_3"]);
    }

    #[test]
    fn keep_di_reuses_a_source_id_once() {
        let source = vec![diagram("D", "P", vec![shape("X", "A")])];
        let laid = vec![diagram(
            "D",
            "P",
            vec![shape("A_di", "A"), shape("A_di", "A")],
        )];
        let out = keep_di_attributes(&source, laid);
        let ids: Vec<&str> = out[0].plane.shapes.iter().map(|s| s.id.as_str()).collect();
        assert_eq!(ids, ["X", "A_di"]);
    }

    #[test]
    fn keep_di_stale_marker_is_dropped_by_layout_not_source() {
        let mut prev = shape("X", "A");
        prev.is_marker_visible = Some(true);
        let source = vec![diagram("D", "P", vec![prev])];
        // Layout set no marker (not an exclusive gateway): source value is stale.
        let out = keep_di_attributes(&source, vec![diagram("D", "P", vec![shape("A_di", "A")])]);
        assert_eq!(out[0].plane.shapes[0].is_marker_visible, None);
    }

    #[test]
    fn keep_di_diagram_attributes_follow_the_plane_element() {
        let mut d = diagram("Old", "P", vec![]);
        d.unknown_attributes = Some(Attrs::from_iter([("name".to_string(), "n".to_string())]));
        d.plane.unknown_attributes = Some(Attrs::from_iter([("pa".to_string(), "1".to_string())]));
        let out = keep_di_attributes(&[d], vec![diagram("New", "P", vec![])]);
        assert_eq!(out[0].id, "New");
        assert_eq!(out[0].unknown_attributes.as_ref().unwrap()["name"], "n");
        assert_eq!(out[0].plane.unknown_attributes.as_ref().unwrap()["pa"], "1");
    }

    #[test]
    fn nested_annotations_are_hoisted_only_when_present() {
        let process = BpmnProcess::default();
        assert!(matches!(
            with_nested_annotations(&process),
            Cow::Borrowed(_)
        ));
    }

    #[test]
    fn column_blocking_uses_identity_not_value() {
        let a = BpmnBounds {
            x: 0.0,
            y: 0.0,
            width: 10.0,
            height: 10.0,
        };
        let b = a.clone();
        // `own` holds `a`; the equal-valued `b` is still an obstacle.
        assert!(column_blocked(5.0, -5.0, 15.0, &[&a, &b], &[&a]));
        assert!(!column_blocked(5.0, -5.0, 15.0, &[&a], &[&a]));
    }

    const CASES: [&str; 4] = [
        "collaboration",
        "layout-kyc-onboarding",
        "compensation-subprocess",
        "artifacts",
    ];

    fn end_to_end(name: &str) {
        let root = env!("CARGO_MANIFEST_DIR");
        let input =
            std::fs::read_to_string(format!("{root}/../../conformance/bpmn/{name}/input.bpmn"))
                .expect("input");
        let expected = std::fs::read_to_string(format!(
            "{root}/tests/fixtures/auto_layout/{name}.expected.bpmn"
        ))
        .expect("expected");
        let defs = parse_bpmn(&input).expect("parse");
        let out = apply_auto_layout(&defs, LayoutEngine::Semantic, None);
        assert_eq!(serialize_bpmn(&out), expected, "{name}");
    }

    #[test]
    fn end_to_end_collaboration() {
        end_to_end(CASES[0]);
    }

    #[test]
    fn end_to_end_kyc_onboarding() {
        end_to_end(CASES[1]);
    }

    #[test]
    fn end_to_end_compensation_subprocess() {
        end_to_end(CASES[2]);
    }

    #[test]
    fn end_to_end_artifacts() {
        end_to_end(CASES[3]);
    }
}
