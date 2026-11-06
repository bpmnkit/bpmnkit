//! Twin of `layout/grid/walker.ts`.

use super::flow_graph::{
    forms_loop, has_other_incoming, is_future_incoming, is_task_like, FlowGraph,
};
use super::grid::Grid;
use indexmap::IndexSet;

const COMPACT_MAX_COLS: usize = 4;

/// `createGridLayout(graph, { compact })`: place every element of the graph into a
/// Grid via the bpmn-io DFS walk. `compact` bypasses the walk and packs row-major
/// (adHoc tool palettes). Grid cells hold indices into `graph.nodes`.
pub fn create_grid_layout(graph: &FlowGraph, compact: bool) -> Grid<usize> {
    let mut grid: Grid<usize> = Grid::new();

    if compact {
        for (i, &el) in graph.elements.iter().enumerate() {
            grid.add(el, Some((i / COMPACT_MAX_COLS, i % COMPACT_MAX_COLS)));
        }
        return grid;
    }

    let mut visited: IndexSet<String> = IndexSet::new();

    while visited.len() < graph.elements.len() {
        let mut starts: Vec<usize> = graph
            .elements
            .iter()
            .copied()
            .filter(|&el| !visited.contains(graph.id(el)) && !has_other_incoming(el, graph))
            .collect();
        if starts.is_empty() {
            // pure cycles or unreachable joins: force-start with the first leftover
            let leftover = graph
                .elements
                .iter()
                .copied()
                .find(|&el| !visited.contains(graph.id(el)));
            starts = leftover.into_iter().collect();
        }
        if starts.is_empty() {
            break;
        }
        let mut stack: Vec<usize> = Vec::new();
        for s in starts {
            grid.add(s, None);
            visited.insert(graph.id(s).to_string());
            stack.push(s);
        }
        walk(&mut grid, graph, &mut visited, &mut stack);
    }

    grid
}

fn walk(
    grid: &mut Grid<usize>,
    graph: &FlowGraph,
    visited: &mut IndexSet<String>,
    stack: &mut Vec<usize>,
) {
    while let Some(current) = stack.pop() {
        incoming_step(current, grid, graph);
        let mut next = outgoing_step(current, grid, graph, visited, stack);
        next.extend(attacher_step(current, grid, graph, visited));
        for el in next {
            stack.push(el);
        }
    }
}

/// Realign a join with its feeders before its successors are placed.
fn incoming_step(el: usize, grid: &mut Grid<usize>, graph: &FlowGraph) {
    let sources: Vec<usize> = graph
        .incoming
        .get(graph.id(el))
        .map(|fs| {
            fs.iter()
                .filter_map(|f| graph.by_id.get(&f.source_ref).copied())
                .collect()
        })
        .unwrap_or_default();
    if sources.len() > 1 {
        grid.adjust_column_for_multiple_incoming(&sources, &el);
        grid.adjust_row_for_multiple_incoming(&sources, &el);
    }
}

/// Place successors: first one to the right (happy path), the rest stacked below.
fn outgoing_step(
    el: usize,
    grid: &mut Grid<usize>,
    graph: &FlowGraph,
    visited: &mut IndexSet<String>,
    stack: &[usize],
) -> Vec<usize> {
    let targets = graph.outgoing_targets(graph.id(el));

    if targets.len() > 1 && targets.iter().all(|&t| is_task_like(graph.kind(t))) {
        grid.adjust_grid_position(&el);
    }

    let mut previous: Option<usize> = None;
    let mut placed: Vec<usize> = Vec::new();

    for (i, &target) in targets.iter().enumerate() {
        if visited.contains(graph.id(target)) {
            continue;
        }

        if (previous.is_some() || !stack.is_empty())
            && is_future_incoming(target, visited, graph)
            && !forms_loop(target, visited, graph)
        {
            continue; // defer join until its last feeder is processed
        }

        match previous {
            None => grid.add_after(&el, target),
            Some(prev) => {
                if graph.kind(el) == "exclusiveGateway" && graph.kind(target) == "exclusiveGateway"
                {
                    grid.add_after(&prev, target);
                } else {
                    let anchor = if i >= 1 { Some(targets[i - 1]) } else { None };
                    let a = match anchor {
                        Some(a) if grid.find(&a).is_some() => a,
                        _ => prev,
                    };
                    grid.add_below(&a, target);
                }
            }
        }

        if graph.id(target) != graph.id(el) {
            previous = Some(target);
        }
        placed.insert(0, target);
        visited.insert(graph.id(target).to_string());
    }

    // exclusive gateways first, so they are popped from the LIFO stack last
    let mut out: Vec<usize> = placed
        .iter()
        .copied()
        .filter(|&t| graph.kind(t) == "exclusiveGateway")
        .collect();
    out.extend(
        placed
            .iter()
            .copied()
            .filter(|&t| graph.kind(t) != "exclusiveGateway"),
    );
    out
}

/// Place the successors of this host's boundary events one row down, one col right.
fn attacher_step(
    host: usize,
    grid: &mut Grid<usize>,
    graph: &FlowGraph,
    visited: &mut IndexSet<String>,
) -> Vec<usize> {
    let mut out = Vec::new();
    let Some(attachers) = graph.attachers.get(graph.id(host)) else {
        return out;
    };
    for &be in attachers {
        let mut targets = graph.outgoing_targets(graph.id(be));
        targets.reverse();
        for target in targets {
            if visited.contains(graph.id(target)) {
                continue;
            }
            let Some((r, c)) = grid.find(&host) else {
                continue;
            };
            if grid.get(r + 1, c).is_some() || grid.get(r + 1, c + 1).is_some() {
                grid.create_row(Some(r));
            }
            grid.add(target, Some((r + 1, c + 1)));
            visited.insert(graph.id(target).to_string());
            out.push(target);
        }
    }
    out
}
