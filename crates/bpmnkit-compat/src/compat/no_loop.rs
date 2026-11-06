//! `no-loop`: a cycle of elements that never wait, which Zeebe would run without end.
//! A literal port of the plugin's rule (and of the TS port), down to the visiting
//! order and JS `Map`'s live iteration, so the same loops are found.

use super::{attr, bpmn_type, flow_elements, is_container, zeebe, Ctx, El};
use indexmap::IndexMap;

fn is_required(t: &str) -> bool {
    matches!(t, "bpmn:CallActivity" | "bpmn:ManualTask" | "bpmn:Task")
}

fn is_loop_element(t: &str) -> bool {
    is_required(t)
        || matches!(
            t,
            "bpmn:StartEvent"
                | "bpmn:EndEvent"
                | "bpmn:ExclusiveGateway"
                | "bpmn:InclusiveGateway"
                | "bpmn:ParallelGateway"
                | "bpmn:SubProcess"
        )
}

struct LoopNode {
    element: String,
    /// Neighbour → the elements the shortest known path to it passes.
    incoming: IndexMap<String, Vec<String>>,
    outgoing: IndexMap<String, Vec<String>>,
    path: Option<Vec<String>>,
}

/// Nodes live in an arena; `graph` maps ids to them, as the TS `Map` does to objects.
struct Graph {
    nodes: Vec<LoopNode>,
    graph: IndexMap<String, usize>,
}

impl Graph {
    fn node(&mut self, id: &str) -> usize {
        if let Some(&n) = self.graph.get(id) {
            return n;
        }
        self.nodes.push(LoopNode {
            element: id.to_string(),
            incoming: IndexMap::new(),
            outgoing: IndexMap::new(),
            path: None,
        });
        let n = self.nodes.len() - 1;
        self.graph.insert(id.to_string(), n);
        n
    }

    /// `breadthFirst`: visits every node of the graph as it is now, in order.
    fn breadth_first(&mut self, mut visit: impl FnMut(&mut Graph, usize) -> Vec<Option<usize>>) {
        let order: Vec<usize> = self.graph.values().copied().collect();
        let mut unvisited = vec![false; self.nodes.len()];
        for &n in &order {
            unvisited[n] = true;
        }
        for &first in &order {
            if !unvisited[first] {
                continue;
            }
            unvisited[first] = false;
            let mut queue = std::collections::VecDeque::from([first]);
            while let Some(n) = queue.pop_front() {
                for next in visit(self, n).into_iter().flatten() {
                    if !unvisited[next] {
                        continue;
                    }
                    unvisited[next] = false;
                    queue.push_back(next);
                }
            }
        }
    }
}

pub(super) fn check_no_loop(ctx: &mut Ctx) {
    let type_of = |ctx: &Ctx, id: &str| ctx.elements.get(id).map(|l| bpmn_type(l.el));
    let required = |ctx: &Ctx, id: &str| type_of(ctx, id).is_some_and(|t| is_required(&t));
    let next = |ctx: &Ctx, id: &str| -> Vec<String> {
        let Some(located) = ctx.elements.get(id) else {
            return vec![];
        };
        let mut el: &El = located.el;
        let starts = |elements: &[El]| -> Vec<String> {
            elements
                .iter()
                .filter(|e| matches!(e, El::StartEvent(_)))
                .map(|e| e.base().id.clone())
                .collect()
        };
        if let El::CallActivity(_) = el {
            let called = zeebe(&el.base().extension_elements, "calledElement")
                .first()
                .copied();
            if let Some(process_id) = attr(called, "processId") {
                if !process_id.starts_with('=') && process_id == ctx.process.id {
                    return starts(&ctx.process.contents.flow_elements);
                }
            }
        } else if is_container(el) {
            return starts(flow_elements(el));
        } else if let (El::EndEvent(_), Some(parent)) = (el, located.parent) {
            el = parent;
        }
        el.base()
            .outgoing
            .iter()
            .filter_map(|flow_id| {
                let target = &ctx.flows.get(flow_id.as_str())?.el.target_ref;
                ctx.elements
                    .contains_key(target.as_str())
                    .then(|| target.clone())
            })
            .collect()
    };

    let mut g = Graph {
        nodes: vec![],
        graph: IndexMap::new(),
    };
    let ids: Vec<&str> = ctx.elements.keys().copied().collect();
    for id in ids {
        if !type_of(ctx, id).is_some_and(|t| is_loop_element(&t)) {
            continue;
        }
        let current = g.node(id);
        for target in next(ctx, id) {
            let t = g.node(&target);
            g.nodes[t].incoming.insert(id.to_string(), vec![]);
            g.nodes[current].outgoing.insert(target, vec![]);
        }
    }

    // Drop every element that is not required, joining its neighbours directly.
    g.breadth_first(|g, n| {
        let element = g.nodes[n].element.clone();
        if !required(ctx, &element) {
            let mut i = 0;
            while i < g.nodes[n].incoming.len() {
                let (from_key, from_path) = g.nodes[n]
                    .incoming
                    .get_index(i)
                    .map(|(k, v)| (k.clone(), v.clone()))
                    .expect("index");
                let mut j = 0;
                while j < g.nodes[n].outgoing.len() {
                    let (to_key, to_path) = g.nodes[n]
                        .outgoing
                        .get_index(j)
                        .map(|(k, v)| (k.clone(), v.clone()))
                        .expect("index");
                    j += 1;
                    let (Some(&from), Some(&to)) = (g.graph.get(&from_key), g.graph.get(&to_key))
                    else {
                        continue;
                    };
                    let mut path = from_path.clone();
                    path.push(element.clone());
                    path.extend(to_path);
                    if !g.nodes[from].outgoing.contains_key(&to_key) {
                        g.nodes[from].outgoing.insert(to_key.clone(), path.clone());
                    }
                    if !g.nodes[to].incoming.contains_key(&from_key) {
                        g.nodes[to].incoming.insert(from_key.clone(), path);
                    }
                }
                i += 1;
            }
            g.graph.shift_remove(&element);
        }
        g.nodes[n]
            .outgoing
            .keys()
            .map(|k| g.graph.get(k).copied())
            .collect()
    });
    let live: Vec<usize> = g.graph.values().copied().collect();
    for n in live {
        let graph = &g.graph;
        let node = &mut g.nodes[n];
        node.incoming.retain(|k, _| graph.contains_key(k));
        node.outgoing.retain(|k, _| graph.contains_key(k));
    }

    let mut loops: Vec<String> = vec![];
    g.breadth_first(|g, n| {
        let mut found = vec![];
        let edges: Vec<(String, Vec<String>)> = g.nodes[n]
            .outgoing
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect();
        for (target, via) in edges {
            let mut path = g.nodes[n].path.clone().unwrap_or_default();
            path.push(g.nodes[n].element.clone());
            path.extend(via);
            if let Some(start) = path.iter().position(|p| *p == target) {
                let cycle = &path[start..];
                if !cycle.iter().any(|id| required(ctx, id)) {
                    continue;
                }
                loops.push(format!("Loop detected: {} -> {target}", cycle.join(" -> ")));
            } else if let Some(&t) = g.graph.get(&target) {
                if g.nodes[t].path.is_none() {
                    g.nodes[t].path = Some(path);
                }
                found.push(Some(t));
            }
        }
        found
    });
    let process_id = ctx.process.id.clone();
    for message in loops {
        ctx.report(
            "no-loop",
            &process_id,
            message,
            "Put a wait state in the loop — a service, user or receive task, or a catch event — or remove it.",
        );
    }
}
