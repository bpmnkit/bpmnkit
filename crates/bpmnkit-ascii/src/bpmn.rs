//! Twin of `packages/ascii/src/render.ts`, `shapes.ts` and `edges.ts`.

use crate::grid::{truncate, Grid};
use crate::js::{self, half, U16s};
use crate::{titled, AsciiOptions};
use bpmnkit_bpmn::model::BpmnDefinitions;
use bpmnkit_layout::js::round;
use bpmnkit_layout::{
    layout_flow_nodes, LayoutEdge, LayoutNode, GRID_CELL_HEIGHT, GRID_CELL_WIDTH,
};
use std::collections::HashMap;

const TASK_W: i64 = 24;
const ELEM_W: i64 = 11;
const GATEWAY_W: i64 = 9;
const CELL_W: i64 = 28;
const CELL_H: i64 = 8;
const TASK_INNER: i64 = TASK_W - 2;
const ELEM_INNER: i64 = ELEM_W - 2;

pub(crate) fn render(defs: &BpmnDefinitions, options: &AsciiOptions) -> U16s {
    let Some(process) = defs.processes.first() else {
        return js::u("(empty)");
    };
    // The grid engine without the overlap assertion: pixel overlaps vanish when scaled to rows.
    let layout = layout_flow_nodes(
        &process.contents.flow_elements,
        &process.contents.sequence_flows,
    );
    let (nodes, edges) = (&layout.nodes, &layout.edges);
    if nodes.is_empty() {
        return js::u("(empty)");
    }

    let max_layer = nodes.iter().map(node_layer).max().unwrap_or(0);
    let max_mid_row = nodes.iter().map(node_mid_row).max().unwrap_or(0);
    let mut grid = Grid::new((max_layer + 1) * CELL_W + 4, max_mid_row + CELL_H + 1);

    let mut by_id: HashMap<&str, &LayoutNode> = HashMap::new();
    for node in nodes {
        by_id.insert(node.id.as_str(), node);
    }
    let ports = compute_edge_ports(edges, &by_id);

    // Edges first so shapes draw over any overlap.
    for edge in edges {
        let (Some(src), Some(dst)) = (
            by_id.get(edge.source_ref.as_str()),
            by_id.get(edge.target_ref.as_str()),
        ) else {
            continue;
        };
        let (src_port, dst_port) = ports
            .get(edge.id.as_str())
            .copied()
            .unwrap_or((Port::Right, Port::Left));
        let src_col = if src_port == Port::Right {
            exit_col(&src.kind, node_layer(src))
        } else {
            mid_col(&src.kind, node_layer(src))
        };
        let dst_col = if dst_port == Port::Left {
            entry_col(&dst.kind, node_layer(dst))
        } else {
            mid_col(&dst.kind, node_layer(dst))
        };
        let label = edge.label.as_deref().map(js::u);
        draw_ported_edge(
            &mut grid,
            src_col,
            node_mid_row(src),
            src_port,
            dst_col,
            node_mid_row(dst),
            dst_port,
            label.as_deref(),
        );
    }

    for node in nodes {
        draw_element(
            &mut grid,
            &node.kind,
            node_layer(node),
            node_mid_row(node) - 1,
            &js::u(node.label.as_deref().unwrap_or("")),
        );
    }

    titled(options, process.name.as_deref(), grid.render())
}

/// The node's middle ASCII row, recovered from the grid cell its bounds are centred in.
fn node_mid_row(node: &LayoutNode) -> i64 {
    let b = &node.bounds;
    let cell_y = b.y + b.height / 2.0 - GRID_CELL_HEIGHT / 2.0;
    let cell_row = round(cell_y / GRID_CELL_HEIGHT * CELL_H as f64) as i64;
    cell_row + (CELL_H - 3) / 2 + 1
}

/// The column index from the x centre: the grid engine leaves `layer` at 0.
fn node_layer(node: &LayoutNode) -> i64 {
    let b = &node.bounds;
    round((b.x + b.width / 2.0) / GRID_CELL_WIDTH) as i64
}

// ── Element classification ──────────────────────────────────────────────────

