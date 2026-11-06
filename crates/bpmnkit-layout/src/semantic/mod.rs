//! Twin of `layout/semantic/index.ts`.

pub mod bands;
pub mod graph;
pub mod place;
pub mod route;

use crate::grid::edge_labels::place_edge_labels;
use crate::hash::{IndexMap, IndexSet};
use crate::js;
use crate::types::{
    Bounds, GridHint, LayoutEdge, LayoutNode, LayoutResult, Plane, Waypoint, LABEL_CHAR_WIDTH,
    LABEL_HEIGHT, LABEL_MIN_WIDTH, SUBPROCESS_PADDING,
};
use bands::assign_bands;
use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnLaneSet, BpmnProcess, BpmnSequenceFlow};
use graph::build_semantic_graph;
use place::{external_label_width, place, size_of};
use route::route_flows;

/// Padding between an expanded sub-process border and its children.
const SUB_PADDING: f64 = SUBPROCESS_PADDING;
/// Extra top padding inside a named expanded sub-process, for its title.
const TITLE_BAND: f64 = 28.0;
/// Gap between an event or gateway and its external label.
const LABEL_OFFSET: f64 = 4.0;

fn is_container_type(kind: &str) -> bool {
    matches!(
        kind,
        "subProcess" | "adHocSubProcess" | "eventSubProcess" | "transaction"
    )
}

/// `semanticLayoutProcess(process, collapsed, grids)`.
///
/// Lay out a process the way the BPMN reads: ranks carry the flow left to right,
/// semantic bands carry branch meaning up and down, and lane membership wins over
/// both.
pub fn semantic_layout_process(
    process: &BpmnProcess,
    collapsed: &indexmap::IndexSet<String>,
    grids: Option<&indexmap::IndexMap<String, GridHint>>,
) -> LayoutResult {
    semantic_layout(
        &process.contents.flow_elements,
        &process.contents.sequence_flows,
        process.lane_set.as_ref(),
        collapsed,
        false,
        grids,
        None,
    )
}

