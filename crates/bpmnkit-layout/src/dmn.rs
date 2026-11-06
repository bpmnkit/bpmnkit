//! Twin of `dmn/dmn-layout.ts` (`layoutDmn` and its helpers; the benchmark is not ported).

use crate::hash::{IndexMap, IndexSet};
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

struct DrgNode<'a> {
    id: &'a str,
    kind: NodeKind,
}

struct PositionedNode {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

struct RequirementEdge<'a> {
    /// The required (upstream) element
    source_id: &'a str,
    /// The element that declares the requirement
    target_id: &'a str,
    /// The requirement element ID (used as dmnElementRef for the edge)
    req_id: &'a str,
}

// ── Graph collection ──────────────────────────────────────────────────────────

fn collect_nodes(defs: &DmnDefinitions) -> Vec<DrgNode<'_>> {
    let mut nodes = Vec::with_capacity(
        defs.decisions.len()
            + defs.input_data.len()
            + defs.knowledge_sources.len()
            + defs.business_knowledge_models.len(),
    );
    for d in &defs.decisions {
        nodes.push(DrgNode {
            id: &d.id,
            kind: NodeKind::Decision,
        });
    }
    for d in &defs.input_data {
        nodes.push(DrgNode {
            id: &d.id,
            kind: NodeKind::InputData,
        });
    }
    for ks in &defs.knowledge_sources {
        nodes.push(DrgNode {
            id: &ks.id,
            kind: NodeKind::KnowledgeSource,
        });
    }
    for bkm in &defs.business_knowledge_models {
        nodes.push(DrgNode {
            id: &bkm.id,
            kind: NodeKind::BusinessKnowledgeModel,
        });
    }
    nodes
}

/// `a ?? b ?? c ?? ""`: `??` only skips absent values, so an empty string stops the chain.
fn first_present(candidates: [&Option<String>; 3]) -> &str {
    candidates
        .into_iter()
        .find_map(|c| c.as_deref())
        .unwrap_or_default()
}

fn collect_edges(defs: &DmnDefinitions) -> Vec<RequirementEdge<'_>> {
    let mut edges = Vec::new();
    let mut push = |source_id, target_id, req_id| {
        edges.push(RequirementEdge {
            source_id,
            target_id,
            req_id,
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
            push(&req.required_knowledge, &d.id, &req.id);
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
            push(&req.required_knowledge, &bkm.id, &req.id);
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

/// Layer per distinct node id, indexed like `ids`. Every edge target is a node,
/// so the TS maps keyed by id only ever hold node ids; layers are only looked
/// up, never iterated, so their order does not matter.
fn assign_layers(ids: &IndexSet<&str>, nodes: &[DrgNode], edges: &[RequirementEdge]) -> Vec<i64> {
    let n_ids = ids.len();
    let mut outgoing: Vec<Vec<usize>> = vec![Vec::new(); n_ids];
    let mut in_degree: Vec<i64> = vec![0; n_ids];

    for e in edges {
        let Some(target) = ids.get_index_of(e.target_id) else {
            continue;
        };
        if let Some(source) = ids.get_index_of(e.source_id) {
            outgoing[source].push(target);
        }
        in_degree[target] += 1;
    }

    let mut layers: Vec<Option<i64>> = vec![None; n_ids];
    let mut queue: Vec<usize> = Vec::new();

    for n in nodes {
        let Some(k) = ids.get_index_of(n.id) else {
            continue;
        };
        if in_degree[k] == 0 {
            layers[k] = Some(0);
            queue.push(k);
        }
    }

    let mut i = 0;
    while i < queue.len() {
        let id = queue[i];
        i += 1;
        let layer = layers[id].unwrap_or(0);
        for &succ in &outgoing[id] {
            layers[succ] = Some(layers[succ].unwrap_or(0).max(layer + 1));
            in_degree[succ] -= 1;
            if in_degree[succ] == 0 {
                queue.push(succ);
            }
        }
    }

    // Disconnected nodes default to layer 0
    layers.into_iter().map(|l| l.unwrap_or(0)).collect()
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
    let ids: IndexSet<&str> = nodes.iter().map(|n| n.id).collect();
    let layer_map = assign_layers(&ids, &nodes, &edges);

    // Group nodes by layer
    let mut by_layer: IndexMap<i64, Vec<&DrgNode>> = IndexMap::default();
    for n in &nodes {
        let layer = ids.get_index_of(n.id).map_or(0, |k| layer_map[k]);
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
    let mut positioned: IndexMap<&str, PositionedNode> =
        IndexMap::with_capacity_and_hasher(nodes.len(), Default::default());
    for &layer_idx in &sorted_layers {
        let layer_nodes = &by_layer[&layer_idx];
        let layer_x = x_by_layer.get(&layer_idx).copied().unwrap_or(MARGIN_X);
        let layer_height = height_by_layer.get(&layer_idx).copied().unwrap_or(0.0);
        let start_y = MARGIN_Y + (max_height - layer_height) / 2.0;
        let mut y = start_y;

        for n in layer_nodes {
            let (width, height) = n.kind.size();
            positioned.insert(
                n.id,
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
            dmn_element_ref: id.to_string(),
            bounds: DmnBounds {
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
            },
        })
        .collect();

    // Build edges: connect right edge of source to left edge of target
    let mut diagram_edges: Vec<DmnDiagramEdge> = Vec::with_capacity(edges.len());
    for edge in &edges {
        let (Some(src), Some(tgt)) = (
            positioned.get(edge.source_id),
            positioned.get(edge.target_id),
        ) else {
            continue;
        };

        let src_x = src.x + src.width;
        let src_y = src.y + src.height / 2.0;
        let tgt_x = tgt.x;
        let tgt_y = tgt.y + tgt.height / 2.0;

        diagram_edges.push(DmnDiagramEdge {
            dmn_element_ref: edge.req_id.to_string(),
            waypoints: vec![
                DmnWaypoint { x: src_x, y: src_y },
                DmnWaypoint { x: tgt_x, y: tgt_y },
            ],
        });
    }

    // Field by field so the source diagram, replaced wholesale, is never cloned.
    DmnDefinitions {
        id: defs.id.clone(),
        name: defs.name.clone(),
        namespace: defs.namespace.clone(),
        exporter: defs.exporter.clone(),
        exporter_version: defs.exporter_version.clone(),
        namespaces: defs.namespaces.clone(),
        modeler_attributes: defs.modeler_attributes.clone(),
        decisions: defs.decisions.clone(),
        input_data: defs.input_data.clone(),
        knowledge_sources: defs.knowledge_sources.clone(),
        business_knowledge_models: defs.business_knowledge_models.clone(),
        text_annotations: defs.text_annotations.clone(),
        associations: defs.associations.clone(),
        diagram: Some(DmnDiagram {
            shapes,
            edges: diagram_edges,
        }),
        extension_elements: defs.extension_elements.clone(),
    }
}
