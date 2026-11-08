//! Port of `bpmn/process-text.ts` lines 457–888: the `Reader` class, which reads lines
//! into nodes, edges, notes, docs and `with` lines without judging the whole.
//!
//! Porter notes:
//! - `line()` trims with JS `trim()`; a carried line (one that ended in an arrow) is
//!   joined with a space to the next non-empty line; ```` ``` ```` and `//` lines are
//!   skipped; the first `#` line is the title (`camunda=` segments peeled off the end).
//! - `with` lines go through `connector_line::parse_connector_line`, and the element id is
//!   the node the written id means NOW (`current`), not at assembly.
//! - `declare()` keeps every node declared under a written id (`declared`), `current` maps
//!   a written id to its latest node, `taken` dedupes with `slug::unique_id`. Insertion
//!   order of `nodes` is the diagram's element order.
//! - `guessed_message` collects catch/boundary events written without a trigger.
//! - `assemble` reads (and mutates: it splices `edges`) these fields directly.

use std::sync::LazyLock;

use bpmnkit_bpmn::js::{is_js_space, js_trim};
use bpmnkit_bpmn::slug::unique_id;
use bpmnkit_bpmn::BpmnElementType;
use indexmap::{IndexMap, IndexSet};
use regex::Regex;

use super::tokens::{
    alias as alias_word, condition_or_label, dangles, duration, edge_label, is_event, is_feel,
    is_header_segment, item_of, kind as kind_word, match_doc_line, match_note_line, split_feel,
    split_mappings, strip_dangling, tokenize_path, type_from_id, Edge, EdgeLabel, Mapping,
    MappingDirection, Node, SplitMappings, ACTIVITIES, EVENTS, GATEWAYS, TIME_WORDS, TRIGGERS,
};
use super::{ConnectorRef, ProcessTextProblem};
use crate::compact::{CompactElement, CompactMultiInstance};
use crate::connector_line::{match_connector_line, parse_connector_line};
use crate::js_record::JsRecord;

/// JS `\s` as a regex class, for patterns compiled without Unicode mode.
macro_rules! js_s {
    () => {
        r"(?u:[\t\n\x0B\x0C\r \u{A0}\u{1680}\u{2000}-\u{200A}\u{2028}\u{2029}\u{202F}\u{205F}\u{3000}\u{FEFF}])"
    };
}

/// A `note` or `doc` line, with the written id resolved to the node it meant when read.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct WrittenNote {
    pub element_id: String,
    pub written: String,
    pub text: String,
    pub line: u32,
}

/// TS's `Reader`.
#[derive(Debug, Clone, Default)]
pub(crate) struct Reader {
    pub nodes: IndexMap<String, Node>,
    /// The node each written id means now.
    pub current: IndexMap<String, String>,
    /// Every node declared under each written id, oldest first.
    pub declared: IndexMap<String, Vec<String>>,
    pub taken: IndexSet<String>,
    pub edges: Vec<Edge>,
    pub problems: Vec<ProcessTextProblem>,
    pub fixes: Vec<String>,
    pub connectors: Vec<ConnectorRef>,
    pub notes: Vec<WrittenNote>,
    pub docs: Vec<WrittenNote>,
    pub guessed_message: IndexSet<String>,
    pub title: Option<String>,
    /// `executionPlatformVersion` from `# Name | camunda=8.10`.
    pub platform_version: Option<String>,
    /// A line that ended in an arrow, waiting for its continuation: `(text, line)`.
    pub carry: Option<(String, u32)>,
    /// The last node of the last path read.
    pub tail: Option<String>,
}

/// `s.split(/[\s,|]+/).filter(Boolean)`.
fn attr_words(s: &str) -> impl Iterator<Item = &str> {
    s.split(|c: char| is_js_space(c) || c == ',' || c == '|')
        .filter(|w| !w.is_empty())
}

/// `attr.split("=", 2)`: JS cuts the pieces off at the limit instead of keeping the rest,
/// so `a=b=c` is `a` and `b`.
fn key_value(attr: &str) -> (&str, Option<&str>) {
    let mut parts = attr.split('=');
    let key = parts.next().unwrap_or("");
    (key, parts.next())
}

