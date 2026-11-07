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

use indexmap::{IndexMap, IndexSet};

use super::tokens::{Edge, EdgeLabel, Node};
use super::{ConnectorRef, ProcessTextProblem};

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

impl Reader {
    pub fn new() -> Self {
        Self::default()
    }

    /// TS's private `header`: the attributes after the title's bar.
    fn header(&mut self, attrs: &str, n: u32) {
        todo!()
    }

    /// TS's `line()`: reads one line; whether it added anything.
    pub fn line(&mut self, raw: &str, n: u32) -> bool {
        todo!()
    }

    /// TS's `finish()`: reads a line still waiting for its continuation.
    pub fn finish(&mut self) -> bool {
        todo!()
    }

    /// TS's private `read`: one complete path line.
    fn read(&mut self, text: &str, n: u32) -> bool {
        todo!()
    }

    /// TS's private `feelOrLabel`.
    fn feel_or_label(&mut self, edge: EdgeLabel, n: u32) -> EdgeLabel {
        todo!()
    }

    /// TS's private `fail`: records the problem, returns false.
    fn fail(&mut self, n: u32, message: String) -> bool {
        todo!()
    }

    /// TS's private `declare`: declares a node, returns the id it was stored under.
    fn declare(&mut self, written: &str, spec: &str, n: u32, after_arrow: bool) -> String {
        todo!()
    }
}
