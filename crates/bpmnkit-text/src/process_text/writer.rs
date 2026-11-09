//! Port of `bpmn/process-text-writer.ts`: writes the primary process of a model in the line
//! format, under short aliases, for a model to read and answer with a change script. Its
//! leaf lanes, the other pools of its collaboration (as black boxes) and the message flows
//! between one of its nodes and such a pool are written too.
//!
//! Porter notes:
//! - Output text must match TS byte for byte.
//! - `KIND_WORDS` is `new Map([...Object.entries(KINDS), ...Object.entries(FIXED_KINDS)]
//!   .map(([word, type]) => [type, word]))`: type → word, a later entry for the same type
//!   wins but keeps the first one's position (`tokens::KINDS`, `catalog::FIXED_KINDS`).
//! - `READABLE_ID` is `/^[a-z][a-z0-9_]{0,23}$/`; `ALIAS_WORDS` is 4.
//! - `writableMapping` JSON-quotes a literal with `JSON.stringify` (escape `"`, `\`,
//!   control characters as `\n`, `\u001f`, …; non-ASCII kept), FEEL loses its leading `=`.
//! - `platformVersion` needs `modeler:executionPlatform` containing "cloud"
//!   (case-insensitive) and the major.minor of `modeler:executionPlatformVersion`.
//! - The `connector_line` callback gets the full flow element (looked up by id in the
//!   written process) and the definitions.

use std::collections::{HashSet, VecDeque};

use bpmnkit_bpmn::swimlanes::{leaf_lanes, primary_process};
use bpmnkit_bpmn::{BpmnDefinitions, BpmnElementType, BpmnFlowElement, BpmnProcess};
use indexmap::{IndexMap, IndexSet};
use serde::{Deserialize, Serialize};

use super::tokens::{cycle, duration, split_mappings, KINDS};
use crate::catalog::FIXED_KINDS;
use crate::compact::{compactify, CompactElement, CompactFlow};
use crate::js_record::JsRecord;

/// Writes one element's connector as the text after `with <id>: `, or `None`.
pub type ConnectorLineFn<'a> = &'a dyn Fn(&BpmnFlowElement, &BpmnDefinitions) -> Option<String>;

/// TS's `WriteProcessTextOptions`.
#[derive(Clone, Copy, Default)]
pub struct WriteProcessTextOptions<'a> {
    /// TS's `connectorLine`; without it no `with` lines are written.
    pub connector_line: Option<ConnectorLineFn<'a>>,
}

impl std::fmt::Debug for WriteProcessTextOptions<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("WriteProcessTextOptions")
            .field("connector_line", &self.connector_line.is_some())
            .finish()
    }
}

/// TS's `WrittenProcessText`.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct WrittenProcessText {
    /// The diagram in the line format.
    pub text: String,
    /// Every written id → the element id it stands for.
    pub aliases: JsRecord,
}

/// Longest alias derived from a name, in words.
const ALIAS_WORDS: usize = 4;

/// JS `\s`.
fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

/// `s.replace(/\s+/g, " ")`.
fn collapse_spaces(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_run = false;
    for c in s.chars() {
        if is_js_space(c) {
            if !in_run {
                out.push(' ');
            }
            in_run = true;
        } else {
            out.push(c);
            in_run = false;
        }
    }
    out
}

/// `s.replace(/\s+/g, " ").trim()`.
fn squash(s: &str) -> String {
    collapse_spaces(s).trim_matches(is_js_space).to_owned()
}

/// `KIND_WORDS.get(type)`: the later entry for a type wins.
fn kind_word(type_: &str) -> Option<&'static str> {
    let by = |t: BpmnElementType| t.as_str() == type_;
    FIXED_KINDS
        .iter()
        .rev()
        .find(|(_, t)| by(*t))
        .or_else(|| KINDS.iter().rev().find(|(_, t)| by(*t)))
        .map(|(w, _)| *w)
}

/// `READABLE_ID.test(id)`: `/^[a-z][a-z0-9_]{0,23}$/`.
fn is_readable_id(id: &str) -> bool {
    let mut chars = id.chars();
    matches!(chars.next(), Some('a'..='z'))
        && id.len() <= 24
        && chars.all(|c| matches!(c, 'a'..='z' | '0'..='9' | '_'))
}

