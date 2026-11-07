//! Port of `bpmn/process-text.ts` lines 998–1216 and 1623–1955: `assemble()`, which turns
//! what the reader holds into a diagram `expand` accepts. The `if (final)` repair block in
//! between (1217–1622) is `Assembly::repair` in `repair.rs`.
//!
//! Notes:
//! - TS's locals become [`Assembly`] fields; its closures (`typeOf`, `nameOf`, `add`,
//!   `outOf`, `into`) become methods. `asks` hold closures run after everything, so a
//!   question sees the final names: [`Ask::ask`] gets the finished `Assembly`.
//! - `assemble` copies `reader.nodes` and `reader.edges` (`edges_read`, from which a
//!   boundary drawn into by its host is spliced out), so stream frames leave the reader as read.
//! - JS `Map` order: `nodes.delete` is `shift_remove`; re-adding a deleted key appends.
//! - TS compares edges by identity; here they are indices into the current `edges`, and
//!   every removal happens after the indices it was computed with are used.
//! - Sorting: `problems.sort((a, b) => a.line - b.line)` and the asks by line are stable.

use bpmnkit_bpmn::js::{is_js_space, js_trim};
use bpmnkit_bpmn::slug::{slugify, unique_id};
use bpmnkit_bpmn::BpmnElementType;
use indexmap::{IndexMap, IndexSet};

use super::reader::Reader;
use super::tokens::{
    is_conditional, is_event, is_gateway, is_job_task, is_otherwise, name_from_id, type_from_id,
    variable_from, Edge, Node, EVENTS, GATEWAYS,
};
use super::{
    ConnectorRef, ProcessTextProblem, ProcessTextQuestion, ProcessTextResult, QuestionOption,
};
use crate::compact::{
    CompactChildren, CompactDiagram, CompactElement, CompactFlow, CompactNote, CompactProcess,
};

/// A question, asked once the names are final (TS's `{ line, ask }`).
pub(crate) struct Ask {
    pub line: u32,
    pub ask: Box<dyn Fn(&Assembly) -> ProcessTextQuestion>,
}

impl std::fmt::Debug for Ask {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Ask")
            .field("line", &self.line)
            .finish_non_exhaustive()
    }
}

/// `assemble()`'s working state.
#[derive(Debug)]
pub(crate) struct Assembly {
    /// False while streaming: nothing is added at the ends of unfinished paths.
    pub final_: bool,
    pub problems: Vec<ProcessTextProblem>,
    pub fixes: Vec<String>,
    pub asks: Vec<Ask>,
    pub nodes: IndexMap<String, Node>,
    pub taken: IndexSet<String>,
    /// Tasks placed inside an ad-hoc sub-process (`inside=`), outside the flow.
    pub child_nodes: Vec<Node>,
    pub edges: Vec<Edge>,
}

/// TS's `SET.has(node.element.type)` for a node's type string.
pub(crate) fn node_is(node: &Node, test: fn(BpmnElementType) -> bool) -> bool {
    BpmnElementType::parse(&node.element.type_).is_some_and(test)
}

/// JS template interpolation of a value that may be `undefined`.
pub(crate) fn or_undefined(value: Option<&str>) -> &str {
    value.unwrap_or("undefined")
}

pub(crate) fn problem(line: u32, message: String) -> ProcessTextProblem {
    ProcessTextProblem { line, message }
}

/// A question with no ready answers.
pub(crate) fn question(element_id: &str, text: String, draft: String) -> ProcessTextQuestion {
    ProcessTextQuestion {
        element_id: element_id.to_owned(),
        text,
        options: vec![],
        draft,
    }
}

/// `/^word\b/i` for an ASCII `word`: JS without `u` folds no non-ASCII letter onto ASCII.
fn starts_with_word(label: &str, word: &str) -> bool {
    let Some(head) = label.get(..word.len()) else {
        return false;
    };
    head.eq_ignore_ascii_case(word)
        && !label[word.len()..]
            .chars()
            .next()
            .is_some_and(|c| c.is_ascii_alphanumeric() || c == '_')
}

/// `text.split(":")[0].trim()`.
fn before_colon(text: &str) -> String {
    js_trim(text.split(':').next().unwrap_or("")).to_owned()
}

impl Assembly {
    /// TS's `typeOf`. `None` for an id that is not a node, or a type `CompactElement`
    /// holds that is not a known element type.
    pub fn type_of(&self, id: &str) -> Option<BpmnElementType> {
        self.nodes.get(id).and_then(|n| n.element.element_type())
    }

    /// TS's `nameOf`: the node's name, else `name_from_id(id)`.
    pub fn name_of(&self, id: &str) -> String {
        self.nodes
            .get(id)
            .and_then(|n| n.element.name.clone())
            .unwrap_or_else(|| name_from_id(id))
    }

