//! Twin of `layout/annotations.ts`.
//!
//! Text-annotation packer. Constants, formulas and control flow match the TS (and the
//! reference script it was ported from) exactly.

use crate::js;
use crate::types::{AnnotationSide, Bounds, LayoutEdge, LayoutNode, Waypoint};
use bpmnkit_bpmn::model::BpmnProcess;
use indexmap::{IndexMap, IndexSet};

const ANN_WIDTH: f64 = 200.0; // fixed annotation width
const FONT_CHAR_WIDTH: f64 = 6.4; // approximate avg char width @ 12px Arial
const FONT_LINE_HEIGHT: f64 = 14.4; // line-height @ 12px
const PADDING_X: f64 = 18.0; // 9px each side
const PADDING_Y: f64 = 14.0; // top + bottom
const ANN_GAP: f64 = 20.0; // min gap between two annotations
const ELEMENT_GAP: f64 = 30.0; // min gap between annotation and a non-annotation shape
const PREFERRED_OFFSET: f64 = 50.0; // preferred gap to associated element
const MIN_HEIGHT: f64 = 30.0;
const HORIZONTAL_SHIFTS: [f64; 9] = [
    0.0, 60.0, -60.0, 120.0, -120.0, 180.0, -180.0, 240.0, -240.0,
];
const VERTICAL_SHIFTS: [f64; 11] = [
    0.0, 40.0, -40.0, 80.0, -80.0, 120.0, -120.0, 160.0, -160.0, 200.0, -200.0,
];
/// Cost added to a candidate whose association line would cross a shape.
const BLOCKED_LINE_COST: f64 = 10_000.0;
/// Cost added per routed connection the association line would cut across.
const CROSSED_ROUTE_COST: f64 = 200.0;

/// JS `WhiteSpace` + `LineTerminator`: what `\s` matches and what `trim()` strips.
/// Differs from `char::is_whitespace` (which has U+0085 but not U+FEFF).
fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{000B}' | '\u{000C}' | '\r' | ' ' | '\u{00A0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200A}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202F}'
                | '\u{205F}'
                | '\u{3000}'
                | '\u{FEFF}'
    )
}

/// `text.split(/\r?\n/)`: a lone `\r` does not split.
fn split_lines(text: &str) -> Vec<&str> {
    let mut out = Vec::new();
    let mut start = 0;
    let bytes = text.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if b == b'\n' {
            let end = if i > start && bytes[i - 1] == b'\r' {
                i - 1
            } else {
                i
            };
            out.push(&text[start..end]);
            start = i + 1;
        }
    }
    out.push(&text[start..]);
    out
}

/// Twin of `computeHeight`.
fn compute_height(text: &str, width: f64) -> f64 {
    if text.is_empty() || text.trim_matches(is_js_space).is_empty() {
        return MIN_HEIGHT;
    }
    let inner = js::max(40.0, width - PADDING_X);
    let cpl = js::max(1.0, (inner / FONT_CHAR_WIDTH).floor()) as i64;
    let mut total_lines: i64 = 0;
    for para in split_lines(text) {
        let words: Vec<&str> = para.split(is_js_space).filter(|w| !w.is_empty()).collect();
        if words.is_empty() {
            total_lines += 1;
            continue;
        }
        let mut line_len: i64 = 0;
        let mut lines: i64 = 1;
        for w in words {
            let mut len = js::len(w) as i64;
            // Hard-break very long words
            while len > cpl {
                if line_len > 0 {
                    lines += 1;
                    line_len = 0;
                }
                lines += 1;
                len -= cpl;
            }
            if line_len == 0 {
                line_len = len;
            } else if line_len + 1 + len <= cpl {
                line_len += 1 + len;
            } else {
                lines += 1;
                line_len = len;
            }
        }
        total_lines += lines;
    }
    js::max(
        MIN_HEIGHT,
        (total_lines as f64 * FONT_LINE_HEIGHT + PADDING_Y).ceil(),
    )
}