/// `semanticLayout(flowElements, sequenceFlows, laneSet, collapsed, inContainer, grids, grid)`.
///
/// `collapsed`: sub-processes drawn collapsed, whose contents go on a plane of their
/// own. `in_container`: true for the contents of an expanded sub-process (see
/// `place`'s `packLoose`). `grids`: tool-grid hints by container id, applied to the
/// containers in this scope and below. `grid`: the hint for this scope's own grid,
/// when it is a hinted container's interior.
pub fn semantic_layout(
    flow_elements: &[BpmnFlowElement],
    sequence_flows: &[BpmnSequenceFlow],
    lane_set: Option<&BpmnLaneSet>,
    collapsed: &indexmap::IndexSet<String>,
    in_container: bool,
    grids: Option<&indexmap::IndexMap<String, GridHint>>,
    grid: Option<&GridHint>,
) -> LayoutResult {
    if flow_elements.is_empty() {
        return LayoutResult::default();
    }

    let graph = build_semantic_graph(flow_elements, sequence_flows);

    // Children first: an expanded sub-process is sized by what it contains, while
    // a collapsed one stays activity-sized and its contents move to their own plane.
    let mut child_results: IndexMap<String, LayoutResult> = IndexMap::default();
    let mut planes: Vec<Plane> = Vec::new();
    let mut sizes: IndexMap<String, (f64, f64)> = IndexMap::default();
    let mut axes: IndexMap<String, f64> = IndexMap::default();
    for el in &graph.nodes {
        let id = &el.base().id;
        let Some(child) = child_layout_of(el, collapsed, grids) else {
            sizes.insert(id.clone(), size_of(el, None));
            continue;
        };
        if collapsed.contains(id) {
            let nested = child.result.planes.clone().unwrap_or_default();
            planes.push(Plane {
                element_id: id.clone(),
                result: child.result,
            });
            planes.extend(nested);
            sizes.insert(id.clone(), size_of(el, None));
        } else {
            planes.extend(child.result.planes.clone().unwrap_or_default());
            child_results.insert(id.clone(), child.result);
            sizes.insert(id.clone(), child.size);
            if let Some(axis) = child.axis {
                axes.insert(id.clone(), axis);
            }
        }
    }

    // A named expanded sub-process draws its title along its top border.
    let titled: IndexSet<String> = child_results
        .keys()
        .filter(|id| {
            graph
                .by_id
                .get(id.as_str())
                .is_some_and(|el| el.base().name.is_some())
        })
        .cloned()
        .collect();
    let band_layout = assign_bands(&graph, &titled);
    let placement = place(
        &graph,
        &band_layout,
        &sizes,
        lane_set,
        in_container,
        &titled,
        grid,
        &axes,
    );
    let bounds = &placement.bounds;
    let beside_stem = boundary_labels(&graph, bounds);

    let mut nodes: Vec<LayoutNode> = Vec::new();
    for el in flow_elements {
        let base = el.base();
        let Some(b) = bounds.get(&base.id).copied() else {
            continue;
        };
        let band = band_layout.bands.get(&base.id).copied().unwrap_or(0);
        let mut node = LayoutNode {
            id: base.id.clone(),
            kind: el.type_name().to_string(),
            bounds: b,
            layer: graph.ranks.get(&base.id).copied().unwrap_or(0),
            position: band,
            grid_row: Some(band),
            label: None,
            label_bounds: None,
            is_expanded: None,
        };
        if let Some(name) = base.name.as_deref().filter(|n| !n.is_empty()) {
            node.label = Some(name.to_string());
            node.label_bounds = beside_stem
                .get(&base.id)
                .copied()
                .or_else(|| external_label(el.type_name(), name, &b));
        }
        if child_results.contains_key(&base.id) {
            node.is_expanded = Some(true);
        } else if collapsed.contains(&base.id) {
            node.is_expanded = Some(false);
        }
        nodes.push(node);
    }

    let mut edges = route_flows(
        &graph,
        sequence_flows,
        bounds,
        &band_layout,
        &placement.gutter_x,
    );

    // Drop the children in, translated into their parent's interior.
    for (parent_id, child) in child_results {
        let Some(parent) = bounds.get(&parent_id) else {
            continue;
        };
        let Some(extent) = extent_of(&child) else {
            continue;
        };
        let named = graph
            .by_id
            .get(parent_id.as_str())
            .is_some_and(|el| el.base().name.is_some());
        let dx = parent.x + SUB_PADDING - extent.x;
        let dy = parent.y + SUB_PADDING + if named { TITLE_BAND } else { 0.0 } - extent.y;
        for mut node in child.nodes {
            node.bounds = shift(&node.bounds, dx, dy);
            if let Some(lb) = &node.label_bounds {
                node.label_bounds = Some(shift(lb, dx, dy));
            }
            nodes.push(node);
        }
        for mut edge in child.edges {
            edge.waypoints = edge
                .waypoints
                .iter()
                .map(|wp| Waypoint {
                    x: wp.x + dx,
                    y: wp.y + dy,
                })
                .collect();
            if let Some(lb) = &edge.label_bounds {
                edge.label_bounds = Some(shift(lb, dx, dy));
            }
            edges.push(edge);
        }
    }

    clear_external_labels(&mut nodes, &edges);
    // A gateway's branch labels read as the answer to its question, so they go
    // right at its exit rather than halfway along the flow.
    let gateways: IndexSet<&str> = nodes
        .iter()
        .filter(|n| n.kind.ends_with("Gateway"))
        .map(|n| n.id.as_str())
        .collect();
    let near_source: IndexSet<String> = edges
        .iter()
        .filter(|e| gateways.contains(e.source_ref.as_str()))
        .map(|e| e.id.clone())
        .collect();
    let mut node_map: IndexMap<String, &LayoutNode> = IndexMap::default();
    for n in &nodes {
        node_map.insert(n.id.clone(), n);
    }
    place_edge_labels(&mut edges, &node_map, &near_source);

    let lanes = placement.lanes;
    LayoutResult {
        nodes,
        edges,
        lanes: if lanes.is_empty() { None } else { Some(lanes) },
        planes: if planes.is_empty() {
            None
        } else {
            Some(planes)
        },
    }
}