    /// TS's `add`: a new node `{ id, type }` (with `name` when given), spec `""`.
    pub fn add(&mut self, id: &str, ty: BpmnElementType, line: u32, name: Option<String>) {
        let element = CompactElement {
            id: id.to_owned(),
            type_: ty.as_str().to_owned(),
            name,
            ..CompactElement::default()
        };
        self.nodes.insert(
            id.to_owned(),
            Node {
                element,
                line,
                spec: String::new(),
                on: None,
                inside: None,
            },
        );
    }

    /// TS's `outOf`: indices into `edges` of the flows leaving `id`, in order.
    pub fn out_of(&self, id: &str) -> Vec<usize> {
        (0..self.edges.len())
            .filter(|&i| self.edges[i].from == id)
            .collect()
    }

    /// TS's `into`: indices into `edges` of the flows entering `id`, in order.
    pub fn in_to(&self, id: &str) -> Vec<usize> {
        (0..self.edges.len())
            .filter(|&i| self.edges[i].to == id)
            .collect()
    }

    /// `edges = edges.filter((edge) => !gone.includes(edge))`, by index.
    pub(crate) fn remove_edges(&mut self, gone: &[usize]) {
        let mut i = 0;
        self.edges.retain(|_| {
            let keep = !gone.contains(&i);
            i += 1;
            keep
        });
    }

    /// `edges.push({ from, to, line, name? })`.
    pub(crate) fn push_edge(&mut self, from: &str, to: &str, line: u32, name: Option<String>) {
        self.edges.push(Edge {
            from: from.to_owned(),
            to: to.to_owned(),
            name,
            line,
            ..Edge::default()
        });
    }

    /// A snapshot of the node ids, for TS's loops over `[...nodes]` (and over the live map
    /// where the only change is deleting the current entry).
    pub(crate) fn node_ids(&self) -> Vec<String> {
        self.nodes.keys().cloned().collect()
    }

    /// TS's `splitOf`: the gateway the branch `edge` came from, if one path leads back to it.
    fn split_of(&self, edge: usize) -> Option<String> {
        let mut visited = IndexSet::new();
        let mut id = self.edges[edge].from.clone();
        while !visited.contains(&id) {
            visited.insert(id.clone());
            if is_gateway(self.type_of(&id).unwrap_or(BpmnElementType::Task))
                && self.out_of(&id).len() > 1
            {
                return Some(id);
            }
            let into = self.in_to(&id);
            if into.len() != 1 {
                return None;
            }
            id = self.edges[into[0]].from.clone();
        }
        None
    }

    /// Joins: branches that meet at anything but a join gateway meet at a join gateway
    /// first, of the type of the split they came from.
    fn join(&mut self) {
        for target in self.node_ids() {
            let Some(node) = self.nodes.get(&target) else {
                continue;
            };
            let incoming = self.in_to(&target);
            let line = node.line;
            if incoming.len() < 2 || (node_is(node, is_gateway) && self.out_of(&target).len() < 2) {
                continue;
            }
            let splits: IndexSet<Option<String>> =
                incoming.iter().map(|&e| self.split_of(e)).collect();
            let split_type = match (splits.first(), splits.len()) {
                (Some(Some(split)), 1) => self.type_of(split),
                _ => None,
            };
            let join_type = match split_type {
                Some(
                    t @ (BpmnElementType::ParallelGateway | BpmnElementType::InclusiveGateway),
                ) => t,
                _ => BpmnElementType::ExclusiveGateway,
            };
            let join = unique_id(&format!("{target}_join"), &mut self.taken);
            self.add(&join, join_type, line, None);
            for &e in &incoming {
                self.edges[e].to.clone_from(&join);
            }
            self.push_edge(&join, &target, line, None);
            let kind = match join_type {
                BpmnElementType::ParallelGateway => "and",
                BpmnElementType::InclusiveGateway => "or",
                _ => "xor",
            };
            self.fixes.push(format!(
                "joined {} flows into \"{target}\" with {kind} gateway \"{join}\"",
                incoming.len()
            ));
        }
    }

