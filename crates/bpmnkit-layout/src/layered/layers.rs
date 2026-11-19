//! Twin of `layout/layered/layers.ts`: layering and ordering.

use crate::hash::{IndexMap, IndexSet};
use crate::js::cmp_num;
use crate::semantic::graph::SemanticGraph;
use bpmnkit_bpmn::model::{BpmnFlowElement, BpmnSequenceFlow};

/// One edge between neighbouring columns: a whole flow, or one piece of a long one.
#[derive(Debug, Clone)]
pub struct Segment {
    pub from: String,
    pub to: String,
    pub flow: String,
    /// Pull toward the side a boundary event docks on (+0.5 below, -0.5 above),
    /// so its handler orders past the host's own successor. Non-zero segments are
    /// never aligned straight: the flow leaves the event, not the host's centre.
    pub bias: f64,
}

/// A flow drawn as one vertical drop inside a column: `mover` sits right under
/// (`side` 1) or over (-1) `anchor`, in the same column.
#[derive(Debug, Clone)]
pub struct Stack {
    pub flow: String,
    pub mover: String,
    pub anchor: String,
    pub side: i64,
}

/// A component cut into columns, long flows carried by dummy nodes.
#[derive(Debug, Clone)]
pub struct Layering {
    /// Columns left to right, each top to bottom: node ids and dummy ids.
    pub layers: Vec<Vec<String>>,
    pub rank: IndexMap<String, i64>,
    /// Dummy id → the flow it carries.
    pub dummies: IndexMap<String, String>,
    pub succ: IndexMap<String, Vec<Segment>>,
    pub pred: IndexMap<String, Vec<Segment>>,
    /// Forward flow id → its chain of ids, source (the host for a boundary event) to target.
    pub chains: IndexMap<String, Vec<String>>,
}

/// Dummy ids cannot clash with element ids: XML ids never hold a NUL.
const DUMMY: &str = "\u{0}";
/// Ordering sweeps: alternating down/up passes; stop early once crossing-free.
const SWEEPS: usize = 24;
const TRANSPOSE_PASSES: usize = 8;

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

fn is_boundary(graph: &SemanticGraph, id: &str) -> bool {
    matches!(
        graph.by_id.get(id).copied(),
        Some(BpmnFlowElement::BoundaryEvent(_))
    )
}

/// Forward flows out of `id` within the component (back edges and self-loops excluded).
fn forward<'a>(
    graph: &SemanticGraph<'a>,
    in_set: &IndexSet<&str>,
    id: &str,
) -> Vec<&'a BpmnSequenceFlow> {
    graph
        .outgoing
        .get(id)
        .map(|v| v.as_slice())
        .unwrap_or(&[])
        .iter()
        .copied()
        .filter(|f| {
            !graph.back_edges.contains(f.id.as_str())
                && in_set.contains(f.target_ref.as_str())
                && f.target_ref != id
        })
        .collect()
}