fn is_task_like(kind: &str) -> bool {
    matches!(
        kind,
        "task"
            | "serviceTask"
            | "userTask"
            | "scriptTask"
            | "sendTask"
            | "receiveTask"
            | "businessRuleTask"
            | "manualTask"
            | "callActivity"
            | "subProcess"
            | "adHocSubProcess"
            | "eventSubProcess"
            | "transaction"
    )
}

fn is_gateway(kind: &str) -> bool {
    matches!(
        kind,
        "exclusiveGateway"
            | "parallelGateway"
            | "inclusiveGateway"
            | "eventBasedGateway"
            | "complexGateway"
    )
}

fn task_tag(kind: &str) -> &'static str {
    match kind {
        "serviceTask" => "[svc] ",
        "userTask" => "[usr] ",
        "scriptTask" => "[scr] ",
        "sendTask" => "[snd] ",
        "receiveTask" => "[rcv] ",
        "businessRuleTask" => "[dmn] ",
        "manualTask" => "[man] ",
        "callActivity" => "[cal] ",
        "subProcess" | "adHocSubProcess" | "eventSubProcess" => "[sub] ",
        "transaction" => "[txn] ",
        _ => "",
    }
}

fn element_marker(kind: &str) -> &'static str {
    match kind {
        "startEvent" => "○",
        "endEvent" => "●",
        "intermediateCatchEvent" => "◎",
        "intermediateThrowEvent" => "◉",
        "boundaryEvent" => "◈",
        "exclusiveGateway" => "×",
        "parallelGateway" => "+",
        "inclusiveGateway" => "◇",
        "eventBasedGateway" => "?",
        "complexGateway" => "✱",
        _ => "·",
    }
}

// ── Positions ───────────────────────────────────────────────────────────────

fn elem_w(kind: &str) -> i64 {
    if is_task_like(kind) {
        TASK_W
    } else if is_gateway(kind) {
        GATEWAY_W
    } else {
        ELEM_W
    }
}

fn elem_col(kind: &str, layer: i64) -> i64 {
    layer * CELL_W + (CELL_W - elem_w(kind)) / 2
}

fn mid_col(kind: &str, layer: i64) -> i64 {
    elem_col(kind, layer) + elem_w(kind) / 2
}

fn exit_col(kind: &str, layer: i64) -> i64 {
    elem_col(kind, layer) + elem_w(kind)
}

fn entry_col(kind: &str, layer: i64) -> i64 {
    elem_col(kind, layer)
}

// ── Shapes ──────────────────────────────────────────────────────────────────

fn draw_element(grid: &mut Grid, kind: &str, layer: i64, row: i64, label: &[u16]) {
    let col = elem_col(kind, layer);
    if is_task_like(kind) {
        let mut content = js::u(task_tag(kind));
        content.extend_from_slice(label);
        draw_box(grid, col, row, TASK_INNER, ['┌', '┐', '└', '┘'], &content);
    } else {
        let mut content = js::u(element_marker(kind));
        content.push(b' ' as u16);
        content.extend_from_slice(label);
        if is_gateway(kind) {
            draw_box(
                grid,
                col,
                row,
                GATEWAY_W - 2,
                ['/', '\\', '\\', '/'],
                &content,
            );
        } else {
            draw_box(grid, col, row, ELEM_INNER, ['╭', '╮', '╰', '╯'], &content);
        }
    }
}

/// A 3-row box: corners `[tl, tr, bl, br]`, `│` sides, ` content` truncated inside.
fn draw_box(grid: &mut Grid, col: i64, row: i64, inner: i64, corners: [char; 4], content: &[u16]) {
    let [tl, tr, bl, br] = corners;
    let bar = js::repeat("─", inner);
    grid.set_char(col, row, tl);
    grid.write(col + 1, row, &bar);
    grid.set_char(col + inner + 1, row, tr);

    grid.set_char(col, row + 1, '│');
    let mut text = vec![b' ' as u16];
    text.extend(truncate(content, inner - 1));
    grid.write(col + 1, row + 1, &text);
    grid.set_char(col + inner + 1, row + 1, '│');

    grid.set_char(col, row + 2, bl);
    grid.write(col + 1, row + 2, &bar);
    grid.set_char(col + inner + 1, row + 2, br);
}

// ── Ports ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Port {
    Right,
    Left,
    Top,
    Bottom,
}