fn center(b: &Bounds) -> (f64, f64) {
    (b.x + b.width / 2.0, b.y + b.height / 2.0)
}

fn clamp_x(x: f64, b: &Bounds) -> f64 {
    js::max(b.x, js::min(x, b.x + b.width))
}

fn clamp_y(y: f64, b: &Bounds) -> f64 {
    js::max(b.y, js::min(y, b.y + b.height))
}

/// Modal (most-common, 20px-bucketed) center-Y of large (task-sized) nodes.
fn compute_main_flow_y(layout_nodes: &[LayoutNode]) -> f64 {
    let cys: Vec<f64> = layout_nodes
        .iter()
        .filter(|n| n.bounds.height >= 60.0)
        .map(|n| n.bounds.y + n.bounds.height / 2.0)
        .collect();
    if cys.is_empty() {
        return 370.0;
    }
    // Keys are multiples of 20 (integral), so i64 keys behave like JS number keys.
    let mut buckets: IndexMap<i64, usize> = IndexMap::new();
    for cy in cys {
        let k = (js::round(cy / 20.0) * 20.0) as i64;
        *buckets.entry(k).or_insert(0) += 1;
    }
    let mut sorted_keys: Vec<i64> = buckets.keys().copied().collect();
    sorted_keys.sort();
    let mut best_key = sorted_keys[0];
    let mut best_count: i64 = -1;
    for k in sorted_keys {
        let count = buckets[&k] as i64;
        if count > best_count {
            best_count = count;
            best_key = k;
        }
    }
    best_key as f64
}

/// Elements at or above the main flow keep their annotation "above"; elements
/// clearly below get "below". A side the author asked for wins.
fn natural_side(elem: &Bounds, main_flow_y: f64, hint: Option<AnnotationSide>) -> AnnotationSide {
    if let Some(h) = hint {
        return h;
    }
    let cy = elem.y + elem.height / 2.0;
    if cy > main_flow_y + 60.0 {
        AnnotationSide::Below
    } else {
        AnnotationSide::Above
    }
}

struct PackItem {
    id: String,
    bounds: Bounds,
    side: AnnotationSide,
    /// Index into `layout_nodes` of the linked element.
    linked: usize,
}

fn overlaps_padded(a: &Bounds, others: &[Bounds], padding: f64) -> bool {
    others.iter().any(|b| {
        a.x - padding < b.x + b.width
            && a.x + a.width + padding > b.x
            && a.y - padding < b.y + b.height
            && a.y + a.height + padding > b.y
    })
}

/// V8's `Math.hypot` for two arguments (scaled, Kahan-summed); plain `f64::hypot`
/// can differ in the last bit, which would flip cost ties.
fn hypot(a: f64, b: f64) -> f64 {
    let v = [a, b];
    if v.iter().any(|x| x.is_infinite()) {
        return f64::INFINITY;
    }
    if v.iter().any(|x| x.is_nan()) {
        return f64::NAN;
    }
    let max = js::max(a.abs(), b.abs());
    if max == 0.0 {
        return 0.0;
    }
    let mut sum = 0.0;
    let mut compensation = 0.0;
    for x in v {
        let n = x.abs() / max;
        let summand = n * n - compensation;
        let preliminary = sum + summand;
        compensation = (preliminary - sum) - summand;
        sum = preliminary;
    }
    f64::sqrt(sum) * max
}

/// `Math.sign`: keeps ±0 and NaN.
fn sign(x: f64) -> f64 {
    if x > 0.0 {
        1.0
    } else if x < 0.0 {
        -1.0
    } else {
        x
    }
}

/// An obstacle box; `owner` is the layout-node index when it is that node's own
/// `bounds` (TS compares `sh !== linked.bounds` by identity).
struct Obstacle {
    bounds: Bounds,
    owner: Option<usize>,
}

struct Ctx<'a> {
    layout_nodes: &'a [LayoutNode],
    obstacles: Vec<Obstacle>,
    route_obstacles: Vec<Bounds>,
}

