//! Twin of `layout/semantic/place.ts`.

use super::bands::{boundary_side, BandLayout};
use super::graph::SemanticGraph;
use crate::hash::{IndexMap, IndexSet};
use crate::js::cmp_num;
use crate::types::{
    element_size, Bounds, GridFill, GridHint, LaneBand, LABEL_CHAR_WIDTH, LABEL_HEIGHT,
    LABEL_MIN_WIDTH, LABEL_VERTICAL_OFFSET,
};
use bpmnkit_bpmn::model::{BpmnBoundaryEvent, BpmnFlowElement, BpmnLaneSet};

/// Geometry constants. Layout may add space beyond these; it never takes any back.
/// Hand-drawn diagrams keep about 50-60 px between neighbouring shapes; wider
/// gaps only where a flow label or a long event label needs the room.
pub const H_GAP: f64 = 60.0;
pub const V_GAP: f64 = 60.0;
/// Gap beside a column holding an expanded container. The container's border,
/// its title and the notes on its children crowd that gap, so it keeps more air.
pub const CONTAINER_GAP: f64 = 100.0;
/// Clear space either side of a flow label inside a column gap.
const LABEL_MARGIN: f64 = 10.0;
/// Gap between an event or gateway and its external label (mirrors `index.ts`).
const EXTERNAL_LABEL_OFFSET: f64 = 4.0;
const GRID_GAP_X: f64 = 40.0;
const GRID_GAP_Y: f64 = 20.0;
pub const COMPONENT_GAP: f64 = 80.0;
pub const LANE_PADDING: f64 = 40.0;
pub const BOUNDARY_SIZE: f64 = 36.0;

const DEFAULT_SIZE: (f64, f64) = (100.0, 80.0);

fn is_external_label_type(kind: &str) -> bool {
    matches!(
        kind,
        "startEvent"
            | "endEvent"
            | "intermediateThrowEvent"
            | "intermediateCatchEvent"
            | "boundaryEvent"
            | "exclusiveGateway"
            | "parallelGateway"
            | "inclusiveGateway"
            | "eventBasedGateway"
            | "complexGateway"
    )
}

/// `Placement`.
#[derive(Debug, Clone, Default)]
pub struct Placement {
    /// Absolute bounds per flow node, boundary events included.
    pub bounds: IndexMap<String, Bounds>,
    /// Lane bands in top-to-bottom order, empty when the scope has no lanes.
    pub lanes: Vec<LaneBand>,
    /// Mid-x of the empty gutter in front of each rank, keyed by rank. Vertical
    /// runs belong here: placement never puts a shape in a gutter, so these
    /// lines are clear.
    pub gutter_x: IndexMap<i64, f64>,
}

/// `externalLabelWidth(type, name)`: width of the label an event or gateway
/// carries centred below its shape; `None` for types whose name sits inside the shape.
pub fn external_label_width(kind: &str, name: &str) -> Option<f64> {
    if !is_external_label_type(kind) {
        return None;
    }
    Some((crate::js::len(name) as f64 * LABEL_CHAR_WIDTH).max(LABEL_MIN_WIDTH))
}

/// `sizeOf(el, childExtent)`: `(width, height)`.
pub fn size_of(el: &BpmnFlowElement, child_extent: Option<&Bounds>) -> (f64, f64) {
    if let Some(c) = child_extent {
        return (c.width, c.height);
    }
    element_size(el.type_name()).unwrap_or(DEFAULT_SIZE)
}

/// A name in the JS truthy sense: absent and `""` both read as no name.
fn name_of(el: &BpmnFlowElement) -> Option<&str> {
    el.base().name.as_deref().filter(|n| !n.is_empty())
}

fn size_in(sizes: &IndexMap<String, (f64, f64)>, id: &str) -> (f64, f64) {
    sizes.get(id).copied().unwrap_or(DEFAULT_SIZE)
}

#[derive(Debug, Clone, Copy)]
struct XSpan {
    left: f64,
    right: f64,
    width: f64,
}

