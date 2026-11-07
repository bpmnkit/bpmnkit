//! BPMN and DMN auto-layout, the Rust twin of `@bpmnkit/core`'s `applyAutoLayout`
//! (`bpmn/auto-layout.ts`, `layout/`) and `layoutDmn` (`dmn/dmn-layout.ts`).
//!
//! The port follows the TS line by line so coordinates match exactly: JS `Map`/`Set`
//! become [`indexmap`] (insertion order is observable), `Math.round` is [`js::round`],
//! and string lengths count UTF-16 units ([`js::len`]).
//!
//! ```
//! use bpmnkit_bpmn::parse_bpmn;
//! use bpmnkit_layout::{apply_auto_layout, LayoutEngine};
//!
//! let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
//! <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
//!   <bpmn:process id="p" isExecutable="true">
//!     <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
//!     <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
//!     <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
//!   </bpmn:process>
//! </bpmn:definitions>"#;
//! let definitions = parse_bpmn(xml).unwrap();
//! assert!(definitions.diagrams.is_empty()); // no diagram interchange yet
//! let laid_out = apply_auto_layout(&definitions, LayoutEngine::Semantic, None);
//! assert_eq!(laid_out.diagrams[0].plane.shapes.len(), 2); // start and end event
//! ```

pub mod annotations;
pub mod auto_layout;
pub mod collaboration;
pub mod dmn;
pub mod engine;
pub mod grid;
pub mod hash;
pub mod js;
pub mod orthogonal;
pub mod overlap;
pub mod repair;
pub mod semantic;
pub mod types;

pub use auto_layout::{apply_auto_layout, apply_auto_layout_owned};
pub use dmn::{layout_dmn, layout_dmn_owned};
pub use engine::{layout_flow_nodes, layout_process, LayoutEngine};
pub use types::*;
