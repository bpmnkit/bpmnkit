//! Port of `bpmn/compact-stream.ts`: a diagram read out of streamed text by picking
//! complete `{…}` literals as they close.
//!
//! Porter notes:
//! - The scan is per UTF-16 unit in TS; every character it reacts to is ASCII, so a byte
//!   or char scan over the accumulated `String` is equivalent. Keep the "every character is
//!   looked at once" property: remember `read` and the open-brace stack between pushes.
//! - `take()`: parse the literal with `serde_json` (TS `JSON.parse`; on failure skip). Type
//!   the element/flow straight from the literal text, not via `serde_json::Value`, which
//!   sorts object keys (and so the order of `taskHeaders`/`inputs`). An
//!   object with a non-empty string `id` and a `type` that `catalog::is_element_type`
//!   accepts is an element: deserialize it as [`CompactElement`] (if that fails, skip it —
//!   TS would keep it and fail later in `expand`; note it as a known divergence), drop its
//!   children from the top level (`forget`, recursive), then insert/replace by id. Else an
//!   object with string `from` and `to` is a flow, stored without `isDefault`.
//! - Maps are JS `Map`s: replacing an id keeps its position (`IndexMap::insert`), and
//!   `forget` deletes (`shift_remove`).
//! - `push()` returns `None` when nothing changed or nothing is kept, and when `expand`
//!   fails; otherwise the expanded diagram of the one process (base ids, flows whose two
//!   ends are both kept elements).

use bpmnkit_bpmn::BpmnDefinitions;
use indexmap::IndexMap;

use super::types::*;

/// TS's `CompactStreamOptions`.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct CompactStreamOptions {
    /// The diagram being edited; only its first process is previewed.
    pub base: Option<CompactDiagram>,
}

/// TS's `createCompactStream()` result.
#[derive(Debug, Clone)]
pub struct CompactStream {
    pub(crate) elements: IndexMap<String, CompactElement>,
    pub(crate) flows: IndexMap<String, CompactFlow>,
    pub(crate) document_id: String,
    pub(crate) process_id: String,
    pub(crate) process_name: Option<String>,
    pub(crate) text: String,
    /// How far the scan has read (byte offset into `text`).
    pub(crate) read: usize,
    /// Byte offsets of the `{`s still open, outermost first.
    pub(crate) open: Vec<usize>,
    pub(crate) in_string: bool,
    pub(crate) escaped: bool,
    pub(crate) changed: bool,
}

impl CompactStream {
    /// TS's `createCompactStream(options)`.
    pub fn new(options: CompactStreamOptions) -> Self {
        todo!()
    }

    /// TS's `push(chunk)`: the diagram as it now stands, or `None`.
    pub fn push(&mut self, chunk: &str) -> Option<BpmnDefinitions> {
        todo!()
    }

    /// TS's inner `forget`.
    fn forget(&mut self, children: Option<&CompactChildren>) {
        todo!()
    }

    /// TS's inner `take`, given the text of one complete `{…}` literal.
    fn take(&mut self, literal: &str) {
        todo!()
    }

    /// TS's inner `scan`.
    fn scan(&mut self) {
        todo!()
    }
}