/// `place(graph, bandLayout, sizes, laneSet, packLoose, titled, grid, axes)`.
///
/// Turn ranks and bands into coordinates.
///
/// Ranks become columns sized by their widest node, bands become rows sized by
/// their tallest. Nodes are centred in both, so any two nodes sharing a band
/// share a centre line and the spine routes as one straight segment.
///
/// `pack_loose` packs nodes that have no sequence flow at all into a wrapped
/// grid rather than one row each (the inside of an expanded sub-process).
/// `titled` are hosts whose title is drawn along their top border. `grid` is the
/// shape of the `pack_loose` grid. `axes`: for expanded containers with a flow
/// inside, the distance from the container's top to its inner spine.
#[allow(clippy::too_many_arguments)]
pub fn place(
    graph: &SemanticGraph,
    band_layout: &BandLayout,
    sizes: &IndexMap<String, (f64, f64)>,
    lane_set: Option<&BpmnLaneSet>,
    pack_loose: bool,
    titled: &IndexSet<String>,
    grid: Option<&GridHint>,
    axes: &IndexMap<String, f64>,
) -> Placement {
    let mut bounds: IndexMap<String, Bounds> = IndexMap::default();

    // Columns: one per rank, shared across components so flow stays aligned.
    let mut col_width: IndexMap<i64, f64> = IndexMap::default();
    for node in &graph.nodes {
        let id = &node.base().id;
        let rank = graph.ranks.get(id).copied().unwrap_or(0);
        let size = size_in(sizes, id);
        let w = col_width.get(&rank).copied().unwrap_or(0.0).max(size.0);
        col_width.insert(rank, w);
    }
    let mut ranks: Vec<i64> = col_width.keys().copied().collect();
    ranks.sort();
    let gaps = column_gaps(graph, sizes, &col_width, &ranks);
    let mut col_x: IndexMap<i64, f64> = IndexMap::default();
    let mut gutter_x: IndexMap<i64, f64> = IndexMap::default();
    let mut x = 0.0;
    for (i, rank) in ranks.iter().enumerate() {
        let gap = gaps.get(rank).copied().unwrap_or(H_GAP);
        if i > 0 {
            x += gap;
        }
        col_x.insert(*rank, x);
        gutter_x.insert(*rank, x - gap / 2.0);
        x += col_width.get(rank).copied().unwrap_or(0.0);
    }
    let x_of = |id: &str| -> XSpan {
        let size = size_in(sizes, id);
        let rank = graph.ranks.get(id).copied().unwrap_or(0);
        let cw = col_width.get(&rank).copied().unwrap_or(size.0);
        let left = col_x.get(&rank).copied().unwrap_or(0.0) + (cw - size.0) / 2.0;
        XSpan {
            left,
            right: left + size.0,
            width: size.0,
        }
    };

    // Rows: one line per band, laid out per component then stacked.
    let loose = if pack_loose {
        loose_nodes(graph)
    } else {
        Vec::new()
    };
    let loose_set: IndexSet<&String> = loose.iter().collect();
    let mut cursor_y = 0.0;
    for members_all in &graph.components {
        let members: Vec<String> = members_all
            .iter()
            .filter(|id| graph.by_id.contains_key(id.as_str()))
            .cloned()
            .collect();
        if members.is_empty() {
            continue;
        }
        if members.len() == 1 && loose_set.contains(&members[0]) {
            // The whole grid takes the place of the first loose node; the rest are in it.
            if Some(&members[0]) == loose.first() {
                cursor_y = place_grid(graph, &loose, sizes, cursor_y, &mut bounds, grid);
            }
            continue;
        }

        let lines = band_lines(graph, band_layout, &members, sizes, &x_of, axes, titled);
        let mut top = f64::INFINITY;
        let mut bottom = f64::NEG_INFINITY;
        for id in &members {
            let line = lines
                .line
                .get(&band_layout.bands.get(id).copied().unwrap_or(0))
                .copied()
                .unwrap_or(0.0);
            let Some(extent) = lines.extent.get(id) else {
                continue;
            };
            top = top.min(line - extent.above);
            bottom = bottom.max(line + extent.below);
        }
        let dy = cursor_y - top;
        for id in &members {
            let size = size_in(sizes, id);
            let line = lines
                .line
                .get(&band_layout.bands.get(id).copied().unwrap_or(0))
                .copied()
                .unwrap_or(0.0);
            let left = x_of(id).left;
            bounds.insert(
                id.clone(),
                Bounds {
                    x: left,
                    y: line + dy - centre_offset(id, size, axes),
                    width: size.0,
                    height: size.1,
                },
            );
        }

        cursor_y = bottom + dy + COMPONENT_GAP;
    }

    separate_same_cell(graph, band_layout, &mut bounds);
    let lanes = match lane_set {
        Some(ls) => apply_lanes(graph, ls, &mut bounds),
        None => Vec::new(),
    };
    dock_boundary_events(graph, &mut bounds, titled);
    Placement {
        bounds,
        lanes,
        gutter_x,
    }
}

