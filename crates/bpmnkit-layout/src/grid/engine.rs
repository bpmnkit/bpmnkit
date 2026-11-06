//! Twin of `layout/grid/grid-engine.ts`.

use super::edge_labels::place_edge_labels;
use super::flow_graph::{build_flow_graph, FlowGraph};
use super::grid::Grid;
use super::router::{
    collapse_collinear, connect_elements, ensure_exit_bottom, GridDims, RoutableNode,
};
use super::walker::create_grid_layout;
use crate::hash::IndexMap;
use crate::js;
use crate::types::{
    element_size, Bounds, LayoutEdge, LayoutNode, LayoutResult, GRID_CELL_HEIGHT, GRID_CELL_WIDTH,
};
use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnSequenceFlow};

const DEFAULT_SIZE: (f64, f64) = (100.0, 80.0);
const CHILD_SHIFT_X: f64 = 50.0; // upstream: CELL_W/2 - baseW/4
const CHILD_SHIFT_Y: f64 = 40.0; // upstream: CELL_H - baseH - baseH/4

struct LevelLayout<'a> {
    graph: FlowGraph<'a>,
    grid: Grid<usize>,
    children: IndexMap<&'a str, LevelLayout<'a>>,
}

fn is_sub_type(kind: &str) -> bool {
    matches!(
        kind,
        "subProcess" | "adHocSubProcess" | "eventSubProcess" | "transaction"
    )
}

/// `gridLayoutFlowNodes(flowNodes, sequenceFlows)`.
pub fn grid_layout_flow_nodes(
    flow_nodes: &[BpmnFlowElement],
    sequence_flows: &[BpmnSequenceFlow],
) -> LayoutResult {
    if flow_nodes.is_empty() {
        return LayoutResult::default();
    }
    let root = build_level(flow_nodes, sequence_flows, false);
    let mut out = LayoutResult::default();
    emit_level(&root, (0.0, 0.0), &mut out);
    let node_map: IndexMap<&str, &LayoutNode> =
        out.nodes.iter().map(|n| (n.id.as_str(), n)).collect();
    place_edge_labels(&mut out.edges, &node_map, &[]);
    out
}

fn build_level<'a>(
    flow_nodes: &'a [BpmnFlowElement],
    sequence_flows: &'a [BpmnSequenceFlow],
    compact: bool,
) -> LevelLayout<'a> {
    let graph = build_flow_graph(flow_nodes, sequence_flows);
    let mut children: IndexMap<&'a str, LevelLayout<'a>> = IndexMap::default();
    for &idx in &graph.elements {
        let el = graph.node(idx);
        if !is_sub_type(el.type_name()) {
            continue;
        }
        let Some(contents) = el.contents() else {
            continue;
        };
        if contents.flow_elements.is_empty() {
            continue;
        }
        let child_flows = &contents.sequence_flows;
        let child_compact = el.type_name() == "adHocSubProcess" && child_flows.is_empty();
        children.insert(
            el.base().id.as_str(),
            build_level(&contents.flow_elements, child_flows, child_compact),
        );
    }
    let mut grid = create_grid_layout(&graph, compact);
    expand_for_children(&mut grid, &graph, &children);
    LevelLayout {
        graph,
        grid,
        children,
    }
}

/// Insert blank cols/rows after every cell holding an expanded subprocess (§A.2.3).
fn expand_for_children(
    grid: &mut Grid<usize>,
    graph: &FlowGraph,
    children: &IndexMap<&str, LevelLayout>,
) {
    if children.is_empty() {
        return;
    }
    // columns, right-to-left
    for c in (0..grid.col_count()).rev() {
        let mut max_cols = 0;
        for (element, _, col) in grid.elements_by_position() {
            if col != c {
                continue;
            }
            if let Some(child) = children.get(graph.id(element)) {
                max_cols = max_cols.max(child.grid.col_count());
            }
        }
        if max_cols > 0 {
            grid.create_col(c, max_cols.max(2));
        }
    }
    // rows, bottom-to-top
    for r in (0..grid.row_count()).rev() {
        let mut max_rows = 0;
        for (element, row, _) in grid.elements_by_position() {
            if row != r {
                continue;
            }
            if let Some(child) = children.get(graph.id(element)) {
                max_rows = max_rows.max(child.grid.row_count());
            }
        }
        for _ in 0..max_rows {
            grid.create_row(Some(r));
        }
    }
}

fn size_of(el: &BpmnFlowElement) -> (f64, f64) {
    element_size(el.type_name()).unwrap_or(DEFAULT_SIZE)
}

fn label_width_for(name: &str) -> f64 {
    // Cap label width to one grid cell so labels don't overlap adjacent elements
    js::min(js::max(js::len(name) as f64 * 7.0, 40.0), GRID_CELL_WIDTH)
}