/// `/^(\d+)\.(\d+)(?:\.(\d+))?$/` on `s`.
fn version_parts(s: &str) -> Option<(&str, &str, Option<&str>)> {
    let digits = |p: &str| !p.is_empty() && p.bytes().all(|b| b.is_ascii_digit());
    let mut parts = s.split('.');
    let major = parts.next()?;
    let minor = parts.next()?;
    let patch = parts.next();
    if parts.next().is_some()
        || !digits(major)
        || !digits(minor)
        || patch.is_some_and(|p| !digits(p))
    {
        return None;
    }
    Some((major, minor, patch))
}

/// The matches of `/\s+((?:on|job|each|after|result)=\S+|nonint)(?=\s|$)/g` as
/// `(start, end, group start)`.
fn loose_spans(s: &str) -> Vec<(usize, usize, usize)> {
    let alt = |s: &str| -> Option<usize> {
        for key in ["on=", "job=", "each=", "after=", "result="] {
            if let Some(rest) = s.strip_prefix(key) {
                let n = rest.find(is_js_space).unwrap_or(rest.len());
                return (n > 0).then_some(key.len() + n);
            }
        }
        let rest = s.strip_prefix("nonint")?;
        (rest.is_empty() || rest.starts_with(is_js_space)).then_some(6)
    };
    let mut out = vec![];
    let mut p = 0;
    while let Some(c) = s[p..].chars().next() {
        if is_js_space(c) {
            let q = s.len() - s[p..].trim_start_matches(is_js_space).len();
            if let Some(n) = alt(&s[q..]) {
                out.push((p, q + n, q));
                p = q + n;
                continue;
            }
        }
        p += c.len_utf8();
    }
    out
}

/// `label.toLowerCase().split(/\W+/).includes(trigger)`.
fn says(label: &str, trigger: &str) -> bool {
    let is_word = |c: char| c.is_ascii_alphanumeric() || c == '_';
    let lower = label.to_lowercase();
    if trigger.is_empty() {
        // Only the ends of a split on runs leave an empty piece.
        return lower.chars().next().is_some_and(|c| !is_word(c))
            || lower.chars().last().is_some_and(|c| !is_word(c));
    }
    lower
        .split(|c: char| !is_word(c))
        .any(|piece| piece == trigger)
}

fn is_type(element: &CompactElement, ty: BpmnElementType) -> bool {
    element.element_type() == Some(ty)
}

fn in_types(element: &CompactElement, set: &[BpmnElementType]) -> bool {
    element.element_type().is_some_and(|t| set.contains(&t))
}

fn set_type(element: &mut CompactElement, ty: BpmnElementType) {
    element.type_ = ty.as_str().to_owned();
}

fn with_equals(value: &str) -> String {
    if value.starts_with('=') {
        value.to_owned()
    } else {
        format!("={value}")
    }
}

static HOST_ATTR: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?-u)\b(?:on|inside)=([\w.-]+)").expect("HOST_ATTR"));

static CALL_NAME: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(concat!(
        r"(?i-u)^(?:(?:catch|throw|event)",
        js_s!(),
        r"+)?((?:send|post|publish|call|notify|invoke|push|upload|create|update|delete|run|trigger)\b",
        r"(?u:[^\n\r\u{2028}\u{2029}])*)$"
    ))
    .expect("CALL_NAME")
});

static PER_ITEM: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(concat!(
        r"(?i-u)\b(?:each|every)",
        js_s!(),
        r"+([a-z]{3,})\b"
    ))
    .expect("PER_ITEM")
});

impl Reader {
    pub fn new() -> Self {
        Self::default()
    }

    /// TS's private `header`: the attributes after the title's bar.
    fn header(&mut self, attrs: &str, n: u32) {
        for attr in attr_words(attrs) {
            let (key, value) = key_value(attr);
            let version = version_parts(value.unwrap_or(""));
            match (key, version) {
                ("camunda", Some((major, minor, patch))) => {
                    self.platform_version =
                        Some(format!("{major}.{minor}.{}", patch.unwrap_or("0")));
                }
                _ => self.problems.push(ProcessTextProblem {
                    line: n,
                    message: format!("unknown title attribute \"{attr}\"; ignored"),
                }),
            }
        }
    }

