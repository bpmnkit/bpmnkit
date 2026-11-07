//! Port of `bpmn/process-text.ts` lines 1217–1622: the `if (final) { … }` block of
//! `assemble()` — boundary paths, a single blank start, missing starts, reachability,
//! loose fragments, ends, loop exits, rows between and-gateways, pass-through gateways,
//! implicit splits. Runs only for the final result, after defaults and before joins.
//!
//! TS deletes nodes inside loops over `[...nodes.values()]` snapshots (or the live map,
//! deleting only the current entry): these loops walk a snapshot of ids and re-check
//! presence. Edge indices are used before any removal that would shift them.

use bpmnkit_bpmn::slug::unique_id;
use bpmnkit_bpmn::BpmnElementType;
use indexmap::IndexSet;

use super::assemble::{node_is, problem, question, Ask, Assembly};
use super::tokens::{handles, is_conditional, is_event, is_gateway, list_of, name_from_id, Edge};
use super::{ProcessTextQuestion, QuestionOption};

type T = BpmnElementType;

fn is(ty: &str, t: T) -> bool {
    ty == t.as_str()
}

impl Assembly {
    /// The `if (final)` repair block of TS's `assemble()`.
    pub(crate) fn repair(&mut self) {
        self.boundary_work_to_host();
        self.one_blank_start();
        self.add_start();
        self.connect_loose();
        self.add_ends();
        self.exit_loops();
        self.rows_between_ands();
        self.remove_pass_through();
        self.split_implicit();
    }

    /// A boundary leads to the handling of what it catches, and to nothing else: the work
    /// that goes on when nothing goes wrong follows the task. The ways out named for
    /// handling stay (the first, when none is), the rest move to the task, and a bare end
    /// the task led to goes.
    fn boundary_work_to_host(&mut self) {
        for id in self.node_ids() {
            let Some(node) = self.nodes.get(&id) else {
                continue;
            };
            let element = &node.element;
            if !is(&element.type_, T::BoundaryEvent) {
                continue;
            }
            let Some(attached_to) = element.attached_to.clone() else {
                continue;
            };
            let out = self.out_of(&id);
            if out.len() < 2 {
                continue;
            }
            let handling: Vec<usize> = out
                .iter()
                .copied()
                .filter(|&e| handles(self.nodes.get(&self.edges[e].to).map(|n| &n.element)))
                .collect();
            let rest: Vec<usize> = if handling.is_empty() {
                out[1..].to_vec()
            } else {
                out.iter()
                    .copied()
                    .filter(|e| !handling.contains(e))
                    .collect()
            };
            if rest.is_empty() {
                continue;
            }
            // The flows removed here end at bare ends, never at what `rest` leads to, so
            // the `into` counts below are the same whether they are removed now or later.
            let mut gone: Vec<usize> = vec![];
            for e in self.out_of(&attached_to) {
                let Some(end) = self.nodes.get(&self.edges[e].to).map(|n| &n.element) else {
                    continue;
                };
                if !is(&end.type_, T::EndEvent) || end.event_type.is_some() {
                    continue;
                }
                let end_id = end.id.clone();
                if self.in_to(&end_id).len() > 1 {
                    continue;
                }
                self.nodes.shift_remove(&end_id);
                gone.push(e);
                self.fixes.push(format!(
                    "removed end event \"{end_id}\" after \"{attached_to}\", whose work followed its boundary"
                ));
            }
            let moved: Vec<String> = rest
                .iter()
                .map(|&e| format!("{id} > {}", self.edges[e].to))
                .collect();
            for &e in &rest {
                self.edges[e].from.clone_from(&attached_to);
            }
            self.remove_edges(&gone);
            self.fixes.push(format!(
                "moved {} onto \"{attached_to}\": a boundary leads only to its handling",
                moved.join(", ")
            ));
        }
    }

    /// One blank start: the later ones go, and what they led to is placed as any path
    /// nothing leads to is.
    fn one_blank_start(&mut self) {
        let mut blank: Vec<(String, u32)> = self
            .nodes
            .values()
            .filter(|n| is(&n.element.type_, T::StartEvent) && n.element.event_type.is_none())
            .map(|n| (n.element.id.clone(), n.line))
            .collect();
        blank.sort_by_key(|(_, line)| *line);
        for (id, line) in blank.into_iter().skip(1) {
            self.nodes.shift_remove(&id);
            self.edges.retain(|e| e.from != id);
            self.problems.push(problem(
                line,
                format!("\"{id}\" is a second blank start event; left out"),
            ));
        }
    }