/// `JSON.stringify(string)`.
fn json_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\u{8}' => out.push_str("\\b"),
            '\u{c}' => out.push_str("\\f"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

/// TS's `writableName`: a name as it can be written inside brackets.
pub fn writable_name(name: &str) -> String {
    let replaced: String = name
        .chars()
        .map(|c| match c {
            '[' => '(',
            ']' => ')',
            '|' => '/',
            c => c,
        })
        .collect();
    squash(&replaced)
}

/// TS's `writableLabel`: a flow name as it can be written in an arrow label.
pub fn writable_label(name: &str) -> String {
    let replaced: String = name
        .chars()
        .map(|c| if matches!(c, '(' | ')' | ':') { ' ' } else { c })
        .collect();
    squash(&replaced)
}

/// TS's `writableCondition`: a FEEL condition without its leading `=`, on one line.
pub fn writable_condition(condition: &str) -> String {
    // /^\s*=/
    let trimmed = condition.trim_start_matches(is_js_space);
    let rest = trimmed.strip_prefix('=').unwrap_or(condition);
    squash(rest)
}

/// TS's `writableMapping`.
fn writable_mapping(source: &str) -> String {
    let Some(rest) = source.strip_prefix('=') else {
        return json_string(source);
    };
    squash(rest.trim_start_matches(is_js_space))
}

/// TS's `platformVersion`.
fn platform_version(definitions: &BpmnDefinitions) -> Option<String> {
    let platform = definitions
        .unknown_attributes
        .get("modeler:executionPlatform")?;
    if !platform.to_lowercase().contains("cloud") {
        return None;
    }
    let version = definitions
        .unknown_attributes
        .get("modeler:executionPlatformVersion")
        .map_or("", String::as_str)
        .trim_start_matches(is_js_space);
    // /^\s*(\d+\.\d+)/
    let digits = |s: &str| s.bytes().take_while(u8::is_ascii_digit).count();
    let major = digits(version);
    if major == 0 || version.as_bytes().get(major) != Some(&b'.') {
        return None;
    }
    let minor = digits(&version[major + 1..]);
    if minor == 0 {
        return None;
    }
    Some(version[..major + 1 + minor].to_owned())
}

/// TS's `aliasFor`: the id when readable and free, else derived from `name`, else from
/// `kind`.
fn alias_for(id: &str, name: Option<&str>, kind: &str, taken: &mut IndexSet<String>) -> String {
    if is_readable_id(id) && !taken.contains(id) {
        taken.insert(id.to_owned());
        return id.to_owned();
    }
    // .replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/)
    let name = name.unwrap_or("");
    let mut spaced = String::with_capacity(name.len() + 4);
    let mut prev: Option<char> = None;
    for c in name.chars() {
        if c.is_ascii_uppercase()
            && prev.is_some_and(|p| p.is_ascii_lowercase() || p.is_ascii_digit())
        {
            spaced.push(' ');
        }
        spaced.push(c);
        prev = Some(c);
    }
    let lower = spaced.to_lowercase();
    let words: Vec<&str> = lower
        .split(|c: char| !matches!(c, 'a'..='z' | '0'..='9'))
        .filter(|w| !w.is_empty())
        .take(ALIAS_WORDS)
        .collect();
    let mut base = words.join("_");
    if !base.starts_with(|c: char| c.is_ascii_lowercase()) {
        base = if base.is_empty() {
            kind.to_owned()
        } else {
            format!("{kind}_{base}")
        };
    }
    let mut alias = base.clone();
    let mut n = 2;
    while taken.contains(&alias) {
        alias = format!("{base}_{n}");
        n += 1;
    }
    taken.insert(alias.clone());
    alias
}

/// The alias of a written node, from its kind word.
fn node_alias(el: &CompactElement, taken: &mut IndexSet<String>) -> String {
    alias_for(
        &el.id,
        el.name.as_deref(),
        kind_word(&el.type_).unwrap_or("node"),
        taken,
    )
}

/// TS's `bracketed`: `[Name]`, or `[]` for no name: the reader names a lane without a
/// bracket after its id.
fn bracketed(name: Option<&str>) -> String {
    format!(
        "[{}]",
        name.filter(|n| !n.is_empty())
            .map_or_else(String::new, writable_name)
    )
}

/// TS's `writableMessageLabel`: a message label as a `msg` line writes it: raw like a note,
/// so colons stay, but a parenthesis would end it.
pub fn writable_message_label(name: &str) -> String {
    let replaced: String = name
        .chars()
        .map(|c| if matches!(c, '(' | ')') { ' ' } else { c })
        .collect();
    squash(&replaced)
}

/// TS's `swimlaneLines`: the `lane`, `pool` and `msg` lines of `source`, whose written
/// top-level nodes are `nodes`. Lane and pool aliases are claimed here, after every node
/// alias, so a diagram that gains a lane keeps the node aliases it had.
///
/// Only leaf lanes are written, each with the nodes it lists in ref order (a node two
/// leaves list goes to the first). Every other participant of the collaboration holding
/// `source`'s pool (else the first collaboration) is a `pool` line. A message is written
/// only between a node of `nodes` and such a pool.
fn swimlane_lines(
    definitions: &BpmnDefinitions,
    source: &BpmnProcess,
    nodes: &IndexMap<&str, &CompactElement>,
    alias: &mut IndexMap<String, String>,
    taken: &mut IndexSet<String>,
) -> Vec<String> {
    let collaboration = definitions
        .collaborations
        .iter()
        .find(|c| {
            c.participants
                .iter()
                .any(|p| p.process_ref.as_deref() == Some(source.id.as_str()))
        })
        .or(definitions.collaborations.first());
    let leaves = leaf_lanes(source.lane_set.as_ref());
    // A node two leaves list is written in the first only, or the reader would move it.
    let mut placed: HashSet<&str> = HashSet::new();
    let mut members_of: IndexMap<&str, Vec<&str>> = IndexMap::new();
    for lane in &leaves {
        let unique: IndexSet<&str> = lane.flow_node_refs.iter().map(String::as_str).collect();
        let members: Vec<&str> = unique
            .into_iter()
            .filter(|id| nodes.contains_key(id) && !placed.contains(id))
            .collect();
        placed.extend(members.iter().copied());
        members_of.insert(&lane.id, members);
    }
    // An unnamed lane holding nothing has nothing to say, and `lane x:` reads as prose.
    let lanes: Vec<_> = leaves
        .into_iter()
        .filter(|lane| {
            lane.name.as_deref().is_some_and(|n| !n.is_empty())
                || members_of
                    .get(lane.id.as_str())
                    .is_some_and(|m| !m.is_empty())
        })
        .collect();
    let pools: Vec<_> = collaboration
        .into_iter()
        .flat_map(|c| &c.participants)
        .filter(|p| p.process_ref.as_deref() != Some(source.id.as_str()))
        .collect();
    let named: Vec<(&str, Option<&str>, &str)> = lanes
        .iter()
        .map(|lane| (lane.id.as_str(), lane.name.as_deref(), "lane"))
        .chain(
            pools
                .iter()
                .map(|pool| (pool.id.as_str(), pool.name.as_deref(), "pool")),
        )
        .collect();
    // Readable ids first, as for nodes.
    for &(id, name, kind) in &named {
        if is_readable_id(id) {
            let a = alias_for(id, name, kind, taken);
            alias.insert(id.to_owned(), a);
        }
    }
    for &(id, name, kind) in &named {
        if !alias.contains_key(id) {
            let a = alias_for(id, name, kind, taken);
            alias.insert(id.to_owned(), a);
        }
    }
    let alias_of = |id: &str| alias.get(id).map_or("undefined", String::as_str);

    let mut lines: Vec<String> = Vec::new();
    for lane in &lanes {
        let list = members_of
            .get(lane.id.as_str())
            .into_iter()
            .flatten()
            .map(|id| alias_of(id))
            .collect::<Vec<_>>()
            .join(", ");
        let line = format!(
            "lane {}{}: {list}",
            alias_of(&lane.id),
            bracketed(lane.name.as_deref())
        );
        lines.push(line.trim_end_matches(is_js_space).to_owned());
    }
    for pool in &pools {
        lines.push(format!(
            "pool {}{}",
            alias_of(&pool.id),
            bracketed(pool.name.as_deref())
        ));
    }
    let pool_ids: HashSet<&str> = pools.iter().map(|pool| pool.id.as_str()).collect();
    for flow in collaboration.into_iter().flat_map(|c| &c.message_flows) {
        let (source_ref, target_ref) = (flow.source_ref.as_str(), flow.target_ref.as_str());
        let node_to_pool = nodes.contains_key(source_ref) && pool_ids.contains(target_ref);
        let pool_to_node = pool_ids.contains(source_ref) && nodes.contains_key(target_ref);
        if !node_to_pool && !pool_to_node {
            continue;
        }
        let name = flow
            .name
            .as_deref()
            .filter(|n| !n.is_empty())
            .map(writable_message_label)
            .unwrap_or_default();
        let arrow = if name.is_empty() {
            ">".to_owned()
        } else {
            format!(">({name})")
        };
        lines.push(format!(
            "msg {} {arrow} {}",
            alias_of(source_ref),
            alias_of(target_ref)
        ));
    }
    lines
}

/// TS's `token`: a value written as one attribute token reads back as itself, with no
/// space, separator, `=` or bracket.
fn token(value: &Option<String>) -> Option<&str> {
    value.as_deref().filter(|v| {
        !v.is_empty()
            && !v.contains(|c: char| is_js_space(c) || matches!(c, ',' | '|' | '=' | '[' | ']'))
    })
}

/// TS's `spec`: the bracket text of a declaration.
fn spec(element: &CompactElement, host: Option<&str>, container: Option<&str>) -> String {
    let word = kind_word(&element.type_).unwrap_or("task");
    let trigger = match element.event_type.as_deref() {
        Some(t) if !t.is_empty() => format!(":{t}"),
        _ => String::new(),
    };
    let name = match element.name.as_deref() {
        Some(n) if !n.is_empty() => format!(" {}", writable_name(n)),
        _ => String::new(),
    };
    let mut attrs: Vec<String> = vec![];
    if let Some(host) = host {
        attrs.push(format!("on={host}"));
    }
    if let Some(container) = container {
        attrs.push(format!("inside={container}"));
    }
    if element.interrupting == Some(false) {
        attrs.push("nonint".to_owned());
    }
    // Only a duration that reads back as itself: a cycle or a FEEL expression would not
    if let Some(after) = element.timer_duration.as_deref().filter(|s| !s.is_empty()) {
        if element.event_type.as_deref() == Some("timer")
            && duration(after).as_deref() == Some(after)
        {
            attrs.push(format!("after={after}"));
        }
    }
    let timer = element.event_type.as_deref() == Some("timer");
    if let Some(at) = token(&element.timer_date).filter(|_| timer) {
        attrs.push(format!("at={at}"));
    }
    if let Some(every) = token(&element.timer_cycle).filter(|_| timer) {
        if cycle(every).as_deref() == Some(every) {
            attrs.push(format!("every={every}"));
        }
    }
    if let Some(job) = element.job_type.as_deref().filter(|s| !s.is_empty()) {
        attrs.push(format!("job={job}"));
    }
    if let Some(called) = token(&element.called_process) {
        attrs.push(format!("called={called}"));
    }
    if let Some(name) = token(&element.message_name) {
        attrs.push(format!("msg={name}"));
    }
    let key = element.correlation_key.as_deref().map(|k| {
        k.trim_start_matches(is_js_space)
            .strip_prefix('=')
            .map_or(k, |rest| rest.trim_start_matches(is_js_space))
            .to_owned()
    });
    if let Some(key) = token(&key) {
        attrs.push(format!("key={key}"));
    }
    if let Some(name) = token(&element.signal_name) {
        attrs.push(format!("signal={name}"));
    }
    if let Some(code) = token(&element.error_code) {
        attrs.push(format!("error={code}"));
    }
    if let Some(code) = token(&element.escalation_code) {
        attrs.push(format!("escalation={code}"));
    }
    if let Some(form) = element.form_id.as_deref().filter(|s| !s.is_empty()) {
        attrs.push(format!("form={form}"));
    }
    // Mapping values run to the next ` word=`, so they are written before result= and feel=
    for (direction, mappings) in [("in", &element.inputs), ("out", &element.outputs)] {
        let Some(mappings) = mappings else { continue };
        for (target, source) in mappings.entries() {
            let written = format!("{direction}.{target}={}", writable_mapping(source));
            // A target with a space, or a value that reads back as another attribute, cannot be written
            let back = split_mappings(&written);
            if back.plain.trim_matches(is_js_space).is_empty() && back.mappings.len() == 1 {
                attrs.push(written);
            }
        }
    }
    if let Some(script) = element.script.as_deref().filter(|s| !s.is_empty()) {
        // Last: feel= takes the rest of the attributes
        if let Some(result) = element.result_variable.as_deref().filter(|s| !s.is_empty()) {
            attrs.push(format!("result={result}"));
        }
        let body = script
            .strip_prefix('=')
            .map_or(script, |r| r.trim_start_matches(is_js_space));
        attrs.push(format!("feel={}", collapse_spaces(body)));
    }
    let attrs = if attrs.is_empty() {
        String::new()
    } else {
        format!(" | {}", attrs.join(" "))
    };
    format!("[{word}{trigger}{name}{attrs}]")
}

/// TS's `label`: an arrow's label.
fn label(flow: &CompactFlow) -> String {
    let name = match flow.name.as_deref() {
        Some(n) if !n.is_empty() => writable_label(n),
        _ => String::new(),
    };
    if flow.is_default == Some(true) {
        let prefix = if name.is_empty() {
            String::new()
        } else {
            format!("{name}: ")
        };
        return format!(">({prefix}default) ");
    }
    if let Some(condition) = flow.condition.as_deref().filter(|c| !c.is_empty()) {
        return format!(">({name}: {}) ", writable_condition(condition));
    }
    if name.is_empty() {
        "> ".to_owned()
    } else {
        format!(">({name}) ")
    }
}

/// The closures of TS's `writeProcessText` (`ref`, `inside`, `expand`, `drain`) share
/// mutable sets, so they live on one struct.
struct Writer<'a> {
    by_id: IndexMap<&'a str, &'a CompactElement>,
    flows: Vec<&'a CompactFlow>,
    outgoing: IndexMap<&'a str, Vec<usize>>,
    inner: IndexMap<&'a str, (&'a CompactElement, &'a str)>,
    alias: IndexMap<String, String>,
    declared: HashSet<String>,
    written: HashSet<usize>,
    expanded: HashSet<String>,
    queue: VecDeque<String>,
    lines: Vec<String>,
}