struct ChildLayout {
    result: LayoutResult,
    size: (f64, f64),
    /// Distance from the container's top to its inner spine, when it has a flow.
    axis: Option<f64>,
}

/// Lay out a container's children and report the size its border needs.
fn child_layout_of(
    el: &BpmnFlowElement,
    collapsed: &indexmap::IndexSet<String>,
    grids: Option<&indexmap::IndexMap<String, GridHint>>,
) -> Option<ChildLayout> {
    if !is_container_type(el.type_name()) {
        return None;
    }
    let container = el.contents()?;
    if container.flow_elements.is_empty() {
        return None;
    }
    let base = el.base();

    let result = semantic_layout(
        &container.flow_elements,
        &container.sequence_flows,
        // TS reads `container.laneSet`, which the model never sets on a sub-process.
        None,
        collapsed,
        // A collapsed container's contents go on a plane of their own, laid out
        // like any top-level scope.
        !collapsed.contains(&base.id),
        grids,
        grids.and_then(|g| g.get(&base.id)),
    );
    let extent = extent_of(&result)?;

    let title_band = if base.name.is_some() { TITLE_BAND } else { 0.0 };
    // The inner spine is band 0; its first node sets the line the parent row continues.
    let spine_node = if !result.edges.is_empty() {
        result
            .nodes
            .iter()
            .find(|n| n.position == 0 && n.kind != "boundaryEvent")
    } else {
        None
    };
    let size = (
        extent.width + 2.0 * SUB_PADDING,
        extent.height + 2.0 * SUB_PADDING + title_band,
    );
    let axis = spine_node
        .map(|s| s.bounds.y + s.bounds.height / 2.0 - extent.y + SUB_PADDING + title_band);
    Some(ChildLayout { result, size, axis })
}

fn extent_of(result: &LayoutResult) -> Option<Bounds> {
    let mut min_x = f64::INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut max_y = f64::NEG_INFINITY;
    let mut consider = |x: f64, y: f64, width: f64, height: f64| {
        min_x = js::min(min_x, x);
        min_y = js::min(min_y, y);
        max_x = js::max(max_x, x + width);
        max_y = js::max(max_y, y + height);
    };
    for node in &result.nodes {
        let b = &node.bounds;
        consider(b.x, b.y, b.width, b.height);
        if let Some(l) = &node.label_bounds {
            consider(l.x, l.y, l.width, l.height);
        }
    }
    for edge in &result.edges {
        for wp in &edge.waypoints {
            consider(wp.x, wp.y, 0.0, 0.0);
        }
    }
    if !min_x.is_finite() {
        return None;
    }
    Some(Bounds {
        x: min_x,
        y: min_y,
        width: max_x - min_x,
        height: max_y - min_y,
    })
}

fn shift(b: &Bounds, dx: f64, dy: f64) -> Bounds {
    Bounds {
        x: b.x + dx,
        y: b.y + dy,
        width: b.width,
        height: b.height,
    }
}

/// Labels that fit no gap, placed past the outer labels once those are known.
struct Spill {
    event_id: String,
    b: Bounds,
    full: f64,
}