/// Flows that stay inside one column (the P2 rules, as layering constraints):
/// - a one-node detour of a split that feeds the split's other target stacks
///   under that target and flows up into it;
/// - the first boundary event of a host whose handler has no other way in drops
///   its handler straight under (or over) the host.
pub fn stacked_flows(
    graph: &SemanticGraph,
    members: &[&str],
    side_of: &dyn Fn(&str) -> i64,
) -> IndexMap<String, Stack> {
    let in_set: IndexSet<&str> = members.iter().copied().collect();
    let mut stacks: IndexMap<String, Stack> = IndexMap::default();
    let mut moved: IndexSet<String> = IndexSet::default();
    let mut anchored: IndexSet<String> = IndexSet::default();
    let mut take = |stack: Stack| {
        let key = format!("{}\u{1}{}", stack.anchor, stack.side);
        if moved.contains(&stack.mover) || moved.contains(&stack.anchor) || anchored.contains(&key)
        {
            return;
        }
        if anchored.contains(&format!("{}\u{1}1", stack.mover))
            || anchored.contains(&format!("{}\u{1}-1", stack.mover))
        {
            return;
        }
        moved.insert(stack.mover.clone());
        anchored.insert(key);
        stacks.insert(stack.flow.clone(), stack);
    };
    for &id in members {
        for f in forward(graph, &in_set, id) {
            if is_boundary(graph, &f.source_ref) {
                let into = graph.incoming.get(f.target_ref.as_str());
                let target = graph.by_id.get(f.target_ref.as_str()).copied();
                let host = id;
                let first = graph.attachers.get(host).and_then(|v| v.first());
                if into.map_or(0, |v| v.len()) == 1
                    && first.is_some_and(|e| e.base.id == f.source_ref)
                    && target.is_some_and(|t| !is_gateway(t.type_name()))
                {
                    take(Stack {
                        flow: f.id.clone(),
                        mover: f.target_ref.clone(),
                        anchor: host.to_string(),
                        side: side_of(&f.source_ref),
                    });
                }
                continue;
            }
            let into = graph.incoming.get(id).map(|v| v.as_slice()).unwrap_or(&[]);
            let out = graph.outgoing.get(id).map(|v| v.as_slice()).unwrap_or(&[]);
            if into.len() != 1 || out.len() != 1 {
                continue;
            }
            let split = into[0];
            if graph.back_edges.contains(split.id.as_str()) {
                continue;
            }
            if is_boundary(graph, &split.source_ref) {
                continue;
            }
            let sibling = graph
                .outgoing
                .get(split.source_ref.as_str())
                .map(|v| v.as_slice())
                .unwrap_or(&[])
                .iter()
                .any(|g| {
                    g.target_ref == f.target_ref
                        && !std::ptr::eq(*g, split)
                        && !graph.back_edges.contains(g.id.as_str())
                });
            if sibling {
                take(Stack {
                    flow: f.id.clone(),
                    mover: id.to_string(),
                    anchor: f.target_ref.clone(),
                    side: 1,
                });
            }
        }
    }
    stacks
}

/// Kahn order over forward flows; ties keep declaration order.
fn topo_order<'a>(
    graph: &SemanticGraph<'a>,
    members: &[&'a str],
    in_set: &IndexSet<&str>,
) -> Vec<&'a str> {
    let mut indeg: IndexMap<&str, i64> = IndexMap::default();
    for &id in members {
        indeg.insert(id, 0);
    }
    for &id in members {
        for f in forward(graph, in_set, id) {
            let d = indeg.get(f.target_ref.as_str()).copied().unwrap_or(0) + 1;
            indeg.insert(f.target_ref.as_str(), d);
        }
    }
    let mut queue: Vec<&'a str> = members
        .iter()
        .copied()
        .filter(|id| indeg.get(id).copied() == Some(0))
        .collect();
    let mut order: Vec<&'a str> = Vec::new();
    let mut i = 0;
    while i < queue.len() {
        let id = queue[i];
        order.push(id);
        for f in forward(graph, in_set, id) {
            let left = indeg.get(f.target_ref.as_str()).copied().unwrap_or(0) - 1;
            indeg.insert(f.target_ref.as_str(), left);
            if left == 0 {
                queue.push(f.target_ref.as_str());
            }
        }
        i += 1;
    }
    order
}

/// Longest-path columns, then a local network-simplex move: a node with more
/// flows out than in slides right up to its nearest successor (a second start
/// event, a split feeding a far join), one with more in than out slides left.
/// Total flow length only shrinks, which keeps long dummy chains rare.
pub fn assign_layers<'a>(
    graph: &SemanticGraph<'a>,
    members: &[&'a str],
    stacks: &IndexMap<String, Stack>,
) -> IndexMap<String, i64> {
    let in_set: IndexSet<&str> = members.iter().copied().collect();
    let order = topo_order(graph, members, &in_set);
    let step = |f: &BpmnSequenceFlow| -> i64 {
        if stacks.contains_key(f.id.as_str()) {
            0
        } else {
            1
        }
    };
    let mut preds: IndexMap<&str, Vec<&BpmnSequenceFlow>> = IndexMap::default();
    for &id in members {
        preds.insert(id, Vec::new());
    }
    for &id in members {
        for f in forward(graph, &in_set, id) {
            if let Some(list) = preds.get_mut(f.target_ref.as_str()) {
                list.push(f);
            }
        }
    }
    let source_of = |f: &BpmnSequenceFlow| -> String {
        match graph.by_id.get(f.source_ref.as_str()).copied() {
            Some(BpmnFlowElement::BoundaryEvent(be)) => be.attached_to_ref.clone(),
            _ => f.source_ref.clone(),
        }
    };
    let mut rank: IndexMap<String, i64> = IndexMap::default();
    for &id in members {
        rank.insert(id.to_string(), 0);
    }
    for &id in &order {
        let r = rank.get(id).copied().unwrap_or(0);
        for f in forward(graph, &in_set, id) {
            if rank.get(f.target_ref.as_str()).copied().unwrap_or(0) < r + step(f) {
                rank.insert(f.target_ref.clone(), r + step(f));
            }
        }
    }
    for _pass in 0..8 {
        let mut changed = false;
        for &id in &order {
            let ins = preds.get(id).map(|v| v.as_slice()).unwrap_or(&[]);
            let outs = forward(graph, &in_set, id);
            let r = rank.get(id).copied().unwrap_or(0);
            if outs.len() > ins.len() {
                let mut hi = i64::MAX;
                for f in &outs {
                    hi = hi.min(rank.get(f.target_ref.as_str()).copied().unwrap_or(0) - step(f));
                }
                if hi > r {
                    rank.insert(id.to_string(), hi);
                    changed = true;
                }
            } else if ins.len() > outs.len() && !ins.is_empty() {
                let mut lo = 0;
                for f in ins {
                    lo = lo.max(rank.get(source_of(f).as_str()).copied().unwrap_or(0) + step(f));
                }
                if lo < r {
                    rank.insert(id.to_string(), lo);
                    changed = true;
                }
            }
        }
        if !changed {
            break;
        }
    }
    let mut min = i64::MAX;
    for &id in members {
        min = min.min(rank.get(id).copied().unwrap_or(0));
    }
    if min != i64::MAX && min != 0 {
        for &id in members {
            let r = rank.get(id).copied().unwrap_or(0) - min;
            rank.insert(id.to_string(), r);
        }
    }
    rank
}

