//! Port of `bpmn/process-text.ts` lines 998–1216 and 1623–1955: `assemble()`, which turns
//! what the reader holds into a diagram `expand` accepts. The `if (final)` repair block in
//! between (1217–1622) is `Assembly::repair` in `repair.rs`.
//!
//! Porter notes:
//! - TS's locals become [`Assembly`] fields; its closures (`typeOf`, `nameOf`, `add`,
//!   `outOf`, `into`) become methods. `asks` hold closures run after everything, so a
//!   question sees the final names: [`Ask::ask`] gets the finished `Assembly`.
//! - `assemble` copies `reader.nodes` (`{...node, element: {...node.element}}`, shallow:
//!   nested objects are shared in TS but nothing mutates them in place — check) but
//!   MUTATES `reader.edges` (a boundary drawn into by its host is spliced out), and that
//!   persists across stream frames. Hence `&mut Reader`.
//! - JS `Map` order: `nodes.delete` is `shift_remove`; re-adding a deleted key appends.
//! - TS compares edges by identity (`other !== edge`, `includes(edge)`, a Map keyed by
//!   edge). Use indices into the current `edges`, or wrap `Edge` with an identity counter
//!   inside this module.
//! - Sorting: `problems.sort((a, b) => a.line - b.line)` and the asks by line are stable.
//! - Flow ids `Flow_<n>` skip ids in `taken`; the process id is `slugify(title)` (or
//!   `Process_1`), prefixed `Process_` when it does not start with a letter or `_`, made
//!   unique against `taken`.

use bpmnkit_bpmn::BpmnElementType;
use indexmap::{IndexMap, IndexSet};

use super::reader::Reader;
use super::tokens::{Edge, Node};
use super::{ProcessTextProblem, ProcessTextQuestion, ProcessTextResult};

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

impl Assembly {
    /// TS's `typeOf`. `None` for an id that is not a node, or a type `CompactElement`
    /// holds that is not a known element type.
    pub fn type_of(&self, id: &str) -> Option<BpmnElementType> {
        todo!()
    }

    /// TS's `nameOf`: the node's name, else `name_from_id(id)`.
    pub fn name_of(&self, id: &str) -> String {
        todo!()
    }

    /// TS's `add`: a new node `{ id, type }` (with `name` when given), spec `""`.
    pub fn add(&mut self, id: &str, ty: BpmnElementType, line: u32, name: Option<String>) {
        todo!()
    }

    /// TS's `outOf`: indices into `edges` of the flows leaving `id`, in order.
    pub fn out_of(&self, id: &str) -> Vec<usize> {
        todo!()
    }

    /// TS's `into`: indices into `edges` of the flows entering `id`, in order.
    pub fn in_to(&self, id: &str) -> Vec<usize> {
        todo!()
    }
}

/// TS's `assemble(reader, final)`.
pub(crate) fn assemble(reader: &mut Reader, final_: bool) -> ProcessTextResult {
    todo!()
}
