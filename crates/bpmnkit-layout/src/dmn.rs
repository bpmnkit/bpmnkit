//! Twin of `dmn/dmn-layout.ts` (`layoutDmn` and its helpers; the benchmark is not ported).

use crate::hash::IndexMap;
use bpmnkit_dmn::model::{
    DmnBounds, DmnDefinitions, DmnDiagram, DmnDiagramEdge, DmnDiagramShape, DmnWaypoint,
};

// ── Element sizes (matches Camunda Modeler defaults) ──────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum NodeKind {
    Decision,
    InputData,
    KnowledgeSource,
    BusinessKnowledgeModel,
}

impl NodeKind {
    /// `SIZES[kind]`: `(width, height)`.
    fn size(self) -> (f64, f64) {
        match self {
            NodeKind::Decision => (180.0, 80.0),
            NodeKind::InputData => (125.0, 45.0),
            NodeKind::KnowledgeSource => (100.0, 63.0),
            NodeKind::BusinessKnowledgeModel => (160.0, 80.0),
        }
    }
}

const H_GAP: f64 = 60.0; // horizontal gap between layers
const V_GAP: f64 = 40.0; // vertical gap within a layer
const MARGIN_X: f64 = 160.0;
const MARGIN_Y: f64 = 100.0;

struct DrgNode {
    id: String,
    kind: NodeKind,
}