impl Ctx<'_> {
    /// A clear box is not enough: the association line drawn back to the
    /// element must not cut through anything either.
    fn candidate_cost(
        &self,
        item: &PackItem,
        x: f64,
        y: f64,
        natural_x: f64,
        natural_y: f64,
    ) -> f64 {
        let linked = &self.layout_nodes[item.linked];
        let candidate = Bounds {
            x,
            y,
            width: item.bounds.width,
            height: item.bounds.height,
        };
        let (p_elem, p_ann) = association_waypoints(&linked.bounds, &candidate);
        let crosses = self.obstacles.iter().any(|sh| {
            sh.owner != Some(item.linked) && segment_hits_box(&p_elem, &p_ann, &sh.bounds)
        });
        let cuts = self
            .route_obstacles
            .iter()
            .filter(|r| segment_hits_box(&p_elem, &p_ann, r))
            .count();
        hypot(x - natural_x, y - natural_y)
            + (if crosses { BLOCKED_LINE_COST } else { 0.0 })
            + cuts as f64 * CROSSED_ROUTE_COST
    }
}

/// `packAnnotations(process, layoutNodes, layoutEdges, sides)`: bounds per annotation id.
///
/// Sizes and packs text annotations around their linked elements without
/// overlapping each other or any other layout node (incl. node labels).
/// Annotations with no resolvable association target still get an entry, placed
/// at a fixed fallback origin and pushed clear of everything already placed.
pub fn pack_annotations(
    process: &BpmnProcess,
    layout_nodes: &[LayoutNode],
    layout_edges: &[LayoutEdge],
    sides: Option<&IndexMap<String, AnnotationSide>>,
) -> IndexMap<String, Bounds> {
    let mut result: IndexMap<String, Bounds> = IndexMap::new();
    let annotations = &process.contents.text_annotations;
    if annotations.is_empty() {
        return result;
    }

    let annotation_ids: IndexSet<&str> = annotations.iter().map(|a| a.id.as_str()).collect();
    let mut element_for_annotation: IndexMap<&str, &str> = IndexMap::new();
    let mut annotation_pairs: Vec<(&str, &str)> = Vec::new();
    for assoc in &process.contents.associations {
        if annotation_ids.contains(assoc.target_ref.as_str())
            && annotation_ids.contains(assoc.source_ref.as_str())
        {
            annotation_pairs.push((assoc.source_ref.as_str(), assoc.target_ref.as_str()));
        } else if annotation_ids.contains(assoc.target_ref.as_str()) {
            element_for_annotation.insert(assoc.target_ref.as_str(), assoc.source_ref.as_str());
        } else if annotation_ids.contains(assoc.source_ref.as_str()) {
            element_for_annotation.insert(assoc.source_ref.as_str(), assoc.target_ref.as_str());
        }
    }
    // An annotation linked only to another annotation packs beside that one's
    // element, so the association between the two stays short.
    let mut changed = true;
    while changed {
        changed = false;
        for &(a, b) in &annotation_pairs {
            let for_a = element_for_annotation.get(a).copied();
            let for_b = element_for_annotation.get(b).copied();
            match (for_a, for_b) {
                (None, Some(e)) => {
                    element_for_annotation.insert(a, e);
                    changed = true;
                }
                (Some(e), None) => {
                    element_for_annotation.insert(b, e);
                    changed = true;
                }
                _ => {}
            }
        }
    }

    // `new Map(entries)`: the last duplicate id wins.
    let mut node_by_id: IndexMap<&str, usize> = IndexMap::new();
    for (i, n) in layout_nodes.iter().enumerate() {
        node_by_id.insert(n.id.as_str(), i);
    }
    let main_flow_y = compute_main_flow_y(layout_nodes);

    let mut items: Vec<PackItem> = Vec::new();
    let mut unlinked: Vec<(String, f64, f64)> = Vec::new();
    for ann in annotations {
        let linked_id = element_for_annotation.get(ann.id.as_str()).copied();
        let linked = match linked_id {
            Some(id) if !id.is_empty() => node_by_id.get(id).copied(),
            _ => None,
        };
        let width = ANN_WIDTH;
        let height = compute_height(ann.text.as_deref().unwrap_or(""), width);
        let Some(linked) = linked else {
            unlinked.push((ann.id.clone(), width, height));
            continue;
        };
        let lb = &layout_nodes[linked].bounds;
        let side = natural_side(lb, main_flow_y, sides.and_then(|s| s.get(&ann.id).copied()));
        let (lcx, _) = center(lb);
        items.push(PackItem {
            id: ann.id.clone(),
            bounds: Bounds {
                x: js::round(lcx - width / 2.0),
                y: 0.0,
                width,
                height,
            },
            side,
            linked,
        });
    }

    let mut obstacles: Vec<Obstacle> = Vec::new();
    for (i, n) in layout_nodes.iter().enumerate() {
        // Identity is by the node the id map resolves to, as in TS.
        let owner = if node_by_id.get(n.id.as_str()) == Some(&i) {
            Some(i)
        } else {
            None
        };
        obstacles.push(Obstacle {
            bounds: n.bounds,
            owner,
        });
        if let Some(lb) = n.label_bounds {
            obstacles.push(Obstacle {
                bounds: lb,
                owner: None,
            });
        }
    }
    // Each segment of a route as a hairline box; the box packer then keeps
    // annotations off routes the same way it keeps them off shapes.
    let mut route_obstacles: Vec<Bounds> = Vec::new();
    for edge in layout_edges {
        let wps = &edge.waypoints;
        for i in 0..wps.len().saturating_sub(1) {
            let a = wps[i];
            let b = wps[i + 1];
            route_obstacles.push(Bounds {
                x: js::min(a.x, b.x),
                y: js::min(a.y, b.y),
                width: (a.x - b.x).abs(),
                height: (a.y - b.y).abs(),
            });
        }
    }

    let ctx = Ctx {
        layout_nodes,
        obstacles,
        route_obstacles,
    };

    // Indices of items already placed sideways (the left pass fills this before the right pass).
    let mut placed_sideways: Vec<usize> = Vec::new();

    pack_side(&ctx, &mut items, true);
    pack_side(&ctx, &mut items, false);
    pack_horizontal(&ctx, &mut items, &mut placed_sideways, true);
    pack_horizontal(&ctx, &mut items, &mut placed_sideways, false);

    for item in &items {
        result.insert(item.id.clone(), item.bounds);
    }

    // Fallback placement for annotations with no resolvable linked element:
    // start at a fixed origin and push straight down until clear of every
    // node/label obstacle and every already-placed annotation (linked or
    // unlinked), so they never overlap anything.
    let obstacle_bounds: Vec<Bounds> = ctx.obstacles.iter().map(|o| o.bounds).collect();
    let mut ann_obstacles: Vec<Bounds> = items.iter().map(|it| it.bounds).collect();
    for (id, width, height) in unlinked {
        let mut bounds = Bounds {
            x: 0.0,
            y: 0.0,
            width,
            height,
        };
        while overlaps_padded(&bounds, &obstacle_bounds, ELEMENT_GAP)
            || overlaps_padded(&bounds, &ann_obstacles, ANN_GAP)
        {
            bounds.y += height + ANN_GAP;
        }
        ann_obstacles.push(bounds);
        result.insert(id, bounds);
    }

    result
}