/// `columnGaps`: the gap in front of each rank. At least [`H_GAP`]; wider where
/// a flow label sits between two neighbouring columns, or where events' and
/// gateways' labels, centred below shapes narrower than themselves, would meet.
fn column_gaps(
    graph: &SemanticGraph,
    sizes: &IndexMap<String, (f64, f64)>,
    col_width: &IndexMap<i64, f64>,
    ranks: &[i64],
) -> IndexMap<i64, f64> {
    let rank_of = |id: &str| -> i64 {
        let host: &str = match graph.by_id.get(id).copied() {
            Some(BpmnFlowElement::BoundaryEvent(be)) => be.attached_to_ref.as_str(),
            _ => id,
        };
        graph.ranks.get(host).copied().unwrap_or(0)
    };
    let position: IndexMap<i64, usize> = ranks.iter().enumerate().map(|(i, r)| (*r, i)).collect();
    let mut tall: IndexSet<i64> = IndexSet::default();
    for node in &graph.nodes {
        let id = &node.base().id;
        if size_in(sizes, id).1 > DEFAULT_SIZE.1 {
            tall.insert(graph.ranks.get(id).copied().unwrap_or(0));
        }
    }
    let mut overhang: IndexMap<i64, f64> = IndexMap::default();
    for node in &graph.nodes {
        let Some(name) = name_of(node) else { continue };
        let Some(width) = external_label_width(node.type_name(), name) else {
            continue;
        };
        let id = &node.base().id;
        let rank = graph.ranks.get(id).copied().unwrap_or(0);
        let cw = col_width
            .get(&rank)
            .copied()
            .unwrap_or_else(|| size_in(sizes, id).0);
        let o = overhang
            .get(&rank)
            .copied()
            .unwrap_or(0.0)
            .max((width - cw) / 2.0);
        overhang.insert(rank, o);
    }
    let mut gaps: IndexMap<i64, f64> = IndexMap::default();
    for (i, rank) in ranks.iter().enumerate() {
        if i == 0 {
            continue;
        }
        let previous = ranks[i - 1];
        let labels = 0f64.max(overhang.get(&previous).copied().unwrap_or(0.0))
            + 0f64.max(overhang.get(rank).copied().unwrap_or(0.0));
        let base = if tall.contains(rank) || tall.contains(&previous) {
            CONTAINER_GAP
        } else {
            H_GAP
        };
        gaps.insert(
            *rank,
            base.max(labels + 2.0 * EXTERNAL_LABEL_OFFSET + LABEL_MARGIN),
        );
    }
    for flows in graph.outgoing.values() {
        for flow in flows {
            let name = match flow.name.as_deref() {
                Some(n) if !n.is_empty() => n,
                _ => continue,
            };
            if graph.back_edges.contains(&flow.id) {
                continue;
            }
            let target = rank_of(&flow.target_ref);
            let Some(at) = position.get(&target).copied() else {
                continue;
            };
            if at == 0 {
                continue;
            }
            // Only a flow between neighbouring columns has nowhere else to put its label.
            if position.get(&rank_of(&flow.source_ref)).copied() != Some(at - 1) {
                continue;
            }
            let need = (crate::js::len(name) as f64 * LABEL_CHAR_WIDTH).max(LABEL_MIN_WIDTH)
                + 2.0 * LABEL_MARGIN;
            let g = gaps.get(&target).copied().unwrap_or(H_GAP).max(need);
            gaps.insert(target, g);
        }
    }
    gaps
}

