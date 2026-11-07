//! Text formats over the BPMN and DMN models: the Rust twin of `@bpmnkit/core`'s
//! `bpmn/compact.ts`, `bpmn/compact-stream.ts`, `dmn/compact.ts`, `bpmn/process-text.ts`,
//! `bpmn/process-text-writer.ts`, `bpmn/connector-line.ts` and `bpmn/element-catalog.ts`.
//! TS is the oracle: JSON shapes, written text and every message match.
//!
//! ```
//! use bpmnkit_text::compact::compactify;
//! use bpmnkit_text::process_text::parse_process_text;
//!
//! let parsed = parse_process_text("start[start Order placed] > user[user Review order] > end[end Done]");
//! assert!(parsed.problems.is_empty());
//! assert_eq!(parsed.diagram.processes.len(), 1);
//!
//! // Compact JSON of a model: ids, names, elements and flows only.
//! let compact = compactify(&bpmnkit_bpmn::parse_bpmn(r#"<?xml version="1.0" encoding="UTF-8"?>
//! <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
//!   <bpmn:process id="p" isExecutable="true">
//!     <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
//!     <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
//!     <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
//!   </bpmn:process>
//! </bpmn:definitions>"#).unwrap());
//! assert_eq!(compact.processes[0].id, "p");
//! ```

pub mod catalog;
pub mod compact;
pub mod connector_line;
pub mod dmn_compact;
mod error;
pub mod js_record;
pub mod process_text;

pub use bpmnkit_bpmn::slug;
pub use error::TextError;