struct Build<'g, 'a> {
    graph: &'g SemanticGraph<'a>,
    in_set: IndexSet<&'a str>,
    lg: Layering,
    seen: IndexSet<&'a str>,
}

impl<'a> Build<'_, 'a> {
    fn put(&mut self, id: &str) {
        let r = self.lg.rank.get(id).copied().unwrap_or(0);
        if let Some(layer) = usize::try_from(r)
            .ok()
            .and_then(|r| self.lg.layers.get_mut(r))
        {
            layer.push(id.to_string());
        }
        self.lg.succ.insert(id.to_string(), Vec::new());
        self.lg.pred.insert(id.to_string(), Vec::new());
    }

    fn visit(&mut self, id: &'a str) {
        self.seen.insert(id);
        self.put(id);
        for f in forward(self.graph, &self.in_set, id) {
            let r0 = self.lg.rank.get(id).copied().unwrap_or(0);
            let r1 = self
                .lg
                .rank
                .get(f.target_ref.as_str())
                .copied()
                .unwrap_or(0);
            let mut chain = vec![id.to_string()];
            for r in r0 + 1..r1 {
                let d = format!("{DUMMY}{}{DUMMY}{r}", f.id);
                self.lg.rank.insert(d.clone(), r);
                self.lg.dummies.insert(d.clone(), f.id.clone());
                self.put(&d);
                chain.push(d);
            }
            chain.push(f.target_ref.clone());
            self.lg.chains.insert(f.id.clone(), chain);
            if !self.seen.contains(f.target_ref.as_str()) {
                self.visit(f.target_ref.as_str());
            }
        }
    }
}

/// Build the columns with dummy nodes, seeded in depth-first discovery order
/// from the component's start so the first branch starts on top.
pub fn build_layering<'a>(
    graph: &SemanticGraph<'a>,
    members: &[&'a str],
    start: &'a str,
    rank: &IndexMap<String, i64>,
    bias_of: &dyn Fn(&BpmnSequenceFlow) -> f64,
) -> Layering {
    let in_set: IndexSet<&'a str> = members.iter().copied().collect();
    let mut max_rank = 0;
    for &id in members {
        max_rank = max_rank.max(rank.get(id).copied().unwrap_or(0));
    }
    let layers: Vec<Vec<String>> = (0..=max_rank).map(|_| Vec::new()).collect();
    let mut b = Build {
        graph,
        in_set,
        lg: Layering {
            layers,
            rank: rank.clone(),
            dummies: IndexMap::default(),
            succ: IndexMap::default(),
            pred: IndexMap::default(),
            chains: IndexMap::default(),
        },
        seen: IndexSet::default(),
    };
    let mut roots: Vec<&'a str> = vec![start];
    roots.extend(
        members
            .iter()
            .copied()
            .filter(|id| graph.incoming.get(id).is_none_or(|v| v.is_empty())),
    );
    roots.extend(members.iter().copied());
    for id in roots {
        if b.in_set.contains(id) && !b.seen.contains(id) {
            b.visit(id);
        }
    }
    let mut lg = b.lg;
    // Link after discovery so every endpoint has its lists.
    for &id in members {
        for f in forward(graph, &b.in_set, id) {
            let chain = lg.chains.get(f.id.as_str()).cloned().unwrap_or_default();
            if chain.len() == 2 && lg.rank.get(&chain[0]) == lg.rank.get(&chain[1]) {
                continue;
            }
            for i in 0..chain.len().saturating_sub(1) {
                let seg = Segment {
                    from: chain[i].clone(),
                    to: chain[i + 1].clone(),
                    flow: f.id.clone(),
                    bias: if i == 0 { bias_of(f) } else { 0.0 },
                };
                if let Some(l) = lg.succ.get_mut(&chain[i]) {
                    l.push(seg.clone());
                }
                if let Some(l) = lg.pred.get_mut(&chain[i + 1]) {
                    l.push(seg);
                }
            }
        }
    }
    lg
}