/// `centreOffset`: how far a node's centre line sits below its top.
fn centre_offset(id: &str, size: (f64, f64), axes: &IndexMap<String, f64>) -> f64 {
    if size.1 <= DEFAULT_SIZE.1 {
        return size.1 / 2.0;
    }
    // A tall container carries its inner spine on the row's line; one without an
    // inner flow (a tool grid) hangs from the task line instead.
    axes.get(id).copied().unwrap_or(DEFAULT_SIZE.1 / 2.0)
}

#[derive(Debug, Clone, Copy)]
struct Extent {
    above: f64,
    below: f64,
}

/// `extentOf`: space a node needs above and below its band's line: its shape,
/// the label below an event or gateway, and the boundary events docked on its
/// borders together with their labels.
fn extent_of(
    graph: &SemanticGraph,
    id: &str,
    size: (f64, f64),
    axes: &IndexMap<String, f64>,
    titled: &IndexSet<String>,
) -> Extent {
    let offset = centre_offset(id, size, axes);
    let mut above = offset;
    let mut below = size.1 - offset;
    if let Some(el) = graph.by_id.get(id).copied() {
        if let Some(name) = name_of(el) {
            if external_label_width(el.type_name(), name).is_some() {
                below = below.max(size.1 / 2.0 + EXTERNAL_LABEL_OFFSET + LABEL_HEIGHT);
            }
        }
    }
    for event in graph.attachers.get(id).into_iter().flatten() {
        let named = event.base.name.as_deref().is_some_and(|n| !n.is_empty());
        let reach = BOUNDARY_SIZE / 2.0
            + if named {
                EXTERNAL_LABEL_OFFSET + LABEL_HEIGHT
            } else {
                0.0
            };
        if boundary_side(event, titled.contains(id)) == -1 {
            above = above.max(offset + reach);
        } else {
            below = below.max(size.1 - offset + reach);
        }
    }
    Extent { above, below }
}

struct BandLines {
    line: IndexMap<i64, f64>,
    extent: IndexMap<String, Extent>,
}

struct Placed {
    left: f64,
    right: f64,
    top: f64,
    bottom: f64,
}

fn x_overlap(a: (f64, f64), b: (f64, f64)) -> bool {
    a.0 < b.1 && b.0 < a.1
}

