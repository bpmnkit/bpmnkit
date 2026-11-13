//! Twin of `layout/collaboration/message-labels.ts`.
//!
//! Labels around message flows, placed after the flows are routed. A message flow's name
//! belongs on the flow where nothing else is: the empty band between two pools. And a
//! flow docking under an event runs through the name the event carries below itself, so
//! that name moves above the event (or beside it).

use crate::js;
use crate::types::{LABEL_CHAR_WIDTH, LABEL_HEIGHT, LABEL_MIN_WIDTH};
use bpmnkit_bpmn::model::{BpmnBounds, BpmnDiEdge, BpmnDiLabel, BpmnDiShape, BpmnWaypoint};
use std::collections::{HashMap, HashSet};

/// Space between a flow and the label beside it.
const LABEL_GAP: f64 = 4.0;
/// How far a label slides along its segment per try.
const SLIDE_STEP: f64 = 10.0;

fn overlaps(a: &BpmnBounds, b: &BpmnBounds) -> bool {
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

fn crosses(p: &BpmnWaypoint, q: &BpmnWaypoint, b: &BpmnBounds) -> bool {
    js::max(p.x, q.x) > b.x
        && js::min(p.x, q.x) < b.x + b.width
        && js::max(p.y, q.y) > b.y
        && js::min(p.y, q.y) < b.y + b.height
}

fn edge_through(edge: &BpmnDiEdge, b: &BpmnBounds) -> bool {
    edge.waypoints.windows(2).any(|w| crosses(&w[0], &w[1], b))
}

/// `MessageLabelInput`.
pub struct MessageLabelInput<'a> {
    /// Named message flows by id.
    pub names: &'a HashMap<String, String>,
    /// Pools, lanes and expanded sub-processes: drawn around content, not obstacles.
    pub containers: &'a HashSet<String>,
    /// Pools, for the bands between them.
    pub pools: &'a HashSet<String>,
}

fn bounds_of(label: &Option<BpmnDiLabel>) -> Option<&BpmnBounds> {
    label.as_ref().and_then(|l| l.bounds.as_ref())
}

/// A label rectangle with the identity of its owner, so a label never collides with itself.
fn labels(shapes: &[BpmnDiShape], edges: &[BpmnDiEdge]) -> Vec<BpmnBounds> {
    shapes
        .iter()
        .filter_map(|s| bounds_of(&s.label).cloned())
        .chain(edges.iter().filter_map(|e| bounds_of(&e.label).cloned()))
        .collect()
}

fn rect(x: f64, y: f64, width: f64, height: f64) -> BpmnBounds {
    BpmnBounds {
        x: js::round(x),
        y: js::round(y),
        width,
        height,
    }
}