struct PositionedNode {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

struct RequirementEdge {
    /// The required (upstream) element
    source_id: String,
    /// The element that declares the requirement
    target_id: String,
    /// The requirement element ID (used as dmnElementRef for the edge)
    req_id: String,
}

// ── Graph collection ──────────────────────────────────────────────────────────

fn collect_nodes(defs: &DmnDefinitions) -> Vec<DrgNode> {
    let mut nodes = Vec::new();
    for d in &defs.decisions {
        nodes.push(DrgNode {
            id: d.id.clone(),
            kind: NodeKind::Decision,
        });
    }
    for d in &defs.input_data {
        nodes.push(DrgNode {
            id: d.id.clone(),
            kind: NodeKind::InputData,
        });
    }
    for ks in &defs.knowledge_sources {
        nodes.push(DrgNode {
            id: ks.id.clone(),
            kind: NodeKind::KnowledgeSource,
        });
    }
    for bkm in &defs.business_knowledge_models {
        nodes.push(DrgNode {
            id: bkm.id.clone(),
            kind: NodeKind::BusinessKnowledgeModel,
        });
    }
    nodes
}

/// `a ?? b ?? c ?? ""`: `??` only skips absent values, so an empty string stops the chain.
fn first_present(candidates: [&Option<String>; 3]) -> String {
    candidates
        .into_iter()
        .find_map(|c| c.clone())
        .unwrap_or_default()
}

fn collect_edges(defs: &DmnDefinitions) -> Vec<RequirementEdge> {
    let mut edges = Vec::new();
    let mut push = |source: String, target: &str, req: &str| {
        edges.push(RequirementEdge {
            source_id: source,
            target_id: target.to_string(),
            req_id: req.to_string(),
        });
    };

    for d in &defs.decisions {
        for req in &d.information_requirements {
            let src = first_present([&req.required_decision, &req.required_input, &None]);
            if !src.is_empty() {
                push(src, &d.id, &req.id);
            }
        }
        for req in &d.knowledge_requirements {
            push(req.required_knowledge.clone(), &d.id, &req.id);
        }
        for req in &d.authority_requirements {
            let src = first_present([
                &req.required_authority,
                &req.required_decision,
                &req.required_input,
            ]);
            if !src.is_empty() {
                push(src, &d.id, &req.id);
            }
        }
    }

    for bkm in &defs.business_knowledge_models {
        for req in &bkm.knowledge_requirements {
            push(req.required_knowledge.clone(), &bkm.id, &req.id);
        }
        for req in &bkm.authority_requirements {
            let src = first_present([
                &req.required_authority,
                &req.required_decision,
                &req.required_input,
            ]);
            if !src.is_empty() {
                push(src, &bkm.id, &req.id);
            }
        }
    }

    for ks in &defs.knowledge_sources {
        for req in &ks.authority_requirements {
            let src = first_present([
                &req.required_authority,
                &req.required_decision,
                &req.required_input,
            ]);
            if !src.is_empty() {
                push(src, &ks.id, &req.id);
            }
        }
    }

    edges
}

// ── Layer assignment (longest-path / BFS) ────────────────────────────────────

fn assign_layers(nodes: &[DrgNode], edges: &[RequirementEdge]) -> IndexMap<String, i64> {
    let mut outgoing: IndexMap<String, Vec<String>> = IndexMap::default();
    let mut in_degree: IndexMap<String, i64> = IndexMap::default();

    for n in nodes {
        outgoing.insert(n.id.clone(), Vec::new());
        in_degree.insert(n.id.clone(), 0);
    }

    for e in edges {
        if let Some(list) = outgoing.get_mut(&e.source_id) {
            list.push(e.target_id.clone());
        }
        let d = in_degree.get(&e.target_id).copied().unwrap_or(0) + 1;
        in_degree.insert(e.target_id.clone(), d);
    }

    let mut layers: IndexMap<String, i64> = IndexMap::default();
    let mut queue: Vec<String> = Vec::new();

    for n in nodes {
        if in_degree.get(&n.id).copied().unwrap_or(0) == 0 {
            layers.insert(n.id.clone(), 0);
            queue.push(n.id.clone());
        }
    }

    let mut i = 0;
    while i < queue.len() {
        let id = queue[i].clone();
        i += 1;
        let layer = layers.get(&id).copied().unwrap_or(0);
        let succs = outgoing.get(&id).cloned().unwrap_or_default();
        for succ in succs {
            let new_layer = layers.get(&succ).copied().unwrap_or(0).max(layer + 1);
            layers.insert(succ.clone(), new_layer);
            let deg = in_degree.get(&succ).copied().unwrap_or(1) - 1;
            in_degree.insert(succ.clone(), deg);
            if deg == 0 {
                queue.push(succ);
            }
        }
    }

    // Disconnected nodes default to layer 0
    for n in nodes {
        if !layers.contains_key(&n.id) {
            layers.insert(n.id.clone(), 0);
        }
    }

    layers
}

// ── Layout ────────────────────────────────────────────────────────────────────

/// `layoutDmn(defs)`.
///
/// Assigns DMNDI diagram positions to all DRG elements using a left-to-right layered
/// layout based on the requirement DAG. Returns a new model; the input is untouched.
pub fn layout_dmn(defs: &DmnDefinitions) -> DmnDefinitions {
    let nodes = collect_nodes(defs);
    if nodes.is_empty() {
        return defs.clone();
    }

    let edges = collect_edges(defs);
    let layer_map = assign_layers(&nodes, &edges);

    // Group nodes by layer
    let mut by_layer: IndexMap<i64, Vec<&DrgNode>> = IndexMap::default();
    for n in &nodes {
        let layer = layer_map.get(&n.id).copied().unwrap_or(0);
        by_layer.entry(layer).or_default().push(n);
    }

    let mut sorted_layers: Vec<i64> = by_layer.keys().copied().collect();
    sorted_layers.sort();

    // Compute x per layer (left = upstream/leaf, right = final decision)
    let mut x = MARGIN_X;
    let mut x_by_layer: IndexMap<i64, f64> = IndexMap::default();
    for &layer_idx in &sorted_layers {
        let layer_nodes = &by_layer[&layer_idx];
        let max_width = layer_nodes
            .iter()
            .map(|n| n.kind.size().0)
            .fold(f64::NEG_INFINITY, f64::max);
        x_by_layer.insert(layer_idx, x);
        x += max_width + H_GAP;
    }

    // Compute total height per layer (for vertical centering)
    let mut height_by_layer: IndexMap<i64, f64> = IndexMap::default();
    for &layer_idx in &sorted_layers {
        let layer_nodes = &by_layer[&layer_idx];
        let mut h = 0.0;
        for n in layer_nodes {
            h += n.kind.size().1;
        }
        h += (layer_nodes.len().saturating_sub(1)) as f64 * V_GAP;
        height_by_layer.insert(layer_idx, h);
    }

    let max_height = height_by_layer.values().copied().fold(0.0, f64::max);

    // Position nodes
    let mut positioned: IndexMap<String, PositionedNode> = IndexMap::default();
    for &layer_idx in &sorted_layers {
        let layer_nodes = &by_layer[&layer_idx];
        let layer_x = x_by_layer.get(&layer_idx).copied().unwrap_or(MARGIN_X);
        let layer_height = height_by_layer.get(&layer_idx).copied().unwrap_or(0.0);
        let start_y = MARGIN_Y + (max_height - layer_height) / 2.0;
        let mut y = start_y;

        for n in layer_nodes {
            let (width, height) = n.kind.size();
            positioned.insert(
                n.id.clone(),
                PositionedNode {
                    x: layer_x,
                    y,
                    width,
                    height,
                },
            );
            y += height + V_GAP;
        }
    }

    // Build shapes
    let shapes: Vec<DmnDiagramShape> = positioned
        .iter()
        .map(|(id, node)| DmnDiagramShape {
            dmn_element_ref: id.clone(),
            bounds: DmnBounds {
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
            },
        })
        .collect();

    // Build edges: connect right edge of source to left edge of target
    let mut diagram_edges: Vec<DmnDiagramEdge> = Vec::new();
    for edge in &edges {
        let (Some(src), Some(tgt)) = (
            positioned.get(&edge.source_id),
            positioned.get(&edge.target_id),
        ) else {
            continue;
        };

        let src_x = src.x + src.width;
        let src_y = src.y + src.height / 2.0;
        let tgt_x = tgt.x;
        let tgt_y = tgt.y + tgt.height / 2.0;

        diagram_edges.push(DmnDiagramEdge {
            dmn_element_ref: edge.req_id.clone(),
            waypoints: vec![
                DmnWaypoint { x: src_x, y: src_y },
                DmnWaypoint { x: tgt_x, y: tgt_y },
            ],
        });
    }

    let mut out = defs.clone();
    out.diagram = Some(DmnDiagram {
        shapes,
        edges: diagram_edges,
    });
    out
}