    /// A start where none was written, and a start left unconnected leads to the first
    /// path that has no way in.
    fn add_start(&mut self) {
        let first = self
            .nodes
            .values()
            .find(|n| {
                let ty = &n.element.type_;
                !is(ty, T::StartEvent)
                    && !is(ty, T::BoundaryEvent)
                    && !is(ty, T::EndEvent)
                    && self.in_to(&n.element.id).is_empty()
            })
            .map(|n| n.element.id.clone());
        let starts: Vec<(String, u32)> = self
            .nodes
            .values()
            .filter(|n| is(&n.element.type_, T::StartEvent))
            .map(|n| (n.element.id.clone(), n.line))
            .collect();
        if starts.is_empty() {
            let start = unique_id("start", &mut self.taken);
            self.add(&start, T::StartEvent, 0, Some("Process started".to_owned()));
            if let Some(first) = &first {
                self.edges.insert(
                    0,
                    Edge {
                        from: start.clone(),
                        to: first.clone(),
                        line: 0,
                        ..Edge::default()
                    },
                );
            }
            let before = first
                .as_ref()
                .map(|f| format!(" before \"{f}\""))
                .unwrap_or_default();
            self.fixes
                .push(format!("added start event \"{start}\"{before}"));
        } else {
            let idle = starts
                .iter()
                .find(|(id, _)| self.out_of(id).is_empty())
                .cloned();
            if let (Some((idle, line)), Some(first)) = (idle, first) {
                self.push_edge(&idle, &first, line, None);
                self.fixes
                    .push(format!("connected start event \"{idle}\" to \"{first}\""));
            }
        }
    }

    /// TS's `reach`: every node on a path from a start event, boundaries with their host.
    fn reach(&self) -> IndexSet<String> {
        let mut reached = IndexSet::new();
        let mut queue: std::collections::VecDeque<String> = self
            .nodes
            .values()
            .filter(|n| is(&n.element.type_, T::StartEvent))
            .map(|n| n.element.id.clone())
            .collect();
        while let Some(id) = queue.pop_front() {
            if reached.contains(&id) {
                continue;
            }
            for e in self.out_of(&id) {
                queue.push_back(self.edges[e].to.clone());
            }
            for node in self.nodes.values() {
                if node.element.attached_to.as_deref() == Some(id.as_str()) {
                    queue.push_back(node.element.id.clone());
                }
            }
            reached.insert(id);
        }
        reached
    }

    /// A task or gateway nothing leads to continues the latest path written before it
    /// that stops short; what is still unreached is left out.
    fn connect_loose(&mut self) {
        let mut reached = self.reach();
        let mut order: Vec<(String, u32)> = self
            .nodes
            .values()
            .map(|n| (n.element.id.clone(), n.line))
            .collect();
        order.sort_by_key(|(_, line)| *line);
        for (key, line) in order {
            let Some(node) = self.nodes.get(&key) else {
                continue;
            };
            let id = node.element.id.clone();
            if reached.contains(&id) || node_is(node, is_event) || !self.in_to(&id).is_empty() {
                continue;
            }
            let mut from: Option<(&str, u32)> = None;
            for other in self.nodes.values() {
                if reached.contains(&other.element.id)
                    && !is(&other.element.type_, T::EndEvent)
                    && other.line <= line
                    && self.out_of(&other.element.id).is_empty()
                    && from.is_none_or(|(_, latest)| other.line >= latest)
                {
                    from = Some((&other.element.id, other.line));
                }
            }
            let Some((from, _)) = from else {
                continue;
            };
            let from = from.to_owned();
            self.push_edge(&from, &id, line, None);
            self.fixes.push(format!(
                "connected \"{from}\" to \"{id}\", which nothing led to"
            ));
            reached = self.reach();
        }
        // What is still unreached is a fragment the model never connected, and drawing it
        // loose is worse than leaving it out.
        for id in self.node_ids() {
            if reached.contains(&id) {
                continue;
            }
            let Some(node) = self.nodes.shift_remove(&id) else {
                continue;
            };
            self.problems.push(problem(
                node.line,
                format!("\"{id}\" is not connected to a start event; left out"),
            ));
            if node_is(&node, is_event) || node_is(&node, is_gateway) {
                continue;
            }
            let name = node.element.name.unwrap_or_else(|| name_from_id(&id));
            self.asks.push(Ask {
                line: node.line,
                ask: Box::new(move |_| {
                    question(
                        &id,
                        format!(
                            "\"{name}\" was left out: nothing leads to it. Where does it belong?"
                        ),
                        format!("Put \"{name}\" after "),
                    )
                }),
            });
        }
        self.edges
            .retain(|e| reached.contains(&e.from) && reached.contains(&e.to));
    }