/// `placeMessageFlowLabels(input)`.
pub fn place_message_flow_labels(
    shapes: &mut [BpmnDiShape],
    edges: &mut [BpmnDiEdge],
    input: &MessageLabelInput,
) {
    let MessageLabelInput {
        names,
        containers,
        pools,
    } = input;
    let message_edges: Vec<usize> = edges
        .iter()
        .enumerate()
        .filter(|(_, e)| names.contains_key(&e.bpmn_element))
        .map(|(i, _)| i)
        .collect();
    if message_edges.is_empty() {
        return;
    }
    let solids: Vec<BpmnBounds> = shapes
        .iter()
        .filter(|s| !containers.contains(&s.bpmn_element))
        .map(|s| s.bounds.clone())
        .collect();

    for si in 0..shapes.len() {
        let Some(label) = bounds_of(&shapes[si].label).cloned() else {
            continue;
        };
        if !message_edges
            .iter()
            .any(|&e| edge_through(&edges[e], &label))
        {
            continue;
        }
        let s = &shapes[si].bounds;
        let cx = s.x + s.width / 2.0;
        let spots = [
            (cx - label.width / 2.0, s.y - LABEL_GAP - label.height),
            (s.x + s.width + LABEL_GAP, s.y + s.height),
            (s.x - LABEL_GAP - label.width, s.y + s.height),
            (s.x + s.width + LABEL_GAP, s.y - label.height),
        ];
        // The shape's own label is skipped by position among shape labels.
        let own_index = shapes[..si]
            .iter()
            .filter(|o| bounds_of(&o.label).is_some())
            .count();
        let all = labels(shapes, edges);
        let spot = spots
            .iter()
            .map(|&(x, y)| rect(x, y, label.width, label.height))
            .find(|b| {
                !solids.iter().any(|s| overlaps(s, b))
                    && !all
                        .iter()
                        .enumerate()
                        .any(|(i, l)| i != own_index && overlaps(l, b))
                    && !edges.iter().any(|e| edge_through(e, b))
            });
        if let (Some(spot), Some(l)) = (spot, shapes[si].label.as_mut()) {
            l.bounds = Some(spot);
        }
    }

    let mut pool_bounds: Vec<BpmnBounds> = shapes
        .iter()
        .filter(|s| pools.contains(&s.bpmn_element))
        .map(|s| s.bounds.clone())
        .collect();
    pool_bounds.sort_by(|a, b| a.y.partial_cmp(&b.y).unwrap_or(std::cmp::Ordering::Equal));
    let mut bands: Vec<(f64, f64)> = Vec::new();
    for w in pool_bounds.windows(2) {
        let (above, below) = (&w[0], &w[1]);
        if below.y > above.y + above.height {
            bands.push((above.y + above.height, below.y));
        }
    }

    struct Run {
        x: f64,
        top: f64,
        bottom: f64,
    }

    for &ei in &message_edges {
        let name = names
            .get(&edges[ei].bpmn_element)
            .map_or("", String::as_str);
        let width = js::max(js::len(name) as f64 * LABEL_CHAR_WIDTH, LABEL_MIN_WIDTH);
        let height = LABEL_HEIGHT;
        let beside = |x: f64, y: f64| {
            [
                rect(x + LABEL_GAP, y - height / 2.0, width, height),
                rect(x - LABEL_GAP - width, y - height / 2.0, width, height),
            ]
        };
        let mut candidates: Vec<BpmnBounds> = Vec::new();
        let mut vertical: Vec<Run> = Vec::new();
        for w in edges[ei].waypoints.windows(2) {
            let (p, q) = (&w[0], &w[1]);
            if p.x != q.x {
                continue;
            }
            vertical.push(Run {
                x: p.x,
                top: js::min(p.y, q.y),
                bottom: js::max(p.y, q.y),
            });
        }
        // In a band first: nothing else is drawn there.
        for v in &vertical {
            for &(top, bottom) in &bands {
                if v.top <= top && bottom <= v.bottom {
                    candidates.extend(beside(v.x, (top + bottom) / 2.0));
                }
            }
        }
        // Then along the longest run, from its middle outwards.
        vertical.sort_by(|a, b| {
            (b.bottom - b.top)
                .partial_cmp(&(a.bottom - a.top))
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        for v in &vertical {
            let mid = (v.top + v.bottom) / 2.0;
            let mut d = 0.0;
            while d <= (v.bottom - v.top) / 2.0 {
                candidates.extend(beside(v.x, mid + d));
                candidates.extend(beside(v.x, mid - d));
                d += SLIDE_STEP;
            }
        }
        let all = labels(shapes, edges);
        let spot = candidates.iter().find(|b| {
            !solids.iter().any(|s| overlaps(s, b))
                && !all.iter().any(|l| overlaps(l, b))
                && !edges
                    .iter()
                    .enumerate()
                    .any(|(i, e)| i != ei && edge_through(e, b))
        });
        let chosen = spot.or_else(|| candidates.first()).cloned();
        if let Some(chosen) = chosen {
            edges[ei].label = Some(BpmnDiLabel {
                bounds: Some(chosen),
                unknown_attributes: None,
            });
        }
    }
}
