//! Twin of `layout/collaboration/docked-labels.ts`.
//!
//! Labels that sit where a message flow docks.
//!
//! The process layout puts an event's or gateway's name below it by default, before any
//! message flow exists. A message that then docks on that same side runs straight through
//! the name. Mirroring the label to the far side of its element keeps both readable, as
//! long as nothing already sits there.

use bpmnkit_bpmn::model::{BpmnBounds, BpmnDiEdge, BpmnDiShape};
use indexmap::{IndexMap, IndexSet};
use std::collections::HashSet;

use crate::js;

/// `MessageDock`: one end of a message flow: the element it docks on and where.
#[derive(Debug, Clone, PartialEq)]
pub struct MessageDock {
    pub element: String,
    pub y: f64,
}

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
enum Side {
    Top,
    Bottom,
}

fn overlaps(a: &BpmnBounds, b: &BpmnBounds) -> bool {
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

fn edge_hits(edge: &BpmnDiEdge, r: &BpmnBounds) -> bool {
    edge.waypoints.windows(2).any(|w| {
        let (p, q) = (&w[0], &w[1]);
        js::max(p.x, q.x) > r.x
            && js::min(p.x, q.x) < r.x + r.width
            && js::max(p.y, q.y) > r.y
            && js::min(p.y, q.y) < r.y + r.height
    })
}

/// `flipDockedLabels(shapes, edges, docks, containers)`: move each docked element's label
/// to the side no message docks on. An element docked on both sides, or whose far side is
/// taken by a shape, a label or an edge, keeps its label where it is.
pub fn flip_docked_labels(
    shapes: &mut [BpmnDiShape],
    edges: &[BpmnDiEdge],
    docks: &[MessageDock],
    containers: &HashSet<String>,
) {
    // Later shapes win a duplicate id, as `new Map(entries)` does.
    let mut by_element: IndexMap<String, usize> = IndexMap::new();
    for (i, s) in shapes.iter().enumerate() {
        by_element.insert(s.bpmn_element.clone(), i);
    }
    let mut sides: IndexMap<String, IndexSet<Side>> = IndexMap::new();
    for dock in docks {
        let Some(&i) = by_element.get(dock.element.as_str()) else {
            continue;
        };
        let b = &shapes[i].bounds;
        let side = if (dock.y - b.y).abs() <= 1.0 {
            Side::Top
        } else if (dock.y - (b.y + b.height)).abs() <= 1.0 {
            Side::Bottom
        } else {
            continue;
        };
        sides.entry(dock.element.clone()).or_default().insert(side);
    }

    for (element, set) in &sides {
        if set.len() != 1 {
            continue;
        }
        let Some(&si) = by_element.get(element.as_str()) else {
            continue;
        };
        let Some(label) = shapes[si].label.as_ref().and_then(|l| l.bounds.as_ref()) else {
            continue;
        };
        let b = &shapes[si].bounds;
        let below = label.y >= b.y + b.height - 1.0;
        let above = label.y + label.height <= b.y + 1.0;
        let docked = if set.contains(&Side::Bottom) {
            Side::Bottom
        } else {
            Side::Top
        };
        if !((docked == Side::Bottom && below) || (docked == Side::Top && above)) {
            continue;
        }

        let y = if below {
            b.y - (label.y - (b.y + b.height)) - label.height
        } else {
            b.y + b.height + (b.y - (label.y + label.height))
        };
        let spot = BpmnBounds {
            x: label.x,
            y,
            width: label.width,
            height: label.height,
        };
        let taken = shapes.iter().enumerate().any(|(i, s)| {
            i != si
                && !containers.contains(&s.bpmn_element)
                && (overlaps(&s.bounds, &spot)
                    || s.label
                        .as_ref()
                        .and_then(|l| l.bounds.as_ref())
                        .is_some_and(|lb| overlaps(lb, &spot)))
        }) || edges.iter().any(|e| edge_hits(e, &spot));
        if !taken {
            if let Some(l) = shapes[si].label.as_mut().and_then(|l| l.bounds.as_mut()) {
                l.y = y;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bpmnkit_bpmn::model::BpmnDiLabel;

    fn bounds(x: f64, y: f64, width: f64, height: f64) -> BpmnBounds {
        BpmnBounds {
            x,
            y,
            width,
            height,
        }
    }

    fn shape(element: &str, b: BpmnBounds, label: Option<BpmnBounds>) -> BpmnDiShape {
        BpmnDiShape {
            id: format!("{element}_di"),
            bpmn_element: element.into(),
            is_marker_visible: None,
            is_expanded: None,
            is_horizontal: None,
            bounds: b,
            label: label.map(|bounds| BpmnDiLabel {
                bounds: Some(bounds),
                unknown_attributes: None,
            }),
            unknown_attributes: Default::default(),
        }
    }

    fn dock(element: &str, y: f64) -> MessageDock {
        MessageDock {
            element: element.into(),
            y,
        }
    }

    fn event(label_y: f64) -> BpmnDiShape {
        shape(
            "e",
            bounds(100.0, 100.0, 36.0, 36.0),
            Some(bounds(88.0, label_y, 60.0, 14.0)),
        )
    }

    fn label_y(shapes: &[BpmnDiShape]) -> f64 {
        shapes[0].label.as_ref().unwrap().bounds.as_ref().unwrap().y
    }

    #[test]
    fn moves_a_label_off_the_side_a_message_docks_on() {
        let mut shapes = vec![event(140.0)];
        flip_docked_labels(&mut shapes, &[], &[dock("e", 136.0)], &HashSet::new());
        assert_eq!(label_y(&shapes), 82.0);
    }

    #[test]
    fn keeps_it_when_the_far_side_is_taken() {
        let blocker = shape("t", bounds(80.0, 60.0, 100.0, 30.0), None);
        let mut shapes = vec![event(140.0), blocker];
        flip_docked_labels(&mut shapes, &[], &[dock("e", 136.0)], &HashSet::new());
        assert_eq!(label_y(&shapes), 140.0);
    }

    #[test]
    fn keeps_it_when_messages_dock_on_both_sides() {
        let mut shapes = vec![event(140.0)];
        flip_docked_labels(
            &mut shapes,
            &[],
            &[dock("e", 136.0), dock("e", 100.0)],
            &HashSet::new(),
        );
        assert_eq!(label_y(&shapes), 140.0);
    }
}