/// Labels for named boundary events, beside the event's exit stem rather than
/// centred on it.
///
/// A boundary event's flows leave its outward side at the centre, so a label
/// centred below (or above) the event is crossed by its own exit edge. Labels
/// sit on the outward side, outside the host, in the gaps between the stems of
/// the events docked on that border: each gap holds at most one label, and the
/// gaps beyond the first and last stem are unbounded. A label takes the gap on
/// its left if it fits there, else the one on its right. When neither fits, it
/// goes beyond the outermost stem on its nearer side, past the labels already
/// there. Every label stays on one line in the one row next to the host:
/// routing does not see labels, and anything farther out would reach the turn
/// a route takes just past a stem.
fn boundary_labels(
    graph: &graph::SemanticGraph,
    bounds: &IndexMap<String, Bounds>,
) -> IndexMap<String, Bounds> {
    let mut labels: IndexMap<String, Bounds> = IndexMap::default();
    for (host_id, events) in &graph.attachers {
        let Some(host) = bounds.get(host_id) else {
            continue;
        };
        let docked: Vec<_> = events
            .iter()
            .filter_map(|event| bounds.get(&event.base.id).map(|b| (*event, *b)))
            .collect();
        for on_top in [true, false] {
            // Same side test the router uses to pick the exit direction.
            let mut side: Vec<_> = docked
                .iter()
                .filter(|(_, b)| (b.y + b.height / 2.0 <= host.y + 1.0) == on_top)
                .copied()
                .collect();
            side.sort_by(|p, q| js::cmp_num(p.1.x, q.1.x));
            let stems: Vec<f64> = side.iter().map(|(_, b)| b.x + b.width / 2.0).collect();
            // How far labels beyond the first / last stem already reach.
            let mut outer_left = stems.first().copied().unwrap_or(0.0) - LABEL_OFFSET;
            let mut outer_right = stems.last().copied().unwrap_or(0.0) + LABEL_OFFSET;
            let mut spill_left: Vec<Spill> = Vec::new();
            let mut spill_right: Vec<Spill> = Vec::new();
            let place_at = |b: &Bounds, x: f64, width: f64| Bounds {
                x,
                y: if on_top {
                    b.y - LABEL_OFFSET - LABEL_HEIGHT
                } else {
                    b.y + b.height + LABEL_OFFSET
                },
                width,
                height: LABEL_HEIGHT,
            };
            let mut left_gap_taken = false;
            for (i, (event, b)) in side.iter().enumerate() {
                let stem = stems[i];
                let Some(name) = event.base.name.as_deref().filter(|n| !n.is_empty()) else {
                    left_gap_taken = false;
                    continue;
                };
                let previous = if i == 0 {
                    f64::NEG_INFINITY
                } else {
                    stems[i - 1]
                };
                let next = stems.get(i + 1).copied().unwrap_or(f64::INFINITY);
                let left_room = if left_gap_taken {
                    0.0
                } else {
                    stem - previous - 2.0 * LABEL_OFFSET
                };
                let right_room = next - stem - 2.0 * LABEL_OFFSET;
                let full = js::max(js::len(name) as f64 * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH);
                left_gap_taken = false;
                if left_room >= full {
                    let x = stem - LABEL_OFFSET - full;
                    if i == 0 {
                        outer_left = x - LABEL_OFFSET;
                    }
                    labels.insert(event.base.id.clone(), place_at(b, x, full));
                    continue;
                }
                if right_room >= full {
                    if i == side.len() - 1 {
                        outer_right = stem + 2.0 * LABEL_OFFSET + full;
                    }
                    labels.insert(
                        event.base.id.clone(),
                        place_at(b, stem + LABEL_OFFSET, full),
                    );
                    left_gap_taken = true;
                    continue;
                }
                // Neither gap holds it: beyond the outermost stem no stem crosses it.
                let spill = Spill {
                    event_id: event.base.id.clone(),
                    b: *b,
                    full,
                };
                if (i as f64) < side.len() as f64 / 2.0 {
                    spill_left.push(spill);
                } else {
                    spill_right.push(spill);
                }
            }
            // Nearest stems first, so the order outward matches the order of the events.
            for s in spill_left.iter().rev() {
                outer_left -= s.full;
                labels.insert(s.event_id.clone(), place_at(&s.b, outer_left, s.full));
                outer_left -= LABEL_OFFSET;
            }
            for s in &spill_right {
                labels.insert(s.event_id.clone(), place_at(&s.b, outer_right, s.full));
                outer_right += s.full + LABEL_OFFSET;
            }
        }
    }
    labels
}

