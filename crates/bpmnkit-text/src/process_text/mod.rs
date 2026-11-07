//! The process line format (`bpmn/process-text.ts`, `bpmn/process-text-writer.ts`): a
//! language model writes `a > b[kind Name] > c` lines; [`parse_process_text`] reads them
//! into a [`CompactDiagram`] that always expands, and [`write_process_text`] writes a model
//! back in the format.
//!
//! Module map (TS `process-text.ts` lines):
//! - `tokens`: constants and line-level helpers (115–457, 890–997).
//! - `reader`: the `Reader` class (457–888).
//! - `assemble`: `assemble()` up to the repairs and from the joins on (998–1216, 1623–1955).
//! - `repair`: the `if (final)` repair block of `assemble()` (1217–1622).
//! - this file: the public types (66–113), [`parse_process_text`] and the stream
//!   (1956–2017).
//! - `writer`: `process-text-writer.ts`.
//!
//! [`parse_process_text`] splits lines on `/\r?\n/`, numbered from 1; the stream reads
//! only up to each `\n` (a `\r` before it stays on the line, which `trim()` drops), and
//! `push` returns `expand(assemble(reader, false).diagram)` when a line added something
//! and the reader has nodes. TS lets an `expand` error escape `push`; so does `Err` here.

mod assemble;
mod reader;
mod repair;
pub mod tokens;
mod writer;

use bpmnkit_bpmn::BpmnDefinitions;
use serde::{Deserialize, Serialize};

use crate::compact::{expand, CompactDiagram};
use crate::connector_line::ConnectorLine;
use crate::TextError;

pub use tokens::{
    condition_or_label, duration, edge_label, split_feel, split_mappings, tokenize_path, EdgeLabel,
    JoinedId, Mapping, MappingDirection, PathRef, PathTokens, SplitFeel, SplitMappings, ALIASES,
    KINDS, TRIGGERS,
};
pub use writer::{
    writable_condition, writable_label, writable_name, write_process_text, WriteProcessTextOptions,
    WrittenProcessText,
};

/// TS's `PROCESS_TEXT_GUIDE`: how to write the format, for a system prompt.
pub const PROCESS_TEXT_GUIDE: &str = r#"Format — one path per line, nothing else:
# Process name            (first line; add " | camunda=8.10" to target a Camunda version)
a > b > c                 sequence flow
id[kind Name]             declare a node the first time it appears; afterwards write only id
gw >(Label: condition) x  conditional branch, condition in FEEL (amount > 1000, status = "ok")
gw >(Label: default) y    branch taken when no condition holds
Kinds: start end task user service rule (DMN decision) send receive script manual call xor and or eventgw catch (wait for message or timer) throw boundary adhoc (an AI agent that chooses among tools)
Events take a trigger: start:message end:error catch:timer boundary:error (timer message signal error escalation terminate conditional compensate cancel)
Attributes after |: on=<task id> (required on boundary), nonint (non-interrupting), job=<job type>, each=<list variable> (once per item), after=<ISO duration> (timer), result=<variable>, feel=<FEEL expression> (last)
Also after |: form=<form id> (start, user), in.<name>=<FEEL> and out.<name>=<FEEL> map variables in and out of a step (value runs to the next word=; write comparisons with spaces: a = 1)
Ad-hoc: agent[adhoc Name] is a container with flows like any node; tool[service Name | inside=agent] has no flows of its own; note <id>: text annotates a node
doc <id>: text            the element's documentation; for a tool inside an ad-hoc agent it is the description the agent chooses the tool by
Ad-hoc example:
ask[start Question asked] > agent[adhoc Answer with tools] > review[user Review answer] > done[end Answered]
users[service Look up users | inside=agent]
doc users: Returns the list of sample users
note agent: Picks a tool by its description
Rules:
- One start event. Every node is on a path from it to an end event: never a node nothing leads to.
- An xor has two or more branches: exactly one is (Label: default), each other has a FEEL condition.
- A boundary starts its own line, on a task you declared, and leads to a task that handles it; never draw an arrow into a boundary.
- A boundary leads only to the handling. What happens next when nothing fails follows the task itself (read > count), never the boundary.
- A step that only works on process data (count, sum, filter, compare, pick, format a message) is a script task, never a service or plain task: its FEEL reads the variables earlier steps set with result=. read[service Read issues | result=issues] > count[script Count open issues | result=openCount feel=count(issues[state = "open"])]
- Branches that meet again are joined automatically; join parallel branches with an and node.
- Steps done at the same time start from an and node and meet at another. A deadline is a boundary:timer with after= on the task that may run late. A step done for every item of a list takes each=<list>; use it only when the description says every or each.