    /// Conditions: every branch of a decision has a FEEL condition, or is its one default;
    /// every other flow carries neither, nor a label that implies one.
    fn conditions(&mut self) {
        for id in self.node_ids() {
            let Some(node) = self.nodes.get(&id) else {
                continue;
            };
            let out = self.out_of(&id);
            let node_line = node.line;
            let node_name = node.element.name.clone();
            if !node_is(node, is_conditional) || out.len() < 2 {
                for &e in &out {
                    if self.edges[e].condition.is_some() {
                        let to = &self.edges[e].to;
                        self.fixes.push(format!(
                            "dropped the condition on {id} > {to}, which is not a decision"
                        ));
                    }
                    let edge = &mut self.edges[e];
                    edge.condition = None;
                    edge.is_default = None;
                    edge.name = None;
                }
                continue;
            }
            if !out.iter().any(|&e| self.edges[e].is_default == Some(true)) {
                self.choose_default(&id, node_line, &out);
            }
            let variable = variable_from(node_name.as_deref().unwrap_or(&id));
            let mut made_up = false;
            for &e in &out {
                if self.edges[e].is_default == Some(true) {
                    self.edges[e].condition = None;
                    continue;
                }
                if self.edges[e].condition.is_none() {
                    // A branch described in prose, or not at all: a condition on a variable
                    // named for the question keeps the gateway deployable.
                    let edge = &self.edges[e];
                    let text = edge
                        .name
                        .clone()
                        .or_else(|| {
                            self.nodes
                                .get(&edge.to)
                                .and_then(|n| n.element.name.clone())
                        })
                        .unwrap_or_else(|| edge.to.clone());
                    let label = before_colon(&text).replace('"', "");
                    let condition = if starts_with_word(&label, "yes")
                        || starts_with_word(&label, "true")
                    {
                        format!("= {variable} = true")
                    } else if starts_with_word(&label, "no") || starts_with_word(&label, "false") {
                        format!("= {variable} = false")
                    } else {
                        format!("= {variable} = \"{label}\"")
                    };
                    self.fixes.push(format!(
                        "gave {id} > {} the condition \"{condition}\"",
                        edge.to
                    ));
                    self.edges[e].condition = Some(condition);
                    made_up = true;
                }
                let edge = &mut self.edges[e];
                if edge.name.is_none() {
                    let condition = edge.condition.as_deref().unwrap_or("");
                    let stripped = condition
                        .strip_prefix('=')
                        .map_or(condition, |rest| rest.trim_start_matches(is_js_space));
                    edge.name = Some(stripped.to_owned());
                }
            }
            if made_up {
                let id = id.clone();
                self.asks.push(Ask {
                    line: node_line,
                    ask: Box::new(move |a| {
                        let name = a.name_of(&id);
                        question(
                            &id,
                            format!(
                                "\"{name}\" decides on \"{variable}\", a variable the diagram made up. What data decides it?"
                            ),
                            format!("At \"{name}\", decide on "),
                        )
                    }),
                });
            }
        }
    }

    /// A decision without a default takes the branch that reads as "otherwise", else the
    /// last branch without a condition, else its last branch.
    fn choose_default(&mut self, id: &str, line: u32, out: &[usize]) {
        let plain: Vec<usize> = out
            .iter()
            .copied()
            .filter(|&e| self.edges[e].condition.is_none())
            .collect();
        let pool = if plain.is_empty() { out } else { &plain[..] };
        let otherwise = pool
            .iter()
            .copied()
            .find(|&e| is_otherwise(self.edges[e].name.as_deref().unwrap_or("")));
        let Some(chosen) = otherwise.or_else(|| pool.last().copied()) else {
            return;
        };
        if otherwise.is_none() {
            // Read now: the conditions loop gives every other branch a label.
            let branches: Vec<(bool, Option<String>, String)> = out
                .iter()
                .map(|&e| {
                    let edge = &self.edges[e];
                    (
                        e == chosen,
                        edge.name.as_deref().map(before_colon),
                        edge.to.clone(),
                    )
                })
                .collect();
            let id = id.to_owned();
            self.asks.push(Ask {
                line,
                ask: Box::new(move |a| {
                    let name = a.name_of(&id);
                    // `labels.get(edge) || nameOf(edge.to)`: an empty label falls back too
                    let label = |(_, label, to): &(bool, Option<String>, String)| match label {
                        Some(l) if !l.is_empty() => l.clone(),
                        _ => a.name_of(to),
                    };
                    let taken = branches.iter().find(|b| b.0).map(label).unwrap_or_default();
                    ProcessTextQuestion {
                        element_id: id.clone(),
                        text: format!(
                            "When no condition at \"{name}\" holds, it takes \"{taken}\". Is that the right fallback?"
                        ),
                        options: branches
                            .iter()
                            .filter(|b| !b.0)
                            .map(|b| {
                                let label = label(b);
                                QuestionOption {
                                    change: format!(
                                        "At \"{name}\", make \"{label}\" the default branch."
                                    ),
                                    label,
                                }
                            })
                            .collect(),
                        draft: format!("At \"{name}\", when nothing else holds, "),
                    }
                }),
            });
        }
        let edge = &mut self.edges[chosen];
        edge.is_default = Some(true);
        let to = edge.to.clone();
        if edge.condition.is_some() {
            edge.condition = None;
            self.fixes.push(format!(
                "made {id} > {to} the default branch of \"{id}\" instead of its condition"
            ));
        } else {
            self.fixes
                .push(format!("made {id} > {to} the default branch of \"{id}\""));
        }
    }