impl Writer<'_> {
    fn alias_of<'s>(&'s self, id: &'s str) -> &'s str {
        self.alias.get(id).map_or(id, String::as_str)
    }

    fn reference(&mut self, id: &str) -> String {
        let written = self.alias_of(id).to_owned();
        let Some(el) = self.by_id.get(id).copied() else {
            return written;
        };
        if self.declared.contains(id) {
            return written;
        }
        self.declared.insert(id.to_owned());
        let host = el
            .attached_to
            .as_deref()
            .and_then(|a| self.alias.get(a))
            .map(String::as_str);
        format!("{written}{}", spec(el, host, None))
    }

    /// A task inside an ad-hoc sub-process, declared with `inside=` on a line of its own.
    fn inside(&mut self, id: &str) -> String {
        let Some((element, container)) = self.inner.get(id).copied() else {
            return self.alias_of(id).to_owned();
        };
        if self.declared.contains(id) {
            return self.alias_of(id).to_owned();
        }
        self.declared.insert(id.to_owned());
        let alias = self.alias.get(id).map_or("undefined", String::as_str);
        format!(
            "{alias}{}",
            spec(element, None, self.alias.get(container).map(String::as_str))
        )
    }

    /// Writes every unwritten flow out of `id`, each as a path that runs on while it can.
    fn expand(&mut self, id: &str) {
        if self.expanded.contains(id) {
            return;
        }
        self.expanded.insert(id.to_owned());
        let firsts = self.outgoing.get(id).cloned().unwrap_or_default();
        for first in firsts {
            if self.written.contains(&first) {
                continue;
            }
            let mut line = format!("{} ", self.reference(id));
            let mut flow = Some(first);
            while let Some(f) = flow {
                self.written.insert(f);
                let current = self.flows[f];
                line.push_str(&label(current));
                line.push_str(&self.reference(&current.to));
                line.push(' ');
                self.queue.push_back(current.to.clone());
                let next: Vec<usize> = self
                    .outgoing
                    .get(current.to.as_str())
                    .into_iter()
                    .flatten()
                    .copied()
                    .filter(|f| !self.written.contains(f))
                    .collect();
                // Run on only through a node with one way out, and only once.
                let only = if next.len() == 1 && !self.expanded.contains(current.to.as_str()) {
                    Some(next[0])
                } else {
                    None
                };
                if only.is_some() {
                    self.expanded.insert(current.to.clone());
                }
                flow = only;
            }
            self.lines
                .push(line.trim_end_matches(is_js_space).to_owned());
        }
    }

    fn drain(&mut self) {
        while let Some(id) = self.queue.pop_front() {
            // A boundary waits for its host; it is written after the main paths.
            let is_boundary = self
                .by_id
                .get(id.as_str())
                .is_some_and(|el| el.type_ == "boundaryEvent");
            if !is_boundary {
                self.expand(&id);
            }
        }
    }
}