    /// TS's `line()`: reads one line; whether it added anything.
    pub fn line(&mut self, raw: &str, n: u32) -> bool {
        let mut text = js_trim(raw).to_owned();
        if let Some((carried, _)) = &self.carry {
            if text.is_empty() {
                return false;
            }
            text = format!("{carried} {text}");
            self.carry = None;
        }
        if text.is_empty() || text.starts_with("```") || text.starts_with("//") {
            return false;
        }
        if text.starts_with('#') {
            if self.title.is_none() {
                let parts: Vec<&str> = text.trim_start_matches('#').split('|').collect();
                // Peel segments off the end while they are all `camunda=…`; anything else is
                // part of the name (`# Order | Payment flow`).
                let mut keep = parts.len();
                while keep > 1 && is_header_segment(parts[keep - 1]) {
                    keep -= 1;
                }
                let title = js_trim(&parts[..keep].join("|")).to_owned();
                self.title = (!title.is_empty()).then_some(title);
                let attrs = parts[keep..].join("|");
                self.header(&attrs, n);
            }
            return false;
        }
        if match_connector_line(&text).is_some() {
            if let Some(connector) = parse_connector_line(&text, n, &mut self.problems) {
                let element_id = self
                    .current
                    .get(&connector.id)
                    .cloned()
                    .unwrap_or_else(|| connector.id.clone());
                self.connectors.push(ConnectorRef {
                    connector,
                    element_id,
                });
            }
            return false;
        }
        if let Some((written, body)) = match_note_line(&text) {
            let note = self.written_note(written, body, n);
            self.notes.push(note);
            return true;
        }
        if let Some((written, body)) = match_doc_line(&text) {
            let doc = self.written_note(written, body, n);
            self.docs.push(doc);
            return true;
        }
        // `> stop[end Done]`: the path above wrapped before its arrow
        if let Some(tail) = self.tail.as_ref().filter(|_| arrow_start(&text)) {
            self.problems.push(ProcessTextProblem {
                line: n,
                message: format!("the line starts with \">\"; read it as continuing \"{tail}\""),
            });
            text = format!("{tail} {text}");
        }
        // `engineer[user Fix issue] >` then the next step on the next line: models
        // wrap a long path. The line is read once it is complete.
        if dangles(&text) {
            self.carry = Some((text, n));
            return false;
        }
        self.read(&text, n)
    }

    fn written_note(&self, written: &str, body: &str, n: u32) -> WrittenNote {
        WrittenNote {
            element_id: self
                .current
                .get(written)
                .cloned()
                .unwrap_or_else(|| written.to_owned()),
            written: written.to_owned(),
            text: js_trim(body).to_owned(),
            line: n,
        }
    }

    /// TS's `finish()`: reads a line still waiting for its continuation.
    pub fn finish(&mut self) -> bool {
        let Some((text, line)) = self.carry.take() else {
            return false;
        };
        self.problems.push(ProcessTextProblem {
            line,
            message: "the line ends with \">\" and nothing follows; read without it".to_owned(),
        });
        self.read(&strip_dangling(&text), line)
    }

    /// TS's private `read`: one complete path line.
    fn read(&mut self, text: &str, n: u32) -> bool {
        // Parse the whole line before keeping any of it, so a line that fails half
        // way leaves nothing behind.
        let path = match tokenize_path(text) {
            Ok(path) => path,
            Err(message) => return self.fail(n, message),
        };
        let mut note = |message: String| {
            self.problems.push(ProcessTextProblem { line: n, message });
        };
        if let Some(text) = &path.note {
            note(format!("ignored the note \"{text}\""));
        }
        for id in &path.bracketless {
            note(format!(
                "\"{id} …\" has no brackets; read it as declaring \"{id}\""
            ));
        }
        for id in &path.unclosed {
            note(format!(
                "\"{id}[\" is not closed; closed it where its name ends"
            ));
        }
        for joined in &path.joined {
            note(format!(
                "\"{}\" is not an id; read as \"{}\"",
                joined.written, joined.id
            ));
        }

        // Declarations and references resolve left to right, so a chain that
        // reuses an id (`task[A] > task[B]`) links the nodes in the order written.
        let mut ids: Vec<String> = Vec::with_capacity(path.refs.len());
        for (k, reference) in path.refs.iter().enumerate() {
            let id = match &reference.spec {
                Some(spec) => self.declare(&reference.id, spec, n, k > 0),
                None => self
                    .current
                    .get(&reference.id)
                    .cloned()
                    .unwrap_or_else(|| reference.id.clone()),
            };
            ids.push(id);
        }
        for (k, label) in path.labels.iter().enumerate() {
            if let (Some(from), Some(to)) = (ids.get(k), ids.get(k + 1)) {
                let label = self.feel_or_label(edge_label(label.as_deref()), n);
                self.edges.push(Edge {
                    from: from.clone(),
                    to: to.clone(),
                    name: label.name,
                    condition: label.condition,
                    is_default: label.is_default,
                    line: n,
                });
            }
        }
        self.tail = ids.last().cloned();
        true
    }