    /// TS's `addEnds`: every path that stops elsewhere, including a boundary with nowhere
    /// to go, gets an end event.
    fn add_ends(&mut self) {
        for key in self.node_ids() {
            let Some(node) = self.nodes.get(&key) else {
                continue;
            };
            let id = node.element.id.clone();
            if is(&node.element.type_, T::EndEvent) || !self.out_of(&id).is_empty() {
                continue;
            }
            let line = node.line;
            let name = if node_is(node, is_event) {
                node.element.name.clone()
            } else {
                None
            };
            let end = unique_id(&format!("{id}_end"), &mut self.taken);
            self.add(
                &end,
                T::EndEvent,
                line,
                Some(name.unwrap_or_else(|| "Process completed".to_owned())),
            );
            self.push_edge(&id, &end, line, None);
            self.fixes
                .push(format!("added end event \"{end}\" after \"{id}\""));
        }
    }

    /// TS's `visit`: depth-first from `id`, collecting flows back into the path that lead
    /// to a stuck node.
    fn visit(
        &self,
        id: &str,
        in_stuck: &IndexSet<String>,
        backs: &mut IndexSet<usize>,
        done: &mut IndexSet<String>,
        on_path: &mut IndexSet<String>,
    ) {
        on_path.insert(id.to_owned());
        for e in self.out_of(id) {
            let to = &self.edges[e].to;
            if on_path.contains(to) {
                if in_stuck.contains(to) {
                    backs.insert(e);
                }
            } else if !done.contains(to) {
                self.visit(to, in_stuck, backs, done, on_path);
            }
        }
        on_path.shift_remove(id);
        done.insert(id.to_owned());
    }

    /// Exits: a loop with no way out gets a branch to an end event from its last
    /// decision; a loop with no decision in it loses its flows back.
    fn exit_loops(&mut self) {
        loop {
            let mut ends: IndexSet<String> = IndexSet::new();
            let mut queue: std::collections::VecDeque<String> = self
                .nodes
                .values()
                .filter(|n| is(&n.element.type_, T::EndEvent))
                .map(|n| n.element.id.clone())
                .collect();
            while let Some(id) = queue.pop_front() {
                if ends.contains(&id) {
                    continue;
                }
                for e in self.in_to(&id) {
                    queue.push_back(self.edges[e].from.clone());
                }
                ends.insert(id);
            }
            let stuck: Vec<(String, u32, bool)> = self
                .nodes
                .values()
                .filter(|n| {
                    !ends.contains(&n.element.id) && !is(&n.element.type_, T::BoundaryEvent)
                })
                .map(|n| (n.element.id.clone(), n.line, node_is(n, is_conditional)))
                .collect();
            let mut decisions: Vec<&(String, u32, bool)> =
                stuck.iter().filter(|(_, _, c)| *c).collect();
            decisions.sort_by_key(|(_, line, _)| std::cmp::Reverse(*line));
            let Some((id, line, _)) = decisions.first().map(|d| (*d).clone()) else {
                if stuck.is_empty() {
                    break;
                }
                let in_stuck: IndexSet<String> =
                    stuck.iter().map(|(id, _, _)| id.clone()).collect();
                let mut backs: IndexSet<usize> = IndexSet::new();
                let mut done: IndexSet<String> = IndexSet::new();
                let mut on_path: IndexSet<String> = IndexSet::new();
                let starts: Vec<String> = self
                    .nodes
                    .values()
                    .filter(|n| is(&n.element.type_, T::StartEvent))
                    .map(|n| n.element.id.clone())
                    .collect();
                for start in starts {
                    self.visit(&start, &in_stuck, &mut backs, &mut done, &mut on_path);
                }
                for &e in &backs {
                    let edge = &self.edges[e];
                    self.problems.push(problem(
                        edge.line,
                        format!(
                            "flow {} > {} loops with no way out; left out",
                            edge.from, edge.to
                        ),
                    ));
                }
                let gone: Vec<usize> = backs.iter().copied().collect();
                self.remove_edges(&gone);
                self.add_ends();
                if !backs.is_empty() {
                    continue;
                }
                for (id, line, _) in stuck {
                    self.problems.push(problem(
                        line,
                        format!("\"{id}\" is in a loop with no way out"),
                    ));
                }
                break;
            };
            let end = unique_id(&format!("{id}_end"), &mut self.taken);
            self.add(
                &end,
                T::EndEvent,
                line,
                Some("Process completed".to_owned()),
            );
            self.push_edge(&id, &end, line, Some("Otherwise".to_owned()));
            self.fixes.push(format!(
                "added an exit from the loop at \"{id}\" to end event \"{end}\""
            ));
            self.asks.push(Ask {
                line,
                ask: Box::new(move |a| {
                    let name = a.name_of(&id);
                    question(
                        &id,
                        format!(
                            "The loop at \"{name}\" had no way out, so one was added. When does it end?"
                        ),
                        format!("Leave the loop at \"{name}\" when "),
                    )
                }),
            });
        }
    }