/// `bandLines`: the y of each band's line, relative to the spine at 0.
///
/// Bands keep their order, but a band only clears what it actually sits under
/// or over: the shapes above it in its own columns, and those its connecting
/// flows run past. A tall sub-process therefore pushes down only the branches
/// beneath it, not every branch in the diagram.
fn band_lines(
    graph: &SemanticGraph,
    band_layout: &BandLayout,
    members: &[String],
    sizes: &IndexMap<String, (f64, f64)>,
    x_of: &dyn Fn(&str) -> XSpan,
    axes: &IndexMap<String, f64>,
    titled: &IndexSet<String>,
) -> BandLines {
    let mut extent: IndexMap<String, Extent> = IndexMap::default();
    let mut by_band: IndexMap<i64, Vec<String>> = IndexMap::default();
    for id in members {
        extent.insert(
            id.clone(),
            extent_of(graph, id, size_in(sizes, id), axes, titled),
        );
        let band = band_layout.bands.get(id).copied().unwrap_or(0);
        by_band.entry(band).or_default().push(id.clone());
    }
    let mut line: IndexMap<i64, f64> = IndexMap::default();
    // Placed boxes: x-range and how far they reach above / below their line.
    let mut placed: Vec<Placed> = Vec::new();
    let place_band =
        |band: i64, y: f64, line: &mut IndexMap<i64, f64>, placed: &mut Vec<Placed>| {
            line.insert(band, y);
            for id in by_band.get(&band).into_iter().flatten() {
                let XSpan { left, right, .. } = x_of(id);
                let e = extent.get(id).copied().unwrap_or(Extent {
                    above: 0.0,
                    below: 0.0,
                });
                placed.push(Placed {
                    left,
                    right,
                    top: y - e.above,
                    bottom: y + e.below,
                });
            }
        };
    // Centre x of every node a band's members connect to, so the band clears its own flows.
    let span = |band: i64| -> (f64, f64) {
        let mut left = f64::INFINITY;
        let mut right = f64::NEG_INFINITY;
        let member_set: IndexSet<&str> = by_band
            .get(&band)
            .into_iter()
            .flatten()
            .map(|s| s.as_str())
            .collect();
        let mut take = |id: &str| {
            let host: &str = match graph.by_id.get(id).copied() {
                Some(BpmnFlowElement::BoundaryEvent(be)) => be.attached_to_ref.as_str(),
                _ => id,
            };
            if !graph.by_id.contains_key(host) {
                return;
            }
            let b = x_of(host);
            let mid = b.left + b.width / 2.0;
            let in_band = member_set.contains(&host);
            left = left.min(if in_band { b.left } else { mid });
            right = right.max(if in_band { b.right } else { mid });
        };
        for id in &member_set {
            take(id);
            for f in graph.outgoing.get(*id).into_iter().flatten() {
                if !graph.back_edges.contains(&f.id) {
                    take(&f.target_ref);
                }
            }
            for f in graph.incoming.get(*id).into_iter().flatten() {
                if !graph.back_edges.contains(&f.id) {
                    take(&f.source_ref);
                }
            }
        }
        (left, right)
    };

    let bands: Vec<i64> = by_band.keys().copied().collect();
    if by_band.contains_key(&0) {
        place_band(0, 0.0, &mut line, &mut placed);
    }
    let mut below: Vec<i64> = bands.iter().copied().filter(|b| *b > 0).collect();
    below.sort();
    let mut above: Vec<i64> = bands.iter().copied().filter(|b| *b < 0).collect();
    above.sort_by(|a, b| b.cmp(a));
    for (list, dir) in [(below, 1i64), (above, -1i64)] {
        let mut previous = 0.0;
        for band in list {
            let wide = span(band);
            let mut y = previous + dir as f64;
            for bx in &placed {
                if x_overlap((bx.left, bx.right), wide) {
                    y = if dir == 1 {
                        y.max(bx.bottom + V_GAP)
                    } else {
                        y.min(bx.top - V_GAP)
                    };
                }
                for id in by_band.get(&band).into_iter().flatten() {
                    let b = x_of(id);
                    let e = extent.get(id).copied().unwrap_or(Extent {
                        above: 0.0,
                        below: 0.0,
                    });
                    let reach = (b.left - H_GAP / 2.0, b.right + H_GAP / 2.0);
                    if !x_overlap((bx.left, bx.right), reach) {
                        continue;
                    }
                    y = if dir == 1 {
                        y.max(bx.bottom + V_GAP + e.above)
                    } else {
                        y.min(bx.top - V_GAP - e.below)
                    };
                }
            }
            place_band(band, y, &mut line, &mut placed);
            previous = y;
        }
    }
    BandLines { line, extent }
}

/// `looseNodes`: nodes with no incoming or outgoing flow, in declaration order,
/// only when there are at least two of them, since one has nothing to be packed with.
fn loose_nodes(graph: &SemanticGraph) -> Vec<String> {
    let loose: Vec<String> = graph
        .components
        .iter()
        .filter(|members| members.len() == 1)
        .map(|members| members[0].clone())
        // A one-node component can still loop on itself; that node has flow.
        .filter(|id| {
            graph.by_id.contains_key(id.as_str())
                && graph.outgoing.get(id.as_str()).is_none_or(|v| v.is_empty())
                && graph.incoming.get(id.as_str()).is_none_or(|v| v.is_empty())
        })
        .collect();
    if loose.len() >= 2 {
        loose
    } else {
        Vec::new()
    }
}