/// `computeEdgePorts`: gateways fan their forward edges out over top, right and bottom,
/// ordered by target row; a right exit into a gateway enters it from the side it comes from.
fn compute_edge_ports<'a>(
    edges: &'a [LayoutEdge],
    by_id: &HashMap<&str, &LayoutNode>,
) -> HashMap<&'a str, (Port, Port)> {
    let mut src_ports: HashMap<&str, Port> = HashMap::new();
    // Insertion-ordered like the TS Map.
    let mut by_source: Vec<(&str, Vec<&LayoutEdge>)> = vec![];
    for edge in edges {
        let src = by_id.get(edge.source_ref.as_str());
        let dst = by_id.get(edge.target_ref.as_str());
        match (src, dst) {
            (Some(s), Some(d)) if is_gateway(&s.kind) && node_layer(d) > node_layer(s) => {
                match by_source.iter_mut().find(|(k, _)| *k == edge.source_ref) {
                    Some((_, list)) => list.push(edge),
                    None => by_source.push((edge.source_ref.as_str(), vec![edge])),
                }
            }
            _ => {
                src_ports.insert(edge.id.as_str(), Port::Right);
            }
        }
    }

    for (_, outgoing) in &by_source {
        let n = outgoing.len();
        if n == 1 {
            src_ports.insert(outgoing[0].id.as_str(), Port::Right);
            continue;
        }
        let mut sorted = outgoing.clone();
        sorted.sort_by_key(|e| node_mid_row(by_id[e.target_ref.as_str()]));
        for (i, edge) in sorted.iter().enumerate() {
            let port = if n % 2 == 1 {
                let mid = n / 2;
                match i.cmp(&mid) {
                    std::cmp::Ordering::Less => Port::Top,
                    std::cmp::Ordering::Equal => Port::Right,
                    std::cmp::Ordering::Greater => Port::Bottom,
                }
            } else if i < n / 2 {
                Port::Top
            } else {
                Port::Bottom
            };
            src_ports.insert(edge.id.as_str(), port);
        }
    }

    let mut result = HashMap::new();
    for edge in edges {
        let src_port = src_ports
            .get(edge.id.as_str())
            .copied()
            .unwrap_or(Port::Right);
        let mut dst_port = Port::Left;
        if src_port == Port::Right {
            let src = by_id.get(edge.source_ref.as_str());
            let dst = by_id.get(edge.target_ref.as_str());
            if let (Some(s), Some(d)) = (src, dst) {
                if is_gateway(&d.kind) {
                    let (sr, dr) = (node_mid_row(s), node_mid_row(d));
                    if sr < dr {
                        dst_port = Port::Top;
                    } else if sr > dr {
                        dst_port = Port::Bottom;
                    }
                }
            }
        }
        result.insert(edge.id.as_str(), (src_port, dst_port));
    }
    result
}

// ── Edges ───────────────────────────────────────────────────────────────────

/// Writes `label` centred between `a` and `b`, truncated to `b - a` units.
fn write_label(grid: &mut Grid, a: i64, b: i64, row: i64, label: Option<&[u16]>) {
    if let Some(label) = label.filter(|l| !l.is_empty()) {
        let col = half(a + b) - half(js::len(label));
        grid.write(col, row, &truncate(label, b - a));
    }
}

fn hseg(grid: &mut Grid, a: i64, b: i64, row: i64) {
    for c in a..=b {
        grid.set_line(c, row, '─');
    }
}

fn vseg(grid: &mut Grid, col: i64, from: i64, to_excl: i64) {
    for r in from..to_excl {
        grid.set_line(col, r, '│');
    }
}