fn positions(layers: &[Vec<String>]) -> IndexMap<String, usize> {
    let mut pos = IndexMap::default();
    for layer in layers {
        for (i, id) in layer.iter().enumerate() {
            pos.insert(id.clone(), i);
        }
    }
    pos
}

fn pos_of(pos: &IndexMap<String, usize>, id: &str) -> usize {
    pos.get(id).copied().unwrap_or(0)
}

/// Crossings between column `r` and `r + 1`, straight-line model.
fn crossings_at(lg: &Layering, pos: &IndexMap<String, usize>, r: usize) -> usize {
    let mut pairs: Vec<(usize, usize)> = Vec::new();
    for id in lg.layers.get(r).map(|v| v.as_slice()).unwrap_or(&[]) {
        for s in lg.succ.get(id).map(|v| v.as_slice()).unwrap_or(&[]) {
            pairs.push((pos_of(pos, &s.from), pos_of(pos, &s.to)));
        }
    }
    let mut n = 0;
    for i in 0..pairs.len() {
        let (a1, b1) = pairs[i];
        for &(a2, b2) in &pairs[i + 1..] {
            if (a1 < a2 && b1 > b2) || (a1 > a2 && b1 < b2) {
                n += 1;
            }
        }
    }
    n
}

pub fn total_crossings(lg: &Layering) -> usize {
    let pos = positions(&lg.layers);
    let mut n = 0;
    for r in 0..lg.layers.len().saturating_sub(1) {
        n += crossings_at(lg, &pos, r);
    }
    n
}

/// Gansner's weighted median of neighbour positions; -1 when there are none.
fn median_value(values: &[f64]) -> f64 {
    let mut p = values.to_vec();
    p.sort_by(|a, b| cmp_num(*a, *b));
    let n = p.len();
    if n == 0 {
        return -1.0;
    }
    let m = n / 2;
    if n % 2 == 1 {
        return p[m];
    }
    if n == 2 {
        return (p[0] + p[1]) / 2.0;
    }
    let left = p[m - 1] - p[0];
    let right = p[n - 1] - p[m];
    if left + right == 0.0 {
        return (p[m - 1] + p[m]) / 2.0;
    }
    (p[m - 1] * right + p[m] * left) / (left + right)
}

/// Sort one column by the median of its neighbours in the fixed column; isolated nodes keep their slot.
fn reorder(lg: &mut Layering, r: usize, down: bool, pos: &mut IndexMap<String, usize>) {
    let layer = lg.layers.get(r).cloned().unwrap_or_default();
    let mut value: IndexMap<&str, f64> = IndexMap::default();
    for id in &layer {
        let segs = if down {
            lg.pred.get(id)
        } else {
            lg.succ.get(id)
        }
        .map(|v| v.as_slice())
        .unwrap_or(&[]);
        let vals: Vec<f64> = segs
            .iter()
            .map(|s| {
                if down {
                    pos_of(pos, &s.from) as f64 + s.bias
                } else {
                    pos_of(pos, &s.to) as f64 - s.bias
                }
            })
            .collect();
        value.insert(id, median_value(&vals));
    }
    let v = |id: &str| value.get(id).copied().unwrap_or(-1.0);
    let mut movable: Vec<&String> = layer.iter().filter(|id| v(id) >= 0.0).collect();
    movable.sort_by(|a, b| {
        cmp_num(
            value.get(a.as_str()).copied().unwrap_or(0.0),
            value.get(b.as_str()).copied().unwrap_or(0.0),
        )
    });
    let mut k = 0;
    let next: Vec<String> = layer
        .iter()
        .map(|id| {
            if v(id) >= 0.0 {
                let m = movable[k].clone();
                k += 1;
                m
            } else {
                id.clone()
            }
        })
        .collect();
    for (i, id) in next.iter().enumerate() {
        pos.insert(id.clone(), i);
    }
    if r < lg.layers.len() {
        lg.layers[r] = next;
    }
}