/// `placeGrid`: place `ids` row by row in `ceil(sqrt(n))` columns of equal cells,
/// starting at `top`, so the set grows roughly square. A hint can fix the column
/// count and fill column by column instead. Returns the cursor for whatever is
/// stacked below.
fn place_grid(
    graph: &SemanticGraph,
    ids: &[String],
    sizes: &IndexMap<String, (f64, f64)>,
    top: f64,
    bounds: &mut IndexMap<String, Bounds>,
    hint: Option<&GridHint>,
) -> f64 {
    let n = ids.len() as f64;
    let columns = match hint.and_then(|h| h.columns) {
        Some(c) => c as f64,
        None => n.sqrt().ceil(),
    };
    let rows = (n / columns).ceil();
    let by_column = hint.and_then(|h| h.fill) == Some(GridFill::Column);
    let mut cell_width: f64 = 0.0;
    let mut cell_height: f64 = 0.0;
    let mut labelled = false;
    for id in ids {
        let size = size_in(sizes, id);
        // An event's or gateway's label is centred below it and can be wider than the
        // shape; the cell holds it so neighbouring columns' labels never meet.
        let label =
            graph.by_id.get(id.as_str()).copied().and_then(|el| {
                name_of(el).and_then(|name| external_label_width(el.type_name(), name))
            });
        if label.is_some() {
            labelled = true;
        }
        cell_width = cell_width.max(size.0).max(label.unwrap_or(0.0));
        cell_height = cell_height.max(size.1);
    }
    // Loose nodes carry no flows, so the routing gutters are not needed between
    // them; only a label below a cell needs vertical room.
    let gap_x = GRID_GAP_X;
    let gap_y = GRID_GAP_Y
        + if labelled {
            LABEL_VERTICAL_OFFSET + LABEL_HEIGHT
        } else {
            0.0
        };
    for (i, id) in ids.iter().enumerate() {
        let i = i as f64;
        let size = size_in(sizes, id);
        let column = if by_column {
            (i / rows).floor()
        } else {
            i % columns
        };
        let row = if by_column {
            i % rows
        } else {
            (i / columns).floor()
        };
        bounds.insert(
            id.clone(),
            Bounds {
                x: column * (cell_width + gap_x) + (cell_width - size.0) / 2.0,
                y: top + row * (cell_height + gap_y) + (cell_height - size.1) / 2.0,
                width: size.0,
                height: size.1,
            },
        );
    }
    top + rows * (cell_height + gap_y) - gap_y + COMPONENT_GAP
}

/// `separateSameCell`: two nodes can land in the same rank and band (a parallel
/// split whose branches were compacted onto one band, for instance). Push the
/// later ones down in declaration order until the cell is clear.
fn separate_same_cell(
    graph: &SemanticGraph,
    band_layout: &BandLayout,
    bounds: &mut IndexMap<String, Bounds>,
) {
    let mut component_of: IndexMap<&str, usize> = IndexMap::default();
    for (i, comp) in graph.components.iter().enumerate() {
        for id in comp {
            component_of.insert(id.as_str(), i);
        }
    }

    // Scoped per component: components occupy their own vertical space already,
    // so two nodes sharing a rank and band across components do not collide.
    let mut cells: IndexMap<String, Vec<&str>> = IndexMap::default();
    for node in &graph.nodes {
        let id = node.base().id.as_str();
        let rank = graph.ranks.get(id).copied().unwrap_or(0);
        let band = band_layout.bands.get(id).copied().unwrap_or(0);
        let key = format!(
            "{}:{}:{}",
            component_of.get(id).copied().unwrap_or(0),
            rank,
            band
        );
        cells.entry(key).or_default().push(id);
    }

    for ids in cells.values() {
        if ids.len() < 2 {
            continue;
        }
        let mut offset = 0.0;
        for id in ids {
            let Some(b) = bounds.get_mut(*id) else {
                continue;
            };
            b.y += offset;
            offset += b.height + V_GAP;
        }
    }
}

struct LaneNode<'a> {
    id: &'a str,
    refs: &'a [String],
    children: Vec<LaneNode<'a>>,
}

/// `laneTree`.
fn lane_tree(lane_set: &BpmnLaneSet) -> Vec<LaneNode<'_>> {
    lane_set
        .lanes
        .iter()
        .map(|lane| LaneNode {
            id: lane.id.as_str(),
            refs: lane.flow_node_refs.as_slice(),
            children: lane
                .child_lane_set
                .as_ref()
                .map_or_else(Vec::new, lane_tree),
        })
        .collect()
}

fn collect_leaves<'a, 'b>(nodes: &'b [LaneNode<'a>], leaves: &mut Vec<&'b LaneNode<'a>>) {
    for node in nodes {
        if !node.children.is_empty() {
            collect_leaves(&node.children, leaves);
        } else {
            leaves.push(node);
        }
    }
}