#[allow(clippy::too_many_arguments)]
fn draw_ported_edge(
    grid: &mut Grid,
    src_col: i64,
    src_row: i64,
    src_port: Port,
    dst_col: i64,
    dst_row: i64,
    dst_port: Port,
    label: Option<&[u16]>,
) {
    match (src_port, dst_port) {
        (Port::Top, Port::Left) => {
            if src_row > dst_row {
                grid.set_line(src_col, dst_row, '┌');
                vseg(grid, src_col, dst_row + 1, src_row - 1);
                hseg(grid, src_col + 1, dst_col - 2, dst_row);
                grid.set_char(dst_col - 1, dst_row, '►');
                write_label(grid, src_col, dst_col, dst_row - 1, label);
            } else {
                let route = 1;
                grid.set_line(src_col, route, '└');
                vseg(grid, src_col, route + 1, src_row - 1);
                hseg(grid, src_col + 1, dst_col - 2, route);
                grid.set_line(dst_col - 1, route, '┐');
                vseg(grid, dst_col - 1, route + 1, dst_row);
                grid.set_char(dst_col - 1, dst_row, '►');
                write_label(grid, src_col, dst_col, route - 1, label);
            }
        }
        (Port::Bottom, Port::Left) => {
            if src_row < dst_row {
                grid.set_line(src_col, dst_row, '└');
                vseg(grid, src_col, src_row + 2, dst_row);
                hseg(grid, src_col + 1, dst_col - 2, dst_row);
                grid.set_char(dst_col - 1, dst_row, '►');
                write_label(grid, src_col, dst_col, dst_row - 1, label);
            } else {
                let route = grid.rows - 2;
                grid.set_line(src_col, route, '┌');
                vseg(grid, src_col, src_row + 2, route);
                hseg(grid, src_col + 1, dst_col - 2, route);
                grid.set_line(dst_col - 1, route, '┘');
                vseg(grid, dst_col - 1, dst_row + 1, route);
                grid.set_char(dst_col - 1, dst_row, '►');
                write_label(grid, src_col, dst_col, route + 1, label);
            }
        }
        (Port::Right, Port::Top) if src_row < dst_row => {
            hseg(grid, src_col, dst_col - 1, src_row);
            grid.set_line(dst_col, src_row, '┐');
            vseg(grid, dst_col, src_row + 1, dst_row - 2);
            grid.set_char(dst_col, dst_row - 2, '▼');
            write_label(grid, src_col, dst_col, src_row - 1, label);
        }
        (Port::Right, Port::Bottom) if src_row > dst_row => {
            hseg(grid, src_col, dst_col - 1, src_row);
            grid.set_line(dst_col, src_row, '┘');
            vseg(grid, dst_col, dst_row + 3, src_row);
            grid.set_char(dst_col, dst_row + 2, '▲');
            write_label(grid, src_col, dst_col, src_row - 1, label);
        }
        _ => draw_edge(grid, src_col, src_row, dst_col, dst_row, label),
    }
}

/// Orthogonal edge from a right exit to a left entry: straight, L-shaped right after the
/// exit (so siblings split into clean `├` junctions), or a loop over row 0 when backward.
fn draw_edge(
    grid: &mut Grid,
    src_col: i64,
    src_row: i64,
    dst_col: i64,
    dst_row: i64,
    label: Option<&[u16]>,
) {
    if dst_col <= src_col {
        draw_backward_edge(grid, src_col, src_row, dst_col, dst_row);
        return;
    }
    if src_row == dst_row {
        hseg(grid, src_col, dst_col - 2, src_row);
        grid.set_char(dst_col - 1, src_row, '►');
        write_label(grid, src_col, dst_col, src_row - 1, label);
        return;
    }
    let mid = src_col + 1;
    let down = dst_row > src_row;
    hseg(grid, src_col, mid - 1, src_row);
    grid.set_line(mid, src_row, if down { '┐' } else { '┘' });
    vseg(grid, mid, src_row.min(dst_row) + 1, src_row.max(dst_row));
    grid.set_line(mid, dst_row, if down { '└' } else { '┌' });
    hseg(grid, mid + 1, dst_col - 2, dst_row);
    grid.set_char(dst_col - 1, dst_row, '►');
    if let Some(label) = label.filter(|l| !l.is_empty()) {
        let col = half(src_col + mid) - half(js::len(label));
        grid.write(col, src_row - 1, &truncate(label, mid - src_col));
    }
}

fn draw_backward_edge(grid: &mut Grid, src_col: i64, src_row: i64, dst_col: i64, dst_row: i64) {
    let route = 0;
    vseg(grid, src_col, route + 1, src_row);
    grid.set_line(src_col, src_row, '┘');
    grid.set_line(src_col, route, '┐');
    for c in dst_col + 1..src_col {
        grid.set_line(c, route, '─');
    }
    grid.set_line(dst_col, route, '┌');
    vseg(grid, dst_col, route + 1, dst_row);
    grid.set_char(dst_col - 1, dst_row, '►');
}