    /// Names: every event, task and decision says what it is.
    fn names(&mut self) {
        let mut named = 0;
        for id in self.node_ids() {
            let out = self.out_of(&id).len();
            let Some(node) = self.nodes.get_mut(&id) else {
                continue;
            };
            let element = &mut node.element;
            if element
                .name
                .as_deref()
                .is_some_and(|n| !js_trim(n).is_empty())
            {
                continue;
            }
            let ty = element.element_type();
            if matches!(
                ty,
                Some(BpmnElementType::ParallelGateway | BpmnElementType::EventBasedGateway)
            ) {
                continue;
            }
            let gateway = ty.is_some_and(is_gateway);
            if gateway && out < 2 {
                continue;
            }
            element.name = Some(if gateway {
                format!("{}?", name_from_id(&id))
            } else {
                name_from_id(&id)
            });
            named += 1;
        }
        for child in &mut self.child_nodes {
            let element = &mut child.element;
            if element
                .name
                .as_deref()
                .is_some_and(|n| !js_trim(n).is_empty())
            {
                continue;
            }
            element.name = Some(name_from_id(&element.id));
            named += 1;
        }
        if named > 0 {
            self.fixes
                .push(format!("named {named} unnamed element(s) from their ids"));
        }
    }

    /// Questions for catch events written without a trigger, which wait for a message.
    fn guessed_messages(&mut self, guessed: &IndexSet<String>) {
        for id in guessed {
            let Some(node) = self.nodes.get(id) else {
                continue;
            };
            if node.element.event_type.as_deref() != Some("message") {
                continue;
            }
            let id = id.clone();
            self.asks.push(Ask {
                line: node.line,
                ask: Box::new(move |a| {
                    let name = a.name_of(&id);
                    let option = |label: &str, change: String| QuestionOption {
                        label: label.to_owned(),
                        change,
                    };
                    ProcessTextQuestion {
                        element_id: id.clone(),
                        text: format!(
                            "\"{name}\" was written without a trigger, so it waits for a message. Is it something else?"
                        ),
                        options: vec![
                            option(
                                "A timer",
                                format!("\"{name}\" waits for a timer, not a message."),
                            ),
                            option(
                                "A signal",
                                format!("\"{name}\" waits for a signal, not a message."),
                            ),
                            option(
                                "Nothing",
                                format!(
                                    "\"{name}\" waits for nothing: make it a plain event, or the end."
                                ),
                            ),
                        ],
                        draft: format!("\"{name}\" waits for "),
                    }
                }),
            });
        }
    }

    /// `inside=<adhoc>`: a task that lives in an ad-hoc sub-process takes no part in the
    /// flow, so it moves to `child_nodes`. One that cannot live there stays where written.
    fn take_children(&mut self, reader: &Reader) {
        for id in self.node_ids() {
            let Some(node) = self.nodes.get(&id) else {
                continue;
            };
            let Some(mut parent_id) = node.inside.clone() else {
                continue;
            };
            let ty = node.element.type_.clone();
            let line = node.line;
            let mut parent = self.nodes.get_index_of(&parent_id);
            if parent.is_none() && !self.final_ {
                self.nodes.shift_remove(&id); // container still to come
                continue;
            }
            // `inside=agnet`: with one ad-hoc sub-process there is no doubt which was meant
            let only: Vec<usize> = (0..self.nodes.len())
                .filter(|&i| self.nodes[i].element.type_ == "adHocSubProcess")
                .collect();
            let sole = if only.len() == 1 { Some(only[0]) } else { None };
            if let (None, Some(sole)) = (parent, sole) {
                // `!sole.inside`: an empty `inside=` is falsy too
                if self.nodes[sole].inside.as_deref().is_none_or(str::is_empty) {
                    let written = parent_id.clone();
                    let name = self.nodes[&id]
                        .element
                        .name
                        .clone()
                        .unwrap_or_else(|| name_from_id(&id));
                    parent_id = self.nodes[sole].element.id.clone();
                    if let Some(node) = self.nodes.get_mut(&id) {
                        node.inside = Some(parent_id.clone());
                    }
                    parent = Some(sole);
                    self.fixes.push(format!(
                        "read inside={written} on \"{id}\" as inside=\"{parent_id}\", the only ad-hoc sub-process"
                    ));
                    let (id, parent_id) = (id.clone(), parent_id.clone());
                    self.asks.push(Ask {
                        line,
                        ask: Box::new(move |a| {
                            question(
                                &id,
                                format!(
                                    "inside={written} on \"{name}\" names no ad-hoc sub-process, so it was put in \"{}\", the only one. Is that where it belongs?",
                                    a.name_of(&parent_id)
                                ),
                                format!("Move \"{name}\" to "),
                            )
                        }),
                    });
                }
            }
            let why = match parent.map(|i| &self.nodes[i]) {
                None => Some(format!("\"{parent_id}\" is never declared")),
                Some(p) if p.element.type_ != "adHocSubProcess" => {
                    Some(format!("\"{parent_id}\" is not an ad-hoc sub-process"))
                }
                Some(p) if p.inside.is_some() => Some(format!(
                    "\"{parent_id}\" is itself inside another sub-process"
                )),
                _ if EVENTS
                    .iter()
                    .chain(GATEWAYS.iter())
                    .any(|t| t.as_str() == ty)
                    || ty == "adHocSubProcess" =>
                {
                    Some(format!(
                        "only a task can be inside an ad-hoc sub-process, not {ty}"
                    ))
                }
                _ => None,
            };
            if let Some(why) = why {
                // A node nothing leads to is dropped later as unconnected; say so rather than "stays"
                let drawn = reader.edges.iter().any(|e| e.from == id || e.to == id);
                let fate = if drawn {
                    "stays at the top level"
                } else {
                    "has no flows, so it is left out"
                };
                self.problems.push(problem(
                    line,
                    format!("inside={parent_id} on \"{id}\": {why}; \"{id}\" {fate}"),
                ));
                if let Some(node) = self.nodes.get_mut(&id) {
                    node.inside = None;
                }
                continue;
            }
            if let Some(node) = self.nodes.shift_remove(&id) {
                self.child_nodes.push(node);
            }
        }
    }