/// Move an event's or gateway's label off the flows that leave or pass it.
///
/// The label starts centred below the shape, where a branch leaving through the
/// bottom would cut through it. It then tries above, and beside the vertical
/// stems on either side, keeping the first spot clear of every flow, shape and
/// label; with none clear it stays below.
fn clear_external_labels(nodes: &mut [LayoutNode], edges: &[LayoutEdge]) {
    let mut segments: Vec<(Waypoint, Waypoint)> = Vec::new();
    for edge in edges {
        for pair in edge.waypoints.windows(2) {
            segments.push((pair[0], pair[1]));
        }
    }
    let contains = |outer: &Bounds, inner: &Bounds| {
        outer.x <= inner.x
            && outer.y <= inner.y
            && outer.x + outer.width >= inner.x + inner.width
            && outer.y + outer.height >= inner.y + inner.height
    };
    // TS keeps the label objects themselves, so a label moved below is seen at
    // its new spot by later nodes: hold node indices and read them live.
    let labels: Vec<usize> = (0..nodes.len())
        .filter(|&k| nodes[k].label_bounds.is_some())
        .collect();
    for k in 0..nodes.len() {
        let Some(label) = nodes[k].label_bounds else {
            continue;
        };
        if nodes[k].kind == "boundaryEvent" {
            continue;
        }
        let clear = |nodes: &[LayoutNode], b: &Bounds| -> bool {
            let node = &nodes[k];
            !segments.iter().any(|(p, q)| segment_cuts(p, q, b))
                && !nodes.iter().enumerate().any(|(o, other)| {
                    o != k
                        && !contains(&other.bounds, &node.bounds)
                        && overlaps_box(&other.bounds, b)
                })
                && !labels.iter().any(|&o| {
                    o != k
                        && nodes[o]
                            .label_bounds
                            .is_some_and(|other| overlaps_box(&other, b))
                })
        };
        if clear(nodes, &label) {
            continue;
        }
        let b = nodes[k].bounds;
        let cx = b.x + b.width / 2.0;
        let below = b.y + b.height + LABEL_OFFSET;
        let above = b.y - LABEL_OFFSET - label.height;
        let beside = 2.0 * LABEL_OFFSET;
        let candidates = [
            Bounds { y: above, ..label },
            Bounds {
                x: cx + beside,
                y: below,
                ..label
            },
            Bounds {
                x: cx - beside - label.width,
                y: below,
                ..label
            },
            Bounds {
                x: cx + beside,
                y: above,
                ..label
            },
            Bounds {
                x: cx - beside - label.width,
                y: above,
                ..label
            },
        ];
        if let Some(spot) = candidates.iter().find(|c| clear(nodes, c)) {
            if let Some(lb) = nodes[k].label_bounds.as_mut() {
                lb.x = spot.x;
                lb.y = spot.y;
            }
        }
    }
}

fn overlaps_box(a: &Bounds, b: &Bounds) -> bool {
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/// True when the axis-parallel segment p→q runs through the box.
fn segment_cuts(p: &Waypoint, q: &Waypoint, b: &Bounds) -> bool {
    js::max(p.x, q.x) > b.x
        && js::min(p.x, q.x) < b.x + b.width
        && js::max(p.y, q.y) > b.y
        && js::min(p.y, q.y) < b.y + b.height
}

/// Events and gateways carry their name outside the shape; activities do not.
fn external_label(kind: &str, name: &str, bounds: &Bounds) -> Option<Bounds> {
    let width = external_label_width(kind, name)?;
    Some(Bounds {
        x: bounds.x + bounds.width / 2.0 - width / 2.0,
        y: bounds.y + bounds.height + LABEL_OFFSET,
        width,
        height: LABEL_HEIGHT,
    })
}