    /// TS's private `feelOrLabel`.
    fn feel_or_label(&mut self, edge: EdgeLabel, n: u32) -> EdgeLabel {
        let (kept, problem) = condition_or_label(edge);
        if let Some(message) = problem {
            self.problems.push(ProcessTextProblem { line: n, message });
        }
        kept
    }

    /// TS's private `fail`: records the problem, returns false.
    fn fail(&mut self, n: u32, message: String) -> bool {
        self.problems.push(ProcessTextProblem { line: n, message });
        false
    }

    fn problem(&mut self, n: u32, message: String) {
        self.problems.push(ProcessTextProblem { line: n, message });
    }

    /// TS's private `declare`: declares a node, returns the id it was stored under.
    ///
    /// `after_arrow`: whether it follows a `>` on its line. A reused id there is the next
    /// step of a path (`check > done[end Rejected]`); at the start of a line it is the model
    /// revising a node it has already written.
    fn declare(&mut self, written: &str, spec: &str, n: u32, after_arrow: bool) -> String {
        let before: Vec<String> = self.declared.get(written).cloned().unwrap_or_default();
        // Restating a node is harmless; the same id for something else is a new node.
        let spec_lower = spec.to_lowercase();
        let same = before
            .iter()
            .find(|id| {
                self.nodes
                    .get(*id)
                    .is_some_and(|node| node.spec.to_lowercase() == spec_lower)
            })
            .cloned();
        if let Some(same) = same {
            self.current.insert(written.to_owned(), same.clone());
            return same;
        }
        let earlier_id = before.last().cloned();
        let earlier_line = earlier_id
            .as_ref()
            .and_then(|id| self.nodes.get(id))
            .map(|node| node.line);
        if let (Some(earlier_id), Some(earlier_line)) = (&earlier_id, earlier_line) {
            // Only a real kind after an arrow, or a boundary, makes a second node.
            // `and[kind and]` or `ord[id=ord kind=start]` annotate the node already
            // there, and `validate[xor …] > …` restarts from it.
            let first = spec
                .split(|c: char| is_js_space(c) || c == '|')
                .next()
                .unwrap_or("")
                .to_lowercase();
            let word = first.split(':').next().unwrap_or("");
            let kind = kind_word(word).or_else(|| alias_word(word));
            // A boundary is always new: it cannot be a revision of the task it sits on.
            // `send[…] > send[post Slack message to #support]`: a name of several words
            // after an arrow is a second node, whatever its kind word
            let named = after_arrow
                && !spec.contains('=')
                && js_trim(spec)
                    .split(is_js_space)
                    .filter(|w| !w.is_empty())
                    .count()
                    >= 3;
            if (kind.is_none() && !named)
                || (!after_arrow && kind != Some(BpmnElementType::BoundaryEvent))
            {
                self.problem(
                    n,
                    format!(
                        "\"{written}\" is already declared on line {earlier_line}; ignored \"{spec}\""
                    ),
                );
                return earlier_id.clone();
            }
        }
        // Read before the id is remapped: in `pay[boundary:error … | on=pay]` the
        // host is the earlier `pay`.
        let mut host_of: IndexMap<String, String> = IndexMap::new();
        for caps in HOST_ATTR.captures_iter(spec) {
            if let Some(m) = caps.get(1) {
                let meant = self
                    .current
                    .get(m.as_str())
                    .cloned()
                    .unwrap_or_else(|| m.as_str().to_owned());
                host_of.insert(m.as_str().to_owned(), meant);
            }
        }
        let id = unique_id(written, &mut self.taken);
        self.current.insert(written.to_owned(), id.clone());
        let mut declared = before;
        declared.push(id.clone());
        self.declared.insert(written.to_owned(), declared);
        if let Some(earlier_line) = earlier_line {
            self.problem(
                n,
                format!(
                    "\"{written}\" on line {earlier_line} is a different node; this one is \"{id}\""
                ),
            );
        }
        let bar = spec.find('|');
        // `boundary:timer on=poll`: an attribute written before the bar is one still
        let before_bar = bar.map_or(spec, |b| &spec[..b]);
        let spans = loose_spans(before_bar);
        let mut head_text = String::new();
        let mut last = 0;
        for &(start, end, _) in &spans {
            head_text.push_str(&before_bar[last..start]);
            last = end;
        }
        head_text.push_str(&before_bar[last..]);
        let head = js_trim(&head_text);
        let loose: Vec<&str> = spans
            .iter()
            .map(|&(_, end, group)| &before_bar[group..end])
            .collect();
        let attrs = loose.join(" ")
            + &match bar {
                Some(b) => format!(" {}", &spec[b + 1..]),
                None => String::new(),
            };
        let space = head.find(is_js_space);
        let kind_text = space.map_or(head, |s| &head[..s]);
        let name = space
            .map(|s| {
                let c = head[s..].chars().next().map_or(0, char::len_utf8);
                js_trim(&head[s + c..])
            })
            .filter(|name| !name.is_empty())
            .map(str::to_owned);
        let kind_lower = kind_text.to_lowercase();
        let mut pieces = kind_lower.split(':');
        let kind = pieces.next().unwrap_or("");
        let trigger = pieces.next();

        let mut label = name;
        let ty = match kind_word(kind).or_else(|| alias_word(kind)) {
            Some(ty) => ty,
            None => {
                // Most often the kind was left out (`start[Order placed]`): the whole
                // head is the name, and the id is the best remaining hint at the type.
                let guessed = type_from_id(&id);
                label = (!head.is_empty()).then(|| head.to_owned());
                self.problem(
                    n,
                    format!(
                        "unknown kind \"{kind}\" for \"{id}\"; used {}",
                        guessed.as_str()
                    ),
                );
                guessed
            }
        };
        let mut element = CompactElement {
            id: id.clone(),
            type_: ty.as_str().to_owned(),
            ..CompactElement::default()
        };
        if let Some(trigger) = trigger {
            if !is_event(ty) {
                self.problem(
                    n,
                    format!("\"{kind}\" takes no trigger; ignored \":{trigger}\""),
                );
            } else if !TRIGGERS.contains(&trigger) {
                // `start:order received` — a name written where the trigger goes. When the
                // name already says it (`start:kyc Start KYC`), the word is only noise.
                let word = &kind_text[kind_text.find(':').map_or(0, |c| c + 1)..];
                let said = label.as_deref().is_some_and(|l| says(l, trigger));
                if !said {
                    let parts: Vec<&str> = [Some(word), label.as_deref()]
                        .into_iter()
                        .flatten()
                        .filter(|p| !p.is_empty())
                        .collect();
                    label = Some(parts.join(" "));
                }
                self.problem(
                    n,
                    format!(
                        "unknown trigger \"{trigger}\" for \"{id}\"; {}",
                        if said {
                            "ignored, the name already says it"
                        } else {
                            "read as part of the name"
                        }
                    ),
                );
            } else if trigger == "link" {
                // A link event needs a link name and a partner, which this format cannot
                // write; in a path a model means a milestone by it.
                if ty == BpmnElementType::IntermediateCatchEvent {
                    set_type(&mut element, BpmnElementType::IntermediateThrowEvent);
                }
                self.problem(
                    n,
                    format!("\"{id}\" cannot be a link event here; made it a plain event"),
                );
            } else {
                element.event_type = Some(trigger.to_owned());
            }
        }
        if let Some(label) = label.as_deref().filter(|l| !l.is_empty()) {
            element.name = Some(label.to_owned());
        }
        // A catch or boundary event waits for something, and cannot deploy without
        // saying what. Unnamed, it is most often a message: "Payment confirmed".
        // `queue[event catch Send to SQS]` is named for a call it makes, not for what it waits
        // for: it is a service task, as every call to an outside system is
        let call = if is_type(&element, BpmnElementType::IntermediateCatchEvent)
            && element.event_type.is_none()
        {
            CALL_NAME
                .captures(label.as_deref().unwrap_or(""))
                .and_then(|c| c.get(1))
                .map(|m| m.as_str().to_owned())
        } else {
            None
        };
        if let Some(call) = call {
            set_type(&mut element, BpmnElementType::ServiceTask);
            self.problem(
                n,
                format!(
                    "\"{id}\" is named for a call it makes, \"{call}\"; made it a service task"
                ),
            );
            element.name = Some(call);
        } else if in_types(
            &element,
            &[
                BpmnElementType::IntermediateCatchEvent,
                BpmnElementType::BoundaryEvent,
            ],
        ) && element.event_type.is_none()
        {
            element.event_type = Some("message".to_owned());
            self.guessed_message.insert(id.clone());
            self.problem(
                n,
                format!("\"{id}\" waits for nothing in particular; made it a message event"),
            );
        }

        let mut node = Node {
            element,
            line: n,
            spec: spec.to_owned(),
            on: None,
            inside: None,
        };
        let split = split_feel(&attrs);
        let feel = split.feel;
        let SplitMappings { plain, mappings } = split_mappings(&split.plain);
        for Mapping {
            direction,
            target,
            value,
        } in mappings
        {
            let source = with_equals(&value);
            let dir = match direction {
                MappingDirection::In => "in",
                MappingDirection::Out => "out",
            };
            if value.is_empty() || !is_feel(&source[1..]) {
                self.problem(
                    n,
                    format!(
                        "{dir}.{target}= on \"{id}\" is not FEEL; kept for the reader to correct"
                    ),
                );
            }
            let record = match direction {
                MappingDirection::In => &mut node.element.inputs,
                MappingDirection::Out => &mut node.element.outputs,
            };
            record
                .get_or_insert_with(JsRecord::new)
                .insert(target, source);
        }
        let host_id = |value: &str| {
            host_of
                .get(value)
                .cloned()
                .unwrap_or_else(|| value.to_owned())
        };
        // `| on=pay | nonint`: a second bar is only another separator.
        for attr in attr_words(&plain) {
            let (key, raw) = key_value(attr);
            // `value` in TS: an empty one is falsy, but only a missing one is `undefined`.
            let value = raw.filter(|v| !v.is_empty());
            let element = &mut node.element;
            match (key, value) {
                ("on", Some(v)) => node.on = Some(host_id(v)),
                ("inside", Some(v)) => node.inside = Some(host_id(v)),
                ("job", Some(v)) => element.job_type = Some(v.to_owned()),
                ("nonint", _) if raw.is_none() => element.interrupting = Some(false),
                ("form", Some(v))
                    if in_types(
                        element,
                        &[BpmnElementType::StartEvent, BpmnElementType::UserTask],
                    ) =>
                {
                    element.form_id = Some(v.to_owned());
                    if is_type(element, BpmnElementType::UserTask) {
                        element.native_user_task = Some(true);
                    }
                }
                ("form", Some(_)) => self.problems.push(ProcessTextProblem {
                    line: n,
                    message: format!("form= takes a start or user node; ignored on \"{id}\""),
                }),
                ("each", Some(v))
                    if in_types(element, &GATEWAYS)
                        && element.name.as_deref().is_some_and(|name| !name.is_empty()) =>
                {
                    // `and[and Process every recipient | each=recipients]`: a step, run per item
                    self.problems.push(ProcessTextProblem {
                        line: n,
                        message: format!(
                            "\"{id}\" is a gateway with each=, named like a step; made it a task run per item"
                        ),
                    });
                    set_type(element, BpmnElementType::Task);
                    element.multi_instance = Some(CompactMultiInstance {
                        collection: with_equals(v),
                        element: Some(item_of(v.strip_prefix('=').unwrap_or(v))),
                        ..CompactMultiInstance::default()
                    });
                }
                ("each", Some(v)) if in_types(element, &ACTIVITIES) => {
                    element.multi_instance = Some(CompactMultiInstance {
                        collection: with_equals(v),
                        element: Some(item_of(v.strip_prefix('=').unwrap_or(v))),
                        ..CompactMultiInstance::default()
                    });
                }
                ("after", Some(v)) if in_types(element, &EVENTS) && duration(v).is_some() => {
                    // `delay[boundary:error Timeout | after=P1D]`: only a timer waits for a time
                    if element.event_type.as_deref() != Some("timer")
                        && !is_type(element, BpmnElementType::EndEvent)
                    {
                        self.problems.push(ProcessTextProblem {
                            line: n,
                            message: format!(
                                "\"{id}\" waits {v}, which only a timer does; made it a timer event"
                            ),
                        });
                        element.event_type = Some("timer".to_owned());
                    }
                    element.timer_duration = duration(v);
                }
                ("result", Some(v)) if in_types(element, &ACTIVITIES) => {
                    element.result_variable = Some(v.to_owned());
                }
                _ => self.problems.push(ProcessTextProblem {
                    line: n,
                    message: format!("unknown attribute \"{attr}\" on \"{id}\"; ignored"),
                }),
            }
        }
        let element = &mut node.element;
        if let Some(feel) = feel {
            // `calc[task Count open issues | feel=…]`: a step that evaluates FEEL is a script task
            if is_type(element, BpmnElementType::Task) {
                set_type(element, BpmnElementType::ScriptTask);
            }
            if in_types(element, &EVENTS) && element.event_type.as_deref() == Some("conditional") {
                // `ready[catch:conditional | feel=stock > 0]`: the condition it waits for
                if !is_feel(&feel[1..]) {
                    self.problems.push(ProcessTextProblem {
                        line: n,
                        message: format!(
                            "feel= on \"{id}\" is not FEEL; kept for the reader to correct"
                        ),
                    });
                }
                element.condition = Some(feel);
            } else if is_type(element, BpmnElementType::ScriptTask) {
                if element.result_variable.is_none() {
                    element.result_variable = Some(id.clone());
                }
                if !is_feel(&feel[1..]) {
                    self.problems.push(ProcessTextProblem {
                        line: n,
                        message: format!(
                            "feel= on \"{id}\" is not FEEL; kept for the reader to correct"
                        ),
                    });
                }
                element.script = Some(feel);
            } else {
                self.problems.push(ProcessTextProblem {
                    line: n,
                    message: format!("only a script task evaluates feel=; ignored on \"{id}\""),
                });
            }
        }
        // `late[catch:timer | on=poll after=PT5M]`: an event on a task is a boundary event
        let host_is_activity = node
            .on
            .as_ref()
            .and_then(|on| self.nodes.get(on))
            .is_some_and(|host| in_types(&host.element, &ACTIVITIES));
        if host_is_activity && is_type(&node.element, BpmnElementType::IntermediateCatchEvent) {
            set_type(&mut node.element, BpmnElementType::BoundaryEvent);
            self.problems.push(ProcessTextProblem {
                line: n,
                message: format!(
                    "\"{id}\" is a catch event on \"{}\"; made it a boundary event",
                    node.on.as_deref().unwrap_or("")
                ),
            });
        }
        let element = &mut node.element;
        // "Send email to each stakeholder": a step its name says is done per item runs once
        // per item of the list of them, whose variable only the reader can name for sure
        let per = PER_ITEM
            .captures(label.as_deref().unwrap_or(""))
            .and_then(|c| c.get(1))
            .map(|m| m.as_str().to_lowercase());
        if let Some(per) = per {
            if !TIME_WORDS.contains(&per.as_str())
                && in_types(element, &ACTIVITIES)
                && element.multi_instance.is_none()
            {
                let list = if per.ends_with('y')
                    && !per
                        .chars()
                        .rev()
                        .nth(1)
                        .is_some_and(|c| matches!(c, 'a' | 'e' | 'i' | 'o' | 'u'))
                {
                    format!("{}ies", &per[..per.len() - 1])
                } else {
                    format!("{per}s")
                };
                element.multi_instance = Some(CompactMultiInstance {
                    collection: format!("={list}"),
                    element: Some(per.clone()),
                    ..CompactMultiInstance::default()
                });
                self.fixes.push(format!(
                    "\"{id}\" runs once per {per}, over the list \"{list}\""
                ));
            }
        }
        // `late[boundary:timer 5 minutes | on=poll]`: a timer's name says how long it waits
        if element.event_type.as_deref() == Some("timer") && element.timer_duration.is_none() {
            if let Some(said) = label
                .as_deref()
                .filter(|l| !l.is_empty())
                .and_then(duration)
            {
                element.timer_duration = Some(said);
            }
        }
        self.nodes.insert(id.clone(), node);
        id
    }
}