    /// Boundary events keep a host that is an activity in this process; `send >
    /// wait[boundary:timer …]` without `on=` takes the one task drawn into it.
    fn attach_boundaries(&mut self, edges: &mut Vec<Edge>) {
        for id in self.node_ids() {
            let Some(node) = self.nodes.get(&id) else {
                continue;
            };
            if node.element.type_ != "boundaryEvent" {
                continue;
            }
            let line = node.line;
            let drawn: Vec<usize> = if node.on.is_none() {
                (0..edges.len()).filter(|&i| edges[i].to == id).collect()
            } else {
                vec![]
            };
            if let [only] = drawn[..] {
                let from = self.nodes.get(&edges[only].from);
                if let Some(from) =
                    from.filter(|f| !node_is(f, is_event) && !node_is(f, is_gateway))
                {
                    let host = from.element.id.clone();
                    if let Some(node) = self.nodes.get_mut(&id) {
                        node.on = Some(host.clone());
                    }
                    edges.remove(only);
                    self.fixes.push(format!(
                        "put boundary \"{id}\" on \"{host}\", the task drawn into it"
                    ));
                }
            }
            let on = self.nodes[&id].on.clone();
            let host = on.as_deref().and_then(|on| self.nodes.get(on));
            if host.is_some_and(|h| !node_is(h, is_event) && !node_is(h, is_gateway)) {
                if let Some(node) = self.nodes.get_mut(&id) {
                    node.element.attached_to = on;
                }
                continue;
            }
            let host_missing = host.is_none();
            if !self.final_ && on.is_some() && host_missing {
                self.nodes.shift_remove(&id); // host still to come
                continue;
            }
            let message = match &on {
                None => format!("boundary \"{id}\" has no on=<task id>; left out"),
                Some(on) if host_missing => {
                    format!("boundary \"{id}\" is on \"{on}\", which is never declared; left out")
                }
                Some(on) => {
                    format!("boundary \"{id}\" is on \"{on}\", which is not a task; left out")
                }
            };
            self.problems.push(problem(line, message));
            self.nodes.shift_remove(&id);
        }
    }