fn emit_lanes(
    nodes: &[LaneNode],
    span: &mut IndexMap<String, (f64, f64)>,
    slots: &mut Vec<LaneBand>,
    left: f64,
    width: f64,
) -> Option<(f64, f64)> {
    let mut extent: Option<(f64, f64)> = None;
    for node in nodes {
        let own = if !node.children.is_empty() {
            emit_lanes(&node.children, span, slots, left, width)
        } else {
            span.get(node.id).copied()
        };
        let Some(own) = own else { continue };
        if !node.children.is_empty() {
            span.insert(node.id.to_string(), own);
        }
        slots.push(LaneBand {
            id: node.id.to_string(),
            bounds: Bounds {
                x: left,
                y: own.0,
                width,
                height: own.1 - own.0,
            },
        });
        extent = Some(match extent {
            Some(e) => (e.0.min(own.0), e.1.max(own.1)),
            None => own,
        });
    }
    extent
}

/// `applyLanes`: move every node into the lane it belongs to, then size the
/// lanes to their content. Ranks are untouched, so left-to-right flow survives
/// the shift.
///
/// Nested lane sets keep both levels: leaf lanes take a band each, and an
/// ancestor lane spans the bands of its descendants.
fn apply_lanes(
    graph: &SemanticGraph,
    lane_set: &BpmnLaneSet,
    bounds: &mut IndexMap<String, Bounds>,
) -> Vec<LaneBand> {
    let tree = lane_tree(lane_set);
    if tree.is_empty() {
        return Vec::new();
    }

    let mut leaves: Vec<&LaneNode> = Vec::new();
    collect_leaves(&tree, &mut leaves);

    let mut lane_of: IndexMap<&str, &LaneNode> = IndexMap::default();
    for leaf in &leaves {
        for r in leaf.refs {
            lane_of.insert(r.as_str(), leaf);
        }
    }

    let mut members: IndexMap<&str, Vec<&str>> = IndexMap::default();
    for leaf in &leaves {
        members.insert(leaf.id, Vec::new());
    }
    let mut orphans: Vec<&str> = Vec::new();
    for node in &graph.nodes {
        let id = node.base().id.as_str();
        let list = lane_of.get(id).and_then(|lane| members.get_mut(lane.id));
        match list {
            Some(l) => l.push(id),
            None => orphans.push(id),
        }
    }

    let mut min_x = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    for b in bounds.values() {
        min_x = min_x.min(b.x);
        max_x = max_x.max(b.x + b.width);
    }
    if !min_x.is_finite() {
        return Vec::new();
    }

    let width = max_x - min_x + 2.0 * LANE_PADDING;
    let left = min_x - LANE_PADDING;
    let mut span: IndexMap<String, (f64, f64)> = IndexMap::default();
    let mut top = 0.0;

    for leaf in &leaves {
        // Duplicated ids stay in the list: the TS shifts the shared bounds once per entry.
        let own: Vec<&str> = members
            .get(leaf.id)
            .map(|v| {
                v.iter()
                    .copied()
                    .filter(|n| bounds.contains_key(*n))
                    .collect()
            })
            .unwrap_or_default();
        let mut height = 2.0 * LANE_PADDING + BOUNDARY_SIZE;
        if !own.is_empty() {
            let lowest = own
                .iter()
                .map(|n| bounds[*n].y)
                .fold(f64::INFINITY, f64::min);
            height = own
                .iter()
                .map(|n| bounds[*n].y + bounds[*n].height)
                .fold(f64::NEG_INFINITY, f64::max)
                - lowest
                + 2.0 * LANE_PADDING;
            let shift = top + LANE_PADDING - lowest;
            for n in &own {
                if let Some(b) = bounds.get_mut(*n) {
                    b.y += shift;
                }
            }
        }
        span.insert(leaf.id.to_string(), (top, top + height));
        top += height;
    }

    // Unclaimed nodes keep a band of their own rather than being attributed to a
    // lane they are not a member of.
    if !orphans.is_empty() {
        let own: Vec<&str> = orphans
            .iter()
            .copied()
            .filter(|n| bounds.contains_key(*n))
            .collect();
        if !own.is_empty() {
            let lowest = own
                .iter()
                .map(|n| bounds[*n].y)
                .fold(f64::INFINITY, f64::min);
            let shift = top + LANE_PADDING - lowest;
            for n in &own {
                if let Some(b) = bounds.get_mut(*n) {
                    b.y += shift;
                }
            }
        }
    }

    let mut slots: Vec<LaneBand> = Vec::new();
    emit_lanes(&tree, &mut span, &mut slots, left, width);

    // Outermost first, so a parent lane is drawn behind the lanes it contains.
    slots.sort_by(|a, b| {
        cmp_num(b.bounds.height, a.bounds.height).then_with(|| cmp_num(a.bounds.y, b.bounds.y))
    });
    slots
}