Example:
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay] > notify[send Notify submitter] > notice[end Payment failed]"#;

/// TS's `ProcessTextProblem`: text that was left out, and its 1-based line.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProcessTextProblem {
    pub line: u32,
    pub message: String,
}

/// A ready answer of a [`ProcessTextQuestion`].
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct QuestionOption {
    pub label: String,
    pub change: String,
}

/// TS's `ProcessTextQuestion`: a guess the parser made, put as a question.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessTextQuestion {
    pub element_id: String,
    pub text: String,
    pub options: Vec<QuestionOption>,
    pub draft: String,
}

/// TS's `ConnectorRef`: a `with` line and the element it configures.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectorRef {
    #[serde(flatten)]
    pub connector: ConnectorLine,
    pub element_id: String,
}

/// TS's `ProcessTextResult`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ProcessTextResult {
    /// One process; always valid input for `expand`.
    pub diagram: CompactDiagram,
    pub problems: Vec<ProcessTextProblem>,
    pub fixes: Vec<String>,
    pub questions: Vec<ProcessTextQuestion>,
    pub connectors: Vec<ConnectorRef>,
}

/// TS's `parseProcessText`: never fails; see the module notes.
pub fn parse_process_text(text: &str) -> ProcessTextResult {
    let mut reader = reader::Reader::new();
    // `text.split(/\r?\n/)`: a lone `\r` stays, and so does one ending the last line.
    let mut lines: Vec<&str> = text.split('\n').collect();
    let last = lines.len() - 1;
    for line in &mut lines[..last] {
        *line = line.strip_suffix('\r').unwrap_or(line);
    }
    for (index, line) in lines.into_iter().enumerate() {
        reader.line(line, line_number(index + 1));
    }
    reader.finish();
    assemble::assemble(&reader, true)
}

fn line_number(n: usize) -> u32 {
    u32::try_from(n).unwrap_or(u32::MAX)
}

/// TS's `createProcessTextStream()`: reads the format line by line as it arrives.
#[derive(Debug, Default)]
pub struct ProcessTextStream {
    pub(crate) reader: reader::Reader,
    pub(crate) pending: String,
    pub(crate) line_number: u32,
}

impl ProcessTextStream {
    pub fn new() -> Self {
        Self::default()
    }

    /// TS's `push(chunk)`: the diagram after the lines this chunk completed, laid out, or
    /// `None` when they added nothing.
    pub fn push(&mut self, chunk: &str) -> Result<Option<BpmnDefinitions>, TextError> {
        self.pending.push_str(chunk);
        let mut changed = false;
        while let Some(nl) = self.pending.find('\n') {
            self.line_number += 1;
            changed = self.reader.line(&self.pending[..nl], self.line_number) || changed;
            self.pending.drain(..=nl);
        }
        if !changed || self.reader.nodes.is_empty() {
            return Ok(None);
        }
        let result = assemble::assemble(&self.reader, false);
        expand(&result.diagram).map(Some)
    }

    /// TS's `end()`: reads the last, unterminated line and returns the full result.
    pub fn end(&mut self) -> ProcessTextResult {
        if !self.pending.is_empty() {
            self.line_number += 1;
            let pending = std::mem::take(&mut self.pending);
            self.reader.line(&pending, self.line_number);
        }
        self.reader.finish();
        assemble::assemble(&self.reader, true)
    }
}