/// Crossings among the flows of `u` and `v` (in that order) toward both neighbouring columns.
fn pair_crossings(lg: &Layering, pos: &IndexMap<String, usize>, u: &str, v: &str) -> usize {
    let mut n = 0;
    let count = |a: &[usize], b: &[usize], n: &mut usize| {
        for pu in a {
            for pv in b {
                if pu > pv {
                    *n += 1;
                }
            }
        }
    };
    let from = |id: &str| -> Vec<usize> {
        lg.pred
            .get(id)
            .map(|v| v.as_slice())
            .unwrap_or(&[])
            .iter()
            .map(|s| pos_of(pos, &s.from))
            .collect()
    };
    let to = |id: &str| -> Vec<usize> {
        lg.succ
            .get(id)
            .map(|v| v.as_slice())
            .unwrap_or(&[])
            .iter()
            .map(|s| pos_of(pos, &s.to))
            .collect()
    };
    count(&from(u), &from(v), &mut n);
    count(&to(u), &to(v), &mut n);
    n
}

/// Swap neighbours while that removes crossings.
fn transpose(lg: &mut Layering, pos: &mut IndexMap<String, usize>) {
    for _pass in 0..TRANSPOSE_PASSES {
        let mut improved = false;
        for r in 0..lg.layers.len() {
            let mut i = 0;
            while i + 1 < lg.layers[r].len() {
                let u = lg.layers[r][i].clone();
                let v = lg.layers[r][i + 1].clone();
                if pair_crossings(lg, pos, &v, &u) < pair_crossings(lg, pos, &u, &v) {
                    pos.insert(v.clone(), i);
                    pos.insert(u.clone(), i + 1);
                    lg.layers[r][i] = v;
                    lg.layers[r][i + 1] = u;
                    improved = true;
                }
                i += 1;
            }
        }
        if !improved {
            break;
        }
    }
}

/// Put every stacked mover right under (or over) its anchor again.
fn glue(lg: &mut Layering, stacks: &IndexMap<String, Stack>, pos: &mut IndexMap<String, usize>) {
    for stack in stacks.values() {
        let Some(&ra) = lg.rank.get(stack.anchor.as_str()) else {
            continue;
        };
        if lg.rank.get(stack.mover.as_str()) != Some(&ra) {
            continue;
        }
        let Some(layer) = usize::try_from(ra).ok().and_then(|r| lg.layers.get_mut(r)) else {
            continue;
        };
        if let Some(i) = layer.iter().position(|x| *x == stack.mover) {
            layer.remove(i);
        }
        let at = layer
            .iter()
            .position(|x| *x == stack.anchor)
            .unwrap_or(layer.len());
        layer.insert(
            if stack.side > 0 { at + 1 } else { at },
            stack.mover.clone(),
        );
        for (i, id) in layer.iter().enumerate() {
            pos.insert(id.clone(), i);
        }
    }
}

/// Median sweeps with transpose; keeps the order with the fewest crossings seen.
pub fn order_layers(lg: &mut Layering, stacks: &IndexMap<String, Stack>) {
    let mut pos = positions(&lg.layers);
    glue(lg, stacks, &mut pos);
    let mut best = lg.layers.clone();
    let mut best_count = total_crossings(lg);
    let mut iter = 0;
    while iter < SWEEPS && best_count > 0 {
        if iter % 2 == 0 {
            for r in 1..lg.layers.len() {
                reorder(lg, r, true, &mut pos);
            }
        } else {
            for r in (0..lg.layers.len().saturating_sub(1)).rev() {
                reorder(lg, r, false, &mut pos);
            }
        }
        transpose(lg, &mut pos);
        glue(lg, stacks, &mut pos);
        let count = total_crossings(lg);
        if count < best_count {
            best_count = count;
            best = lg.layers.clone();
        }
        iter += 1;
    }
    lg.layers = best;
}