/// Left/right: mirror of `pack_side`; the box may shift off the element's centre to stay clear.
fn pack_horizontal(
    ctx: &Ctx,
    items: &mut [PackItem],
    placed_sideways: &mut Vec<usize>,
    left: bool,
) {
    let side = if left {
        AnnotationSide::Left
    } else {
        AnnotationSide::Right
    };
    let mut list: Vec<usize> = (0..items.len())
        .filter(|&i| items[i].side == side)
        .collect();
    list.sort_by(|&a, &b| {
        js::cmp_num(
            center(&ctx.layout_nodes[items[a].linked].bounds).1,
            center(&ctx.layout_nodes[items[b].linked].bounds).1,
        )
    });

    // Above/below annotations are already final, and the left pass fills
    // `placed_sideways` before the right pass runs.
    let mut placed: Vec<usize> = (0..items.len())
        .filter(|&i| matches!(items[i].side, AnnotationSide::Above | AnnotationSide::Below))
        .collect();
    placed.extend(placed_sideways.iter().copied());

    for idx in list {
        let linked = &ctx.layout_nodes[items[idx].linked];
        let (width, height) = (items[idx].bounds.width, items[idx].bounds.height);
        let natural_x = if left {
            linked.bounds.x - PREFERRED_OFFSET - width
        } else {
            linked.bounds.x + linked.bounds.width + PREFERRED_OFFSET
        };
        let natural_y = js::round(center(&linked.bounds).1 - height / 2.0);

        let (mut best_x, mut best_y, mut best_cost) = (natural_x, natural_y, f64::INFINITY);
        for dy in VERTICAL_SHIFTS {
            let candidate_y = natural_y + dy;
            let ay2 = candidate_y + height;

            let mut intervals: Vec<(f64, f64)> = Vec::new();
            let mut collect = |b: &Bounds, gap: f64| {
                if ay2 + gap <= b.y || b.y + b.height + gap <= candidate_y {
                    return;
                }
                intervals.push((b.x - gap, b.x + b.width + gap));
            };
            for &o in &placed {
                collect(&items[o].bounds, ANN_GAP);
            }
            for sh in &ctx.obstacles {
                collect(&sh.bounds, ELEMENT_GAP);
            }
            for r in &ctx.route_obstacles {
                collect(r, ANN_GAP);
            }

            let mut x = natural_x;
            let mut changed = true;
            while changed {
                changed = false;
                for &(il, ir) in &intervals {
                    if x + width > il && x < ir {
                        x = if left { il - width } else { ir };
                        changed = true;
                    }
                }
            }

            let cost = ctx.candidate_cost(&items[idx], x, candidate_y, natural_x, natural_y);
            if cost < best_cost {
                best_x = x;
                best_y = candidate_y;
                best_cost = cost;
            }
        }

        items[idx].bounds.x = js::round(best_x);
        items[idx].bounds.y = js::round(best_y);
        placed.push(idx);
        placed_sideways.push(idx);
    }
}