    /// The flows as written, kept when both ends are declared, BPMN allows the direction
    /// and it is not a repeat; then at most one default per conditional gateway.
    fn keep_edges(&mut self, reader: &Reader, written: Vec<Edge>) {
        let mut seen: IndexSet<String> = IndexSet::new();
        for edge in written {
            let from = self.type_of(&edge.from);
            let to = self.type_of(&edge.to);
            let (Some(from), Some(to)) = (from, to) else {
                if self.final_ {
                    let missing = if from.is_none() { &edge.from } else { &edge.to };
                    let why = if reader.nodes.contains_key(missing) {
                        "was left out"
                    } else {
                        "is never declared"
                    };
                    self.problems.push(problem(
                        edge.line,
                        format!(
                            "\"{missing}\" {why}; flow {} > {} left out",
                            edge.from, edge.to
                        ),
                    ));
                }
                continue;
            };
            let wrong = if from == BpmnElementType::EndEvent {
                Some("an end event has no outgoing flow")
            } else if to == BpmnElementType::StartEvent {
                Some("a start event has no incoming flow")
            } else if to == BpmnElementType::BoundaryEvent {
                Some("a boundary event has no incoming flow")
            } else if edge.from == edge.to {
                Some("a flow cannot lead back to where it starts")
            } else {
                None
            };
            if let Some(wrong) = wrong {
                self.problems.push(problem(
                    edge.line,
                    format!("{wrong}; flow {} > {} left out", edge.from, edge.to),
                ));
                continue;
            }
            if !seen.insert(format!("{}>{}", edge.from, edge.to)) {
                continue;
            }
            self.edges.push(edge);
        }

        let mut defaulted: IndexSet<String> = IndexSet::new();
        for i in 0..self.edges.len() {
            if self.edges[i].is_default != Some(true) {
                continue;
            }
            let from = self.type_of(&self.edges[i].from);
            let edge = &self.edges[i];
            let already = defaulted.contains(&edge.from);
            if !from.is_some_and(is_conditional) || already {
                let message = if already {
                    format!(
                        "\"{}\" already has a default branch; this one is not the default",
                        edge.from
                    )
                } else {
                    format!(
                        "only an xor or or gateway has a default branch; {} > {} is not",
                        edge.from, edge.to
                    )
                };
                self.problems.push(problem(edge.line, message));
                self.edges[i].is_default = None;
                continue;
            }
            defaulted.insert(edge.from.clone());
        }
    }
}

/// A branch drawn into a boundary event (`check >(No) failed[boundary:error … | on=pay] >
/// notify`) means the path that boundary leads to: nothing can flow into a boundary.
fn redirect_into_boundaries(
    reader: &Reader,
    edges_read: &[Edge],
    outside: Vec<Edge>,
    final_: bool,
    fixes: &mut Vec<String>,
) -> Vec<Edge> {
    let mut written: Vec<Edge> = vec![];
    for edge in outside {
        let target = reader
            .nodes
            .get(&edge.to)
            .filter(|t| t.element.type_ == "boundaryEvent");
        let Some(target) = target else {
            written.push(edge);
            continue;
        };
        // `poll > late[… | on=poll]`: the arrow from its own task only says where it sits
        if target.on.as_deref() == Some(edge.from.as_str()) {
            continue;
        }
        let next: Vec<&Edge> = edges_read.iter().filter(|o| o.from == edge.to).collect();
        if next.is_empty() {
            written.push(edge);
            continue;
        }
        if final_ {
            fixes.push(format!(
                "led {} > {} to what the boundary leads to, since nothing flows into a boundary event",
                edge.from, edge.to
            ));
        }
        for out in next {
            written.push(Edge {
                to: out.to.clone(),
                ..edge.clone()
            });
        }
    }
    written
}

