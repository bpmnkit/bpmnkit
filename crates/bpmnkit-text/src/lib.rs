//! Text formats over the BPMN and DMN models: the Rust twin of `@bpmnkit/core`'s
//! `bpmn/compact.ts`, `bpmn/compact-stream.ts`, `dmn/compact.ts`, `bpmn/process-text.ts`,
//! `bpmn/process-text-writer.ts`, `bpmn/connector-line.ts` and `bpmn/element-catalog.ts`.
//! TS is the oracle: JSON shapes, written text and every message match.

// skeleton: removed once ported
#![allow(
    unused_variables,
    dead_code,
    unused_imports,
    unused_mut,
    clippy::ptr_arg
)]

pub mod catalog;
pub mod compact;
pub mod connector_line;
pub mod dmn_compact;
mod error;
pub mod js_record;
pub mod process_text;

pub use bpmnkit_bpmn::slug;
pub use error::TextError;