fn pack_side(ctx: &Ctx, items: &mut [PackItem], above: bool) {
    let side = if above {
        AnnotationSide::Above
    } else {
        AnnotationSide::Below
    };
    let mut list: Vec<usize> = (0..items.len())
        .filter(|&i| items[i].side == side)
        .collect();
    list.sort_by(|&a, &b| {
        js::cmp_num(
            center(&ctx.layout_nodes[items[a].linked].bounds).0,
            center(&ctx.layout_nodes[items[b].linked].bounds).0,
        )
    });

    let mut placed: Vec<usize> = Vec::new();
    for idx in list {
        let linked = &ctx.layout_nodes[items[idx].linked];
        let (lcx, _) = center(&linked.bounds);
        let (width, height) = (items[idx].bounds.width, items[idx].bounds.height);
        let natural_x = js::round(lcx - width / 2.0);
        let natural_y = if above {
            linked.bounds.y - PREFERRED_OFFSET - height
        } else {
            linked.bounds.y + linked.bounds.height + PREFERRED_OFFSET
        };

        let (mut best_x, mut best_y, mut best_cost) = (natural_x, natural_y, f64::INFINITY);
        for dx in HORIZONTAL_SHIFTS {
            let candidate_x = natural_x + dx;
            let ax1 = candidate_x;
            let ax2 = candidate_x + width;

            let mut intervals: Vec<(f64, f64)> = Vec::new();
            for &o in &placed {
                let ob = &items[o].bounds;
                let ox1 = ob.x;
                let ox2 = ox1 + ob.width;
                if ax2 + ANN_GAP <= ox1 || ox2 + ANN_GAP <= ax1 {
                    continue;
                }
                intervals.push((ob.y - ANN_GAP, ob.y + ob.height + ANN_GAP));
            }
            for sh in &ctx.obstacles {
                let sh = &sh.bounds;
                let sx1 = sh.x;
                let sx2 = sx1 + sh.width;
                if ax2 + ELEMENT_GAP <= sx1 || sx2 + ELEMENT_GAP <= ax1 {
                    continue;
                }
                intervals.push((sh.y - ELEMENT_GAP, sh.y + sh.height + ELEMENT_GAP));
            }
            for r in &ctx.route_obstacles {
                if ax2 + ANN_GAP <= r.x || r.x + r.width + ANN_GAP <= ax1 {
                    continue;
                }
                intervals.push((r.y - ANN_GAP, r.y + r.height + ANN_GAP));
            }

            let mut y = natural_y;
            let mut changed = true;
            while changed {
                changed = false;
                for &(top, bottom) in &intervals {
                    if y + height > top && y < bottom {
                        y = if above { top - height } else { bottom };
                        changed = true;
                    }
                }
            }

            let cost = ctx.candidate_cost(&items[idx], candidate_x, y, natural_x, natural_y);
            if cost < best_cost {
                best_x = candidate_x;
                best_y = y;
                best_cost = cost;
            }
        }

        items[idx].bounds.x = js::round(best_x);
        items[idx].bounds.y = js::round(best_y);
        placed.push(idx);
    }
}