/// `/^-{0,2}>/.test(text)`.
fn arrow_start(text: &str) -> bool {
    let dashes = text.bytes().take_while(|&b| b == b'-').count();
    dashes <= 2 && text.as_bytes().get(dashes) == Some(&b'>')
}

#[cfg(test)]
mod tests {
    //! The reader's state after reading lines, against `tests/oracle/pt_reader.json`
    //! (dumped from TS's `Reader` by `pt_reader.mjs`).

    use serde_json::{json, Value};

    use super::*;

    fn opt(v: &Option<String>) -> Value {
        v.as_ref().map_or(Value::Null, |s| json!(s))
    }

    fn entries(record: &Option<JsRecord>) -> Value {
        record.as_ref().map_or(Value::Null, |r| {
            json!(r
                .entries()
                .into_iter()
                .map(|(k, v)| json!([k, v]))
                .collect::<Vec<_>>())
        })
    }

    fn note(n: &WrittenNote) -> Value {
        json!({"elementId": n.element_id, "written": n.written, "text": n.text, "line": n.line})
    }

    fn state(r: &Reader) -> Value {
        json!({
            "nodes": r.nodes.iter().map(|(id, node)| json!({
                "id": id,
                "element": serde_json::to_value(&node.element).unwrap(),
                "inputs": entries(&node.element.inputs),
                "outputs": entries(&node.element.outputs),
                "line": node.line,
                "spec": node.spec,
                "on": opt(&node.on),
                "inside": opt(&node.inside),
            })).collect::<Vec<_>>(),
            "current": r.current.iter().map(|(k, v)| json!([k, v])).collect::<Vec<_>>(),
            "declared": r.declared.iter().map(|(k, v)| json!([k, v])).collect::<Vec<_>>(),
            "taken": r.taken.iter().collect::<Vec<_>>(),
            "edges": r.edges.iter().map(|e| json!({
                "from": e.from, "to": e.to, "name": opt(&e.name),
                "condition": opt(&e.condition), "isDefault": e.is_default, "line": e.line,
            })).collect::<Vec<_>>(),
            "problems": serde_json::to_value(&r.problems).unwrap(),
            "fixes": r.fixes,
            "connectors": serde_json::to_value(&r.connectors).unwrap(),
            "notes": r.notes.iter().map(note).collect::<Vec<_>>(),
            "docs": r.docs.iter().map(note).collect::<Vec<_>>(),
            "guessedMessage": r.guessed_message.iter().collect::<Vec<_>>(),
            "title": opt(&r.title),
            "platformVersion": opt(&r.platform_version),
            "carry": r.carry.as_ref().map_or(Value::Null, |(t, n)| json!([t, n])),
            "tail": opt(&r.tail),
        })
    }