/// TS's `assemble(reader, final)`.
pub(crate) fn assemble(reader: &Reader, final_: bool) -> ProcessTextResult {
    // A copy: a stream assembles every frame from the same reader, which must stay as read
    let mut edges_read = reader.edges.clone();
    let mut a = Assembly {
        final_,
        problems: reader.problems.clone(),
        fixes: reader.fixes.clone(),
        asks: vec![],
        nodes: reader.nodes.clone(),
        taken: reader.nodes.keys().cloned().collect(),
        child_nodes: vec![],
        edges: vec![],
    };

    // An id used in a flow but never declared becomes a task named from its id once the
    // text is complete; while streaming it may yet be declared. An id only an `on=` names
    // is not added: nothing would lead to it.
    if final_ {
        for edge in &reader.edges {
            for id in [&edge.from, &edge.to] {
                if a.nodes.contains_key(id) {
                    continue;
                }
                let ty = type_from_id(id);
                let name = (!is_gateway(ty)).then(|| name_from_id(id));
                a.add(id, ty, edge.line, name);
                a.taken.insert(id.clone());
                a.problems.push(problem(
                    edge.line,
                    format!("\"{id}\" is never declared; added as a {}", ty.as_str()),
                ));
            }
        }
    }

    a.take_children(reader);
    let inside_ids: IndexSet<String> = a.child_nodes.iter().map(|n| n.element.id.clone()).collect();
    // Flows would make the task run in the main path, which an ad-hoc tool does not.
    // Cloned before `attach_boundaries` splices `edges_read`, as TS's arrays are.
    let (flowing, outside): (Vec<Edge>, Vec<Edge>) = edges_read
        .iter()
        .cloned()
        .partition(|e| inside_ids.contains(&e.from) || inside_ids.contains(&e.to));
    if final_ {
        for edge in &flowing {
            let child = if inside_ids.contains(&edge.from) {
                &edge.from
            } else {
                &edge.to
            };
            let parent = reader.nodes.get(child).and_then(|n| n.inside.as_deref());
            a.problems.push(problem(
                edge.line,
                format!(
                    "\"{child}\" is inside \"{}\", where a task has no flows; flow {} > {} left out",
                    or_undefined(parent),
                    edge.from,
                    edge.to
                ),
            ));
        }
    }

    a.attach_boundaries(&mut edges_read);
    let written = redirect_into_boundaries(reader, &edges_read, outside, final_, &mut a.fixes);
    a.keep_edges(reader, written);

    if final_ {
        a.repair();
    }

    a.join();

    if final_ {
        a.conditions();
        a.names();
        a.guessed_messages(&reader.guessed_message);
    }

    for node in a.nodes.values_mut().chain(a.child_nodes.iter_mut()) {
        let element = &mut node.element;
        let ty = element.element_type();
        if ty.is_some_and(is_job_task) && element.job_type.is_none() {
            element.job_type = Some(element.id.clone());
        }
        // A DMN task needs a decision to deploy; the id stands in, as it does for a job type.
        if ty == Some(BpmnElementType::BusinessRuleTask)
            && element.job_type.is_none()
            && element.decision_id.is_none()
        {
            element.decision_id = Some(element.id.clone());
        }
    }

    let title = reader.title.as_deref().filter(|t| !t.is_empty());
    let process_base = title.map_or_else(|| "Process_1".to_owned(), slugify);
    let starts_well = process_base
        .chars()
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_');
    let process_base = if starts_well {
        process_base
    } else {
        format!("Process_{process_base}")
    };
    let process_id = unique_id(&process_base, &mut a.taken);
    let mut flow_number = 0u32;
    let mut flows: Vec<CompactFlow> = vec![];
    for edge in &a.edges {
        let id = loop {
            flow_number += 1;
            let id = format!("Flow_{flow_number}");
            if !a.taken.contains(&id) {
                break id;
            }
        };
        a.taken.insert(id.clone());
        flows.push(CompactFlow {
            id,
            from: edge.from.clone(),
            to: edge.to.clone(),
            name: edge.name.clone(),
            condition: edge.condition.clone(),
            is_default: edge.is_default,
        });
    }

    // TS puts each child into its container here and sets docs on the same objects later;
    // here the children are copied in after the docs, which is the same.
    let mut placed: Vec<usize> = vec![];
    for (i, child) in a.child_nodes.iter().enumerate() {
        if a.nodes.contains_key(child.inside.as_deref().unwrap_or("")) {
            placed.push(i);
        } else if final_ {
            // Its container was left out above; a child alone would be drawn loose
            a.problems.push(problem(
                child.line,
                format!(
                    "\"{}\" is inside \"{}\", which was left out; left out",
                    child.element.id,
                    or_undefined(child.inside.as_deref())
                ),
            ));
        }
    }
    let placed_child = |a: &Assembly, element_id: &str| {
        placed
            .iter()
            .any(|&i| a.child_nodes[i].element.id == element_id)
    };

    let mut notes: Vec<CompactNote> = vec![];
    for note in &reader.notes {
        let present = a.nodes.contains_key(&note.element_id) || placed_child(&a, &note.element_id);
        if present && !note.text.is_empty() {
            notes.push(CompactNote {
                element_id: note.element_id.clone(),
                text: note.text.clone(),
            });
        } else if final_ {
            let message = if note.text.is_empty() {
                format!("note {}: has no text; ignored", note.written)
            } else {
                format!(
                    "note {}: names no node of the diagram; ignored",
                    note.written
                )
            };
            a.problems.push(problem(note.line, message));
        }
    }

    // Documentation goes on the element itself, a tool inside an ad-hoc sub-process included
    for doc in &reader.docs {
        // A placed child wins over a node of the same id, as `everyElement.set` does.
        let child = placed
            .iter()
            .copied()
            .rfind(|&i| a.child_nodes[i].element.id == doc.element_id);
        let element = match child {
            Some(i) => Some(&mut a.child_nodes[i].element),
            None => a.nodes.get_mut(&doc.element_id).map(|n| &mut n.element),
        };
        match element {
            Some(element) if !doc.text.is_empty() => {
                element.documentation = Some(doc.text.clone());
            }
            _ if final_ => {
                let message = if doc.text.is_empty() {
                    format!("doc {}: has no text; ignored", doc.written)
                } else {
                    format!("doc {}: names no node of the diagram; ignored", doc.written)
                };
                a.problems.push(problem(doc.line, message));
            }
            _ => {}
        }
    }

    // A `with` line configures a node of the diagram; one whose node was left out, or
    // never written, has nothing to configure.
    let mut connectors: Vec<ConnectorRef> = vec![];
    for r in &reader.connectors {
        // A tool inside an ad-hoc sub-process is a node too, though it is not in `nodes`
        if a.nodes.contains_key(&r.element_id) || placed_child(&a, &r.element_id) {
            connectors.push(r.clone());
        } else if final_ {
            a.problems.push(problem(
                r.connector.line,
                format!(
                    "\"with {}:\" names no node of the diagram; ignored",
                    r.connector.id
                ),
            ));
        }
    }

    for &i in &placed {
        let child = a.child_nodes[i].element.clone();
        let parent_id = a.child_nodes[i].inside.clone().unwrap_or_default();
        if let Some(parent) = a.nodes.get_mut(&parent_id) {
            parent
                .element
                .children
                .get_or_insert_with(CompactChildren::default)
                .elements
                .push(child);
        }
    }

    let mut problems = std::mem::take(&mut a.problems);
    problems.sort_by_key(|p| p.line);
    let mut asks = std::mem::take(&mut a.asks);
    asks.sort_by_key(|q| q.line);
    let questions = asks.iter().map(|q| (q.ask)(&a)).collect();

    ProcessTextResult {
        diagram: CompactDiagram {
            id: "Definitions_1".to_owned(),
            execution_platform_version: reader.platform_version.clone().filter(|v| !v.is_empty()),
            processes: vec![CompactProcess {
                id: process_id,
                name: title.map(str::to_owned),
                documentation: None,
                elements: a.nodes.values().map(|n| n.element.clone()).collect(),
                flows,
                notes: (!notes.is_empty()).then_some(notes),
            }],
        },
        problems,
        fixes: a.fixes,
        questions,
        connectors,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn node(id: &str, ty: BpmnElementType, name: &str) -> (String, Node) {
        let element = CompactElement {
            id: id.to_owned(),
            type_: ty.as_str().to_owned(),
            name: Some(name.to_owned()),
            ..CompactElement::default()
        };
        let node = Node {
            element,
            line: 1,
            spec: String::new(),
            on: None,
            inside: None,
        };
        (id.to_owned(), node)
    }

    fn edge(from: &str, to: &str) -> Edge {
        Edge {
            from: from.to_owned(),
            to: to.to_owned(),
            line: 1,
            ..Edge::default()
        }
    }

    // As TS's `parseProcessText("# My process\nt[service Work] > e[end Done]")`.
    #[test]
    fn a_missing_start_is_added_before_the_first_root() {
        use BpmnElementType as T;
        let mut reader = Reader::new();
        reader.title = Some("My process".into());
        reader.nodes = [
            node("t", T::ServiceTask, "Work"),
            node("e", T::EndEvent, "Done"),
        ]
        .into_iter()
        .collect();
        reader.edges = vec![edge("t", "e")];
        let result = assemble(&reader, true);
        let process = &result.diagram.processes[0];
        assert_eq!(process.id, "My_process");
        assert_eq!(process.name.as_deref(), Some("My process"));
        let ids: Vec<&str> = process.elements.iter().map(|e| e.id.as_str()).collect();
        assert_eq!(ids, ["t", "e", "start"]);
        assert_eq!(process.elements[0].job_type.as_deref(), Some("t"));
        let flows: Vec<(&str, &str, &str)> = process
            .flows
            .iter()
            .map(|f| (f.id.as_str(), f.from.as_str(), f.to.as_str()))
            .collect();
        assert_eq!(flows, [("Flow_1", "start", "t"), ("Flow_2", "t", "e")]);
        assert_eq!(result.fixes, ["added start event \"start\" before \"t\""]);
        assert!(result.problems.is_empty());
    }

    #[test]
    fn a_stream_frame_leaves_out_flows_to_undeclared_ids() {
        use BpmnElementType as T;
        let mut reader = Reader::new();
        reader.nodes = [node("s", T::StartEvent, "Go")].into_iter().collect();
        reader.edges = vec![edge("s", "later")];
        let result = assemble(&reader, false);
        let process = &result.diagram.processes[0];
        assert_eq!(process.id, "Process_1");
        assert!(process.flows.is_empty());
        assert!(result.problems.is_empty() && result.fixes.is_empty());
    }

    #[test]
    fn yes_and_no_read_as_words() {
        assert!(starts_with_word("Yes", "yes"));
        assert!(starts_with_word("YES: x", "yes"));
        assert!(!starts_with_word("Yesterday", "yes"));
        assert!(starts_with_word("no-go", "no"));
        assert!(!starts_with_word("né", "no"));
    }
}
