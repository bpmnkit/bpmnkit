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
use indexmap::{IndexMap, IndexSet};
use serde::Deserialize;

use super::expand::expand;
use super::types::*;
use crate::catalog::is_element_type;

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

/// The fields `take` looks at before it commits to a type; the rest is typed afterwards,
/// straight from the literal text.
#[derive(Deserialize)]
struct Probe {
    id: Option<serde_json::Value>,
    #[serde(rename = "type")]
    type_: Option<serde_json::Value>,
    from: Option<serde_json::Value>,
    to: Option<serde_json::Value>,
}

impl CompactStream {
    /// TS's `createCompactStream(options)`.
    pub fn new(options: CompactStreamOptions) -> Self {
        let base = options.base.as_ref();
        let base_process = base.and_then(|b| b.processes.first());
        let mut elements = IndexMap::new();
        let mut flows = IndexMap::new();
        if let Some(p) = base_process {
            for element in &p.elements {
                elements.insert(element.id.clone(), element.clone());
            }
            for flow in &p.flows {
                flows.insert(flow.id.clone(), flow.clone());
            }
        }
        Self {
            elements,
            flows,
            document_id: base.map_or_else(|| "Definitions_1".to_owned(), |b| b.id.clone()),
            process_id: base_process.map_or_else(|| "Process_1".to_owned(), |p| p.id.clone()),
            process_name: base_process.and_then(|p| p.name.clone()),
            text: String::new(),
            read: 0,
            open: Vec::new(),
            in_string: false,
            escaped: false,
            changed: false,
        }
    }

    /// TS's `push(chunk)`: the diagram as it now stands, or `None`.
    pub fn push(&mut self, chunk: &str) -> Option<BpmnDefinitions> {
        self.text.push_str(chunk);
        self.scan();
        if !self.changed {
            return None;
        }
        self.changed = false;

        let kept: Vec<CompactElement> = self.elements.values().cloned().collect();
        if kept.is_empty() {
            return None;
        }
        let known: IndexSet<&str> = kept.iter().map(|e| e.id.as_str()).collect();
        // A flow whose other end has not been written yet lays out as nothing; one naming
        // an element that never arrives would too.
        let flows: Vec<CompactFlow> = self
            .flows
            .values()
            .filter(|f| known.contains(f.from.as_str()) && known.contains(f.to.as_str()))
            .cloned()
            .collect();
        let diagram = CompactDiagram {
            id: self.document_id.clone(),
            execution_platform_version: None,
            processes: vec![CompactProcess {
                id: self.process_id.clone(),
                name: self.process_name.clone(),
                documentation: None,
                elements: kept,
                flows,
                notes: None,
            }],
        };
        // An element whose fields have not all arrived fails here.
        expand(&diagram).ok()
    }

    /// TS's inner `forget`.
    fn forget(&mut self, children: Option<&CompactChildren>) {
        let Some(children) = children else { return };
        for child in &children.elements {
            self.elements.shift_remove(&child.id);
            self.forget(child.children.as_ref());
        }
        for flow in &children.flows {
            self.flows.shift_remove(&flow.id);
        }
    }

    /// TS's inner `take`, given the text of one complete `{…}` literal.
    fn take(&mut self, literal: &str) {
        let Ok(probe) = serde_json::from_str::<Probe>(literal) else {
            return;
        };
        let Some(serde_json::Value::String(id)) = &probe.id else {
            return;
        };
        if id.is_empty() {
            return;
        }

        if let Some(serde_json::Value::String(type_)) = &probe.type_ {
            if is_element_type(type_) {
                // TS keeps an element whose other fields have the wrong JSON type and
                // fails later in `expand`; here it is skipped.
                let Ok(element) = serde_json::from_str::<CompactElement>(literal) else {
                    return;
                };
                self.forget(element.children.as_ref());
                self.elements.insert(element.id.clone(), element);
                self.changed = true;
                return;
            }
        }

        if matches!(probe.from, Some(serde_json::Value::String(_)))
            && matches!(probe.to, Some(serde_json::Value::String(_)))
        {
            // `isDefault` is dropped rather than carried: `expand` throws when a flow
            // claims a gateway that has not been written yet, which during a stream is
            // most of the time. A preview without the marker beats no preview.
            let Ok(mut flow) = serde_json::from_str::<CompactFlow>(literal) else {
                return;
            };
            flow.is_default = None;
            self.flows.insert(flow.id.clone(), flow);
            self.changed = true;
        }
    }

    /// TS's inner `scan`: reads the new text once, taking each literal at the `}` that
    /// closes it, innermost first.
    fn scan(&mut self) {
        while self.read < self.text.len() {
            let at = self.read;
            self.read += 1;
            let ch = self.text.as_bytes()[at];
            if self.escaped {
                self.escaped = false;
                continue;
            }
            if ch == b'\\' {
                self.escaped = true;
                continue;
            }
            if ch == b'"' {
                self.in_string = !self.in_string;
                continue;
            }
            if self.in_string {
                continue;
            }
            if ch == b'{' {
                self.open.push(at);
                continue;
            }
            if ch != b'}' {
                continue;
            }
            // A stray brace in prose has nothing open.
            let Some(start) = self.open.pop() else {
                continue;
            };
            let literal = self.text[start..=at].to_owned();
            self.take(&literal);
        }
    }
}