/// Whether a straight segment passes through a box.
fn segment_hits_box(a: &Waypoint, b: &Waypoint, bx: &Bounds) -> bool {
    let min_x = js::min(a.x, b.x);
    let max_x = js::max(a.x, b.x);
    let min_y = js::min(a.y, b.y);
    let max_y = js::max(a.y, b.y);
    if max_x <= bx.x || bx.x + bx.width <= min_x {
        return false;
    }
    if max_y <= bx.y || bx.y + bx.height <= min_y {
        return false;
    }
    if a.x == b.x || a.y == b.y {
        return true;
    }

    // Diagonal: the box is hit unless all four corners fall on one side of it.
    let side =
        |p: (f64, f64)| -> f64 { sign((b.x - a.x) * (p.1 - a.y) - (b.y - a.y) * (p.0 - a.x)) };
    let corners = [
        (bx.x, bx.y),
        (bx.x + bx.width, bx.y),
        (bx.x + bx.width, bx.y + bx.height),
        (bx.x, bx.y + bx.height),
    ];
    let first = side(corners[0]);
    corners.iter().any(|&c| side(c) != first)
}

/// `associationWaypoints(elementBounds, annotationBounds)`: `(pElem, pAnn)`.
///
/// Edge-to-edge, clamped association waypoints between a linked element and its annotation.
pub fn association_waypoints(element: &Bounds, annotation: &Bounds) -> (Waypoint, Waypoint) {
    let (ecx, ecy) = center(element);
    let (acx, acy) = center(annotation);
    if annotation.y + annotation.height <= element.y {
        return (
            Waypoint {
                x: clamp_x(acx, element),
                y: element.y,
            },
            Waypoint {
                x: clamp_x(ecx, annotation),
                y: annotation.y + annotation.height,
            },
        );
    }
    if annotation.y >= element.y + element.height {
        return (
            Waypoint {
                x: clamp_x(acx, element),
                y: element.y + element.height,
            },
            Waypoint {
                x: clamp_x(ecx, annotation),
                y: annotation.y,
            },
        );
    }
    if annotation.x >= element.x + element.width {
        return (
            Waypoint {
                x: element.x + element.width,
                y: clamp_y(acy, element),
            },
            Waypoint {
                x: annotation.x,
                y: clamp_y(ecy, annotation),
            },
        );
    }
    (
        Waypoint {
            x: element.x,
            y: clamp_y(acy, element),
        },
        Waypoint {
            x: annotation.x + annotation.width,
            y: clamp_y(ecy, annotation),
        },
    )
}