/// `dockBoundaryEvents`: dock boundary events on their host's edge (escalation
/// on top, everything else on the bottom), spread along it. Events sharing a
/// side are ordered by how far out from that border their handler ended up, then
/// how far it runs, farthest first, so outer slots serve outer paths and the
/// routes nest. The side comes from [`boundary_side`], the rule that also placed
/// the handler's band, so a handler is never routed around its own host.
fn dock_boundary_events(
    graph: &SemanticGraph,
    bounds: &mut IndexMap<String, Bounds>,
    titled: &IndexSet<String>,
) {
    for (host_id, events) in &graph.attachers {
        let Some(host) = bounds.get(host_id).copied() else {
            continue;
        };

        let mut sides: IndexMap<bool, Vec<&BpmnBoundaryEvent>> = IndexMap::default();
        for event in events {
            // `true` is the top border.
            let top = boundary_side(event, titled.contains(host_id)) == -1;
            sides.entry(top).or_default().push(event);
        }

        for (top, list) in &sides {
            let mut ordered: Vec<&BpmnBoundaryEvent> = list.clone();
            ordered.sort_by(|a, b| {
                cmp_num(
                    handler_depth(graph, bounds, host_id, &host, *top, &b.base.id),
                    handler_depth(graph, bounds, host_id, &host, *top, &a.base.id),
                )
                .then_with(|| {
                    handler_reach(graph, &b.base.id).cmp(&handler_reach(graph, &a.base.id))
                })
            });
            let n = ordered.len();
            for (i, event) in ordered.iter().enumerate() {
                bounds.insert(
                    event.base.id.clone(),
                    Bounds {
                        x: host.x + ((i + 1) as f64 * host.width) / (n + 1) as f64
                            - BOUNDARY_SIZE / 2.0,
                        y: (if *top { host.y } else { host.y + host.height }) - BOUNDARY_SIZE / 2.0,
                        width: BOUNDARY_SIZE,
                        height: BOUNDARY_SIZE,
                    },
                );
            }
        }
    }
}

/// `handlerDepth`: how far out from the docked border the handler of a boundary
/// event sits, measured on the final positions (after lanes, which can reorder
/// handlers against their bands). Negative when the handler lies behind the border.
///
/// Each handler leaves its event straight out and turns toward its target, so
/// the event docked outermost has to serve the farthest handler; otherwise its
/// turn cuts across the stems of the events docked inside it.
fn handler_depth(
    graph: &SemanticGraph,
    bounds: &IndexMap<String, Bounds>,
    host_id: &str,
    host: &Bounds,
    top: bool,
    event_id: &str,
) -> f64 {
    let mut depth = f64::NEG_INFINITY;
    // Flows out of a boundary event are keyed by its host (see graph.ts).
    for flow in graph.outgoing.get(host_id).into_iter().flatten() {
        if flow.source_ref != event_id {
            continue;
        }
        let Some(target) = bounds.get(&flow.target_ref) else {
            continue;
        };
        let centre = target.y + target.height / 2.0;
        depth = depth.max(if top {
            host.y - centre
        } else {
            centre - (host.y + host.height)
        });
    }
    if depth.is_finite() {
        depth
    } else {
        0.0
    }
}

/// `handlerReach`: how far the handler of a boundary event runs, in ranks.
fn handler_reach(graph: &SemanticGraph, event_id: &str) -> i64 {
    let mut reach = 0;
    for flows in graph.outgoing.values() {
        for flow in flows {
            if flow.source_ref != event_id {
                continue;
            }
            reach = reach.max(graph.ranks.get(&flow.target_ref).copied().unwrap_or(0));
        }
    }
    reach
}