    /// `fork[and] > pick > pack > label > joined[and]`: steps between an and split and an
    /// and join with nothing beside them are the parallel branches, drawn in a row.
    fn rows_between_ands(&mut self) {
        for id in self.node_ids() {
            let Some(node) = self.nodes.get(&id) else {
                continue;
            };
            if !is(&node.element.type_, T::ParallelGateway) {
                continue;
            }
            let line = node.line;
            if self.in_to(&id).len() != 1 || self.out_of(&id).len() != 1 {
                continue;
            }
            let first_out =
                |a: &Self, at: &str| a.out_of(at).first().map(|&e| a.edges[e].to.clone());
            let mut chain: Vec<String> = vec![];
            let mut at = first_out(self, &id);
            while let Some(here) = at.clone() {
                let Some(next) = self.nodes.get(&here) else {
                    break;
                };
                if node_is(next, is_gateway) || node_is(next, is_event) {
                    break;
                }
                if self.in_to(&here).len() != 1 || self.out_of(&here).len() != 1 {
                    break;
                }
                at = first_out(self, &here);
                chain.push(here);
            }
            let Some(end) = at else {
                continue;
            };
            let Some(join) = self.nodes.get(&end) else {
                continue;
            };
            if chain.len() < 2
                || !is(&join.element.type_, T::ParallelGateway)
                || self.in_to(&end).len() != 1
            {
                continue;
            }
            self.edges
                .retain(|e| e.from != id && !chain.contains(&e.from));
            for step in &chain {
                self.push_edge(&id, step, line, None);
                self.push_edge(step, &end, line, None);
            }
            let steps: Vec<String> = chain.iter().map(|c| format!("\"{c}\"")).collect();
            self.fixes.push(format!(
                "ran {} in parallel between \"{id}\" and \"{end}\", as their and nodes say",
                steps.join(", ")
            ));
        }
    }

    /// TS's `dedupe`: one flow between the same two nodes is enough.
    fn dedupe(&mut self) {
        let mut once: IndexSet<String> = IndexSet::new();
        self.edges
            .retain(|e| once.insert(format!("{}>{}", e.from, e.to)));
    }

    /// Pass-through gateways: one way in and one way out decides nothing.
    fn remove_pass_through(&mut self) {
        let mut removed = true;
        while removed {
            removed = false;
            // Removing one gateway can leave two flows between the same nodes
            self.dedupe();
            for id in self.node_ids() {
                let Some(node) = self.nodes.get(&id) else {
                    continue;
                };
                if !node_is(node, is_gateway) {
                    continue;
                }
                let (into, out) = (self.in_to(&id), self.out_of(&id));
                let (&[in_edge], &[out_edge]) = (&into[..], &out[..]) else {
                    continue;
                };
                if self.edges[in_edge].from == self.edges[out_edge].to {
                    continue;
                }
                let line = node.line;
                let ty = node.element.type_.clone();
                // `pack[and Pack into box]`: a step written with a gateway's kind is that step
                if node.element.name.as_deref().is_some_and(|n| !n.is_empty())
                    && (is(&ty, T::ParallelGateway) || is(&ty, T::InclusiveGateway))
                {
                    if let Some(node) = self.nodes.get_mut(&id) {
                        node.element.type_ = T::Task.as_str().to_owned();
                    }
                    self.problems.push(problem(
                        line,
                        format!("\"{id}\" is a gateway with one way in and out, named like a step; made it a task"),
                    ));
                    continue;
                }
                let target = self.type_of(&self.edges[out_edge].to);
                if is(&ty, T::EventBasedGateway)
                    && target != Some(T::IntermediateCatchEvent)
                    && target != Some(T::ReceiveTask)
                {
                    // Waiting for one event is a catch event, not a race between events.
                    if let Some(node) = self.nodes.get_mut(&id) {
                        node.element.type_ = T::IntermediateCatchEvent.as_str().to_owned();
                        node.element.event_type = Some("message".to_owned());
                    }
                    self.problems.push(problem(
                        line,
                        format!("\"{id}\" waits for only one event; made it a message catch event"),
                    ));
                    continue;
                }
                self.edges[in_edge].to = self.edges[out_edge].to.clone();
                self.edges.remove(out_edge);
                let Some(node) = self.nodes.shift_remove(&id) else {
                    continue;
                };
                self.problems.push(problem(
                    line,
                    format!("\"{id}\" has only one branch; gateway removed"),
                ));
                if node_is(&node, is_conditional) {
                    // Most often a question the model asked and answered only one way.
                    let name = node
                        .element
                        .name
                        .unwrap_or_else(|| format!("{}?", name_from_id(&id)));
                    self.asks.push(Ask {
                        line,
                        ask: Box::new(move |_| {
                            question(
                                &id,
                                format!("\"{name}\" had only one way to go, so it was removed. What happens otherwise?"),
                                format!("At \"{name}\", otherwise "),
                            )
                        }),
                    });
                }
                removed = true;
            }
        }
        self.dedupe();
    }