/// TS's `writeProcessText`.
pub fn write_process_text(
    definitions: &BpmnDefinitions,
    options: WriteProcessTextOptions<'_>,
) -> WrittenProcessText {
    let Some(source) = primary_process(definitions) else {
        return WrittenProcessText::default();
    };
    // compactify keeps the process order, so the index finds the compact twin.
    let index = definitions
        .processes
        .iter()
        .position(|p| std::ptr::eq(p, source));
    let diagram = compactify(definitions);
    let Some(process) = index.and_then(|i| diagram.processes.get(i)) else {
        return WrittenProcessText::default();
    };

    // What the format can write: flow nodes with a kind word, outside any event sub-process.
    let elements: Vec<&CompactElement> = process
        .elements
        .iter()
        .filter(|el| kind_word(&el.type_).is_some())
        .collect();
    let by_id: IndexMap<&str, &CompactElement> =
        elements.iter().map(|el| (el.id.as_str(), *el)).collect();
    let flows: Vec<&CompactFlow> = process
        .flows
        .iter()
        .filter(|f| by_id.contains_key(f.from.as_str()) && by_id.contains_key(f.to.as_str()))
        .collect();
    let mut outgoing: IndexMap<&str, Vec<usize>> = IndexMap::new();
    for (i, flow) in flows.iter().enumerate() {
        outgoing.entry(flow.from.as_str()).or_default().push(i);
    }

    // Tasks inside an ad-hoc sub-process: written on lines of their own, without flows.
    let mut inner: IndexMap<&str, (&CompactElement, &str)> = IndexMap::new();
    for el in &elements {
        if el.type_ != "adHocSubProcess" {
            continue;
        }
        for child in el.children.iter().flat_map(|c| &c.elements) {
            if kind_word(&child.type_).is_some()
                && child.type_ != "boundaryEvent"
                && !by_id.contains_key(child.id.as_str())
            {
                inner.insert(child.id.as_str(), (child, el.id.as_str()));
            }
        }
    }

    let mut taken: IndexSet<String> = IndexSet::new();
    let mut alias: IndexMap<String, String> = IndexMap::new();
    // Readable ids first, so a name-derived alias never takes one of them.
    let named: Vec<&CompactElement> = elements
        .iter()
        .copied()
        .chain(inner.values().map(|(el, _)| *el))
        .collect();
    for el in &named {
        if is_readable_id(&el.id) {
            let a = node_alias(el, &mut taken);
            alias.insert(el.id.clone(), a);
        }
    }
    for el in &named {
        if !alias.contains_key(&el.id) {
            let a = node_alias(el, &mut taken);
            alias.insert(el.id.clone(), a);
        }
    }

    let mut w = Writer {
        by_id,
        flows,
        outgoing,
        inner,
        alias,
        declared: HashSet::new(),
        written: HashSet::new(),
        expanded: HashSet::new(),
        queue: VecDeque::new(),
        lines: vec![],
    };

    let camunda = platform_version(definitions);
    let process_name = process.name.as_deref().filter(|n| !n.is_empty());
    if process_name.is_some() || camunda.is_some() {
        let title = process_name.map_or_else(String::new, writable_name);
        let title = if title.is_empty() {
            String::new()
        } else {
            format!(" {title}")
        };
        let camunda = camunda.map_or_else(String::new, |v| format!(" | camunda={v}"));
        w.lines.push(format!("#{title}{camunda}"));
    }

    let starts: Vec<&CompactElement> = elements
        .iter()
        .copied()
        .filter(|el| el.type_ == "startEvent" || !w.flows.iter().any(|f| f.to == el.id))
        .collect();
    for el in starts {
        if el.type_ == "boundaryEvent" {
            continue;
        }
        w.queue.push_back(el.id.clone());
        w.drain();
    }
    // Then boundaries, after their hosts, and whatever no path reached.
    for el in &elements {
        if let Some(host) = el.attached_to.as_deref() {
            if !w.declared.contains(host) {
                let line = w.reference(host);
                w.lines.push(line);
            }
        }
        w.expand(&el.id);
        w.drain();
        if !w.declared.contains(el.id.as_str()) {
            let line = w.reference(&el.id);
            w.lines.push(line);
        }
    }

    let inner_ids: Vec<&str> = w.inner.keys().copied().collect();
    for id in inner_ids {
        let line = w.inside(id);
        w.lines.push(line);
    }
    let swimlanes = swimlane_lines(definitions, source, &w.by_id, &mut w.alias, &mut taken);
    w.lines.extend(swimlanes);

    // Documentation, on one line like a note: it is the tool description of an agent's tool
    for el in &named {
        let text = el.documentation.as_deref().map(squash).unwrap_or_default();
        if !text.is_empty() {
            let a = w.alias.get(&el.id).map_or("undefined", String::as_str);
            let line = format!("doc {a}: {text}");
            w.lines.push(line);
        }
    }

    // A note names an element it is associated with; one tied to nothing the format writes has no line.
    let annotations: IndexMap<&str, &str> = source
        .contents
        .text_annotations
        .iter()
        .map(|a| (a.id.as_str(), a.text.as_deref().unwrap_or("")))
        .collect();
    for assoc in &source.contents.associations {
        let (annotation, target) = if annotations.contains_key(assoc.target_ref.as_str()) {
            (&assoc.target_ref, &assoc.source_ref)
        } else {
            (&assoc.source_ref, &assoc.target_ref)
        };
        let text = squash(annotations.get(annotation.as_str()).copied().unwrap_or(""));
        // Nodes only: the alias map also holds lanes and pools, which have no note line.
        let is_node =
            w.by_id.contains_key(target.as_str()) || w.inner.contains_key(target.as_str());
        let written = w.alias.get(target.as_str()).filter(|_| is_node);
        if annotations.contains_key(annotation.as_str()) && written.is_some() && !text.is_empty() {
            let line = format!("note {}: {text}", written.map_or("", String::as_str));
            w.lines.push(line);
        }
    }

    if let Some(connector_line) = options.connector_line {
        let real: IndexMap<&str, &BpmnFlowElement> = source
            .contents
            .flow_elements
            .iter()
            .map(|el| (el.base().id.as_str(), el))
            .collect();
        for el in &elements {
            let line = real
                .get(el.id.as_str())
                .and_then(|element| connector_line(element, definitions))
                .filter(|l| !l.is_empty());
            if let Some(line) = line {
                let line = format!("with {}: {line}", w.alias_of(&el.id));
                w.lines.push(line);
            }
        }
    }

    let mut aliases = JsRecord::new();
    for (id, written) in &w.alias {
        aliases.insert(written.clone(), id.clone());
    }
    WrittenProcessText {
        text: w.lines.join("\n"),
        aliases,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn writable_helpers() {
        assert_eq!(writable_name("  a [b] | c\n d "), "a (b) / c d");
        assert_eq!(writable_label("x(y): z"), "x y z");
        assert_eq!(writable_condition("  = a  >\n 1 "), "a > 1");
        assert_eq!(writable_condition("a = 1"), "a = 1");
        assert_eq!(
            writable_mapping("hi \"x\"\n\u{1f}"),
            "\"hi \\\"x\\\"\\n\\u001f\""
        );
        assert_eq!(writable_mapping("=  a +\n b"), "a + b");
    }

    #[test]
    fn readable_ids_and_kind_words() {
        assert!(is_readable_id("check_order"));
        assert!(!is_readable_id("Check"));
        assert!(!is_readable_id(&"a".repeat(25)));
        assert!(is_readable_id(&"a".repeat(24)));
        assert_eq!(kind_word("serviceTask"), Some("service"));
        assert_eq!(kind_word("subProcess"), Some("sub"));
        assert_eq!(kind_word("lane"), None);
    }

    #[test]
    fn aliases_from_names() {
        let mut taken = IndexSet::new();
        let el = |id: &str, name: &str, t: &str| CompactElement {
            id: id.into(),
            type_: t.into(),
            name: Some(name.into()),
            ..Default::default()
        };
        assert_eq!(
            node_alias(
                &el("Activity_1", "Review applicationNow please ok", "userTask"),
                &mut taken
            ),
            "review_application_now_please"
        );
        assert_eq!(
            node_alias(
                &el("Activity_2", "Review application Now please", "userTask"),
                &mut taken
            ),
            "review_application_now_please_2"
        );
        assert_eq!(
            node_alias(&el("Activity_3", "42 x", "userTask"), &mut taken),
            "user_42_x"
        );
        assert_eq!(
            node_alias(&el("Activity_4", "", "weird"), &mut taken),
            "node"
        );
    }
}
