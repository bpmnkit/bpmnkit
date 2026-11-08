//! Camunda 8 compatibility checks and Camunda 7 migration: the Rust twin of
//! `@bpmnkit/core`'s `camunda-compat.ts`, `camunda-compat-feel.ts` and `camunda7/`.
//! TS is the oracle: `conformance/compat/` and `conformance/migrate/` pin the output.
//!
//! The finding type lives here, not in `bpmnkit-lint`, because the compatibility
//! check reports through it and `bpmnkit-lint` builds on this crate.
//!
//! ```
//! use bpmnkit_bpmn::parse_bpmn;
//! use bpmnkit_compat::compat::analyze_camunda_compat;
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
//! // Findings for Camunda 8.6; a plain start-to-end process raises none.
//! let findings = analyze_camunda_compat(&definitions, Some("8.6"));
//! assert!(findings.is_empty());
//! ```

pub mod camunda7;
pub mod compat;
pub mod finding;

pub use finding::{ApplyFixResult, Category, Finding, FindingData, Fix, Severity};