    /// Implicit splits: a task or event with several ways out forks the token without
    /// saying so. Labelled branches are a decision, unlabelled ones that all wait (one at
    /// least on a catch event) a race, the others run in parallel.
    fn split_implicit(&mut self) {
        for key in self.node_ids() {
            let Some(node) = self.nodes.get(&key) else {
                continue;
            };
            let id = node.element.id.clone();
            let out = self.out_of(&id);
            if node_is(node, is_gateway) || out.len() < 2 {
                continue;
            }
            let line = node.line;
            let node_name = node.element.name.clone();
            // A DMN decision's outcomes are alternatives, labelled or not
            let decides = is(&node.element.type_, T::BusinessRuleTask)
                || out.iter().any(|&e| {
                    let edge = &self.edges[e];
                    edge.condition.is_some() || edge.name.is_some()
                });
            let target_ids: Vec<String> = out.iter().map(|&e| self.edges[e].to.clone()).collect();
            let target_type = |to: &String| self.nodes.get(to).map(|n| n.element.type_.as_str());
            let races = !decides
                && target_ids.iter().all(|to| {
                    target_type(to)
                        .is_some_and(|t| is(t, T::IntermediateCatchEvent) || is(t, T::ReceiveTask))
                })
                && target_ids
                    .iter()
                    .any(|to| target_type(to).is_some_and(|t| is(t, T::IntermediateCatchEvent)));
            let split = unique_id(&format!("{id}_split"), &mut self.taken);
            let gateway_type = if decides {
                T::ExclusiveGateway
            } else if races {
                T::EventBasedGateway
            } else {
                T::ParallelGateway
            };
            let name = decides.then(|| {
                format!(
                    "{} outcome?",
                    node_name.unwrap_or_else(|| name_from_id(&id))
                )
            });
            self.add(&split, gateway_type, line, name);
            for &e in &out {
                self.edges[e].from.clone_from(&split);
            }
            self.push_edge(&id, &split, line, None);
            if races {
                // Camunda 8 waits on catch events only after an event-based gateway.
                for to in &target_ids {
                    let Some(target) = self.nodes.get_mut(to) else {
                        continue;
                    };
                    let element = &mut target.element;
                    if is(&element.type_, T::ReceiveTask) {
                        element.type_ = T::IntermediateCatchEvent.as_str().to_owned();
                    }
                    element
                        .event_type
                        .get_or_insert_with(|| "message".to_owned());
                }
            }
            let kind = if decides {
                "xor"
            } else if races {
                "event"
            } else {
                "and"
            };
            self.fixes.push(format!(
                "split the flows out of \"{id}\" with {kind} gateway \"{split}\""
            ));
            if kind == "and" {
                // Read now: a join below may take a branch's place as its target.
                self.asks.push(Ask {
                    line,
                    ask: Box::new(move |a| and_split_question(a, &id, &split, &target_ids)),
                });
            }
        }
    }
}

/// The question an implicit parallel split asks.
fn and_split_question(
    a: &Assembly,
    id: &str,
    split: &str,
    target_ids: &[String],
) -> ProcessTextQuestion {
    let name = a.name_of(id);
    let quoted: Vec<String> = target_ids
        .iter()
        .map(|to| format!("\"{}\"", a.name_of(to)))
        .collect();
    let branches = list_of(&quoted);
    ProcessTextQuestion {
        element_id: split.to_owned(),
        text: format!("After \"{name}\", {branches} run at the same time. Is that right?"),
        options: vec![
            QuestionOption {
                label: "Only one of them".to_owned(),
                change: format!(
                    "After \"{name}\", only one of {branches} happens: decide which with an xor gateway."
                ),
            },
            QuestionOption {
                label: "One after the other".to_owned(),
                change: format!(
                    "After \"{name}\", do {branches} one after the other, not at the same time."
                ),
            },
        ],
        draft: format!("After \"{name}\", "),
    }
}