    fn oracle() -> Value {
        serde_json::from_str(include_str!("../../tests/oracle/pt_reader.json")).expect("oracle")
    }

    /// `Object.prototype` member names are unknown kinds, not kinds (TS reads own keys too).
    #[test]
    fn prototype_kind_words_are_unknown_kinds() {
        let mut reader = Reader::new();
        reader.line("a[constructor X] > b[__proto__ Y] > c[toString Z]", 1);
        for id in ["a", "b", "c"] {
            assert_eq!(
                reader.nodes[id].element.element_type(),
                Some(BpmnElementType::Task)
            );
        }
        assert!(reader
            .problems
            .iter()
            .any(|p| p.message == "unknown kind \"constructor\" for \"a\"; used task"));
    }

    /// `feel=` on a conditional event is its condition, not an ignored script.
    #[test]
    fn conditional_event_feel_is_its_condition() {
        let mut reader = Reader::new();
        reader.line("w[catch:conditional Ready | feel=stock > 0]", 1);
        assert_eq!(
            reader.nodes["w"].element.condition.as_deref(),
            Some("= stock > 0")
        );
        assert!(reader.problems.is_empty(), "{:?}", reader.problems);
    }

    #[test]
    fn reader_state_matches_ts() {
        let all = oracle();
        let cases = all["cases"].as_array().unwrap().clone();
        assert!(cases.len() > 400);
        for case in cases {
            let lines: Vec<&str> = case["lines"]
                .as_array()
                .unwrap()
                .iter()
                .map(|l| l.as_str().unwrap())
                .collect();
            let mut reader = Reader::new();
            let mut returns = vec![];
            for (k, line) in lines.iter().enumerate() {
                returns.push(reader.line(line, k as u32 + 1));
            }
            let finished = case["finished"].as_bool().map(|_| reader.finish());
            let ctx = format!("{lines:?}");
            assert_eq!(json!(returns), case["returns"], "returns of {ctx}");
            assert_eq!(finished, case["finished"].as_bool(), "finish of {ctx}");
            let (got, want) = (state(&reader), &case["state"]);
            for key in want.as_object().unwrap().keys() {
                assert_eq!(&got[key], &want[key], "{key} of {ctx}");
            }
        }
    }
}