fn emit_level(level: &LevelLayout, shift: (f64, f64), out: &mut LayoutResult) {
    let graph = &level.graph;
    let mut routables: IndexMap<&str, RoutableNode> =
        IndexMap::with_capacity_and_hasher(graph.nodes.len(), Default::default());
    let mut expanded_rows_by_row: IndexMap<i64, usize> = IndexMap::default();
    let mut boundary_bounds: IndexMap<&str, Bounds> = IndexMap::default();

    // Pass 1: shapes (+ boundary events + recursion into children)
    for (idx, row, col) in level.grid.elements_by_position() {
        let element = graph.node(idx);
        let id = element.base().id.as_str();
        let base = size_of(element);
        let child = level.children.get(id);
        let bounds = Bounds {
            x: col as f64 * GRID_CELL_WIDTH + (GRID_CELL_WIDTH - base.0) / 2.0 + shift.0,
            y: row as f64 * GRID_CELL_HEIGHT + (GRID_CELL_HEIGHT - base.1) / 2.0 + shift.1,
            width: match child {
                Some(c) => c.grid.col_count() as f64 * GRID_CELL_WIDTH + base.0,
                None => base.0,
            },
            height: match child {
                Some(c) => c.grid.row_count() as f64 * GRID_CELL_HEIGHT + base.1,
                None => base.1,
            },
        };
        let mut layout_node = LayoutNode {
            id: id.to_string(),
            kind: element.type_name().into(),
            bounds,
            layer: col as i64,
            position: row as i64,
            grid_row: Some(row as i64),
            ..Default::default()
        };
        if let Some(name) = element.base().name.as_deref().filter(|n| !n.is_empty()) {
            layout_node.label = Some(name.to_string());
        }
        layout_node.label_bounds = compute_label_bounds(element, &bounds);
        if child.is_some() {
            layout_node.is_expanded = Some(true);
        }
        out.nodes.push(layout_node);

        let child_dims = child.map(|c| GridDims {
            rows: c.grid.row_count(),
            cols: c.grid.col_count(),
        });
        routables.insert(
            id,
            RoutableNode {
                id,
                bounds,
                row: row as i64,
                col: col as i64,
                child_grid: child_dims,
                host_child_grid: None,
            },
        );
        if let Some(c) = child {
            let prev = expanded_rows_by_row
                .get(&(row as i64))
                .copied()
                .unwrap_or(0);
            expanded_rows_by_row.insert(row as i64, prev.max(c.grid.row_count()));
        }

        // boundary events ride on the host's bottom edge
        let attachers: &[usize] = graph.attachers.get(id).map(Vec::as_slice).unwrap_or(&[]);
        let n = attachers.len();
        for (i, &be_idx) in attachers.iter().enumerate() {
            let be = graph.node(be_idx);
            let be_id = be.base().id.as_str();
            let be_bounds = Bounds {
                x: bounds.x + ((i + 1) as f64 * bounds.width) / (n + 1) as f64 - 18.0,
                y: bounds.y + bounds.height - 18.0,
                width: 36.0,
                height: 36.0,
            };
            let mut be_node = LayoutNode {
                id: be_id.to_string(),
                kind: be.type_name().into(),
                bounds: be_bounds,
                layer: col as i64,
                position: row as i64,
                grid_row: Some(row as i64),
                ..Default::default()
            };
            if let Some(name) = be.base().name.as_deref().filter(|n| !n.is_empty()) {
                be_node.label = Some(name.to_string());
                let label_width = label_width_for(name);
                be_node.label_bounds = Some(Bounds {
                    x: be_bounds.x + be_bounds.width / 2.0 - label_width / 2.0,
                    y: be_bounds.y + be_bounds.height + 4.0,
                    width: label_width,
                    height: 14.0,
                });
            }
            out.nodes.push(be_node);

            boundary_bounds.insert(be_id, be_bounds);
            routables.insert(
                be_id,
                RoutableNode {
                    id: be_id,
                    bounds: be_bounds,
                    row: row as i64,
                    col: col as i64,
                    child_grid: None,
                    host_child_grid: child_dims,
                },
            );
        }

        if let Some(c) = child {
            emit_level(c, (bounds.x + CHILD_SHIFT_X, bounds.y + CHILD_SHIFT_Y), out);
        }
    }

    // Pass 2: edges of THIS level
    for flows in graph.outgoing.values() {
        for flow in flows {
            let (Some(source), Some(target)) = (
                routables.get(flow.source_ref.as_str()),
                routables.get(flow.target_ref.as_str()),
            ) else {
                continue;
            };
            let mut waypoints =
                connect_elements(source, target, &level.grid, shift, &expanded_rows_by_row);
            if let Some(be_b) = boundary_bounds.get(flow.source_ref.as_str()) {
                waypoints = ensure_exit_bottom(be_b, &waypoints);
            }
            let mut edge = LayoutEdge {
                id: flow.id.clone(),
                source_ref: flow.source_ref.clone(),
                target_ref: flow.target_ref.clone(),
                waypoints: collapse_collinear(&waypoints),
                ..Default::default()
            };
            if let Some(name) = flow.name.as_deref().filter(|n| !n.is_empty()) {
                edge.label = Some(name.to_string());
            }
            out.edges.push(edge);
        }
    }
}

/// Copied from coordinates.ts:141: events and gateways get a label below the shape.
fn compute_label_bounds(node: &BpmnFlowElement, bounds: &Bounds) -> Option<Bounds> {
    let name = node.base().name.as_deref().filter(|n| !n.is_empty())?;
    let label_width = label_width_for(name);
    let label_height = 14.0;

    match node.type_name() {
        // Labels centered below events, and below gateway diamonds (standard BPMN
        // convention)
        "startEvent"
        | "endEvent"
        | "intermediateThrowEvent"
        | "intermediateCatchEvent"
        | "exclusiveGateway"
        | "parallelGateway"
        | "inclusiveGateway"
        | "eventBasedGateway" => Some(Bounds {
            x: bounds.x + bounds.width / 2.0 - label_width / 2.0,
            y: bounds.y + bounds.height + 4.0,
            width: label_width,
            height: label_height,
        }),
        // Tasks/activities: labels centered inside, no separate label bounds needed
        _ => None,
    }
}
