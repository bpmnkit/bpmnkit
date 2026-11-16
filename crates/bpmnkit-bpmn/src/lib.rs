//! BPMN 2.0 + Zeebe model, parser and serializer: the Rust twin of `@bpmnkit/core`'s
//! `bpmn-model.ts`, `bpmn-parser.ts`, `bpmn-serializer.ts` and `zeebe-extensions.ts`.
//! TS is the oracle: `conformance/bpmn/` pins the model JSON and the round-trip XML.
//!
//! Also the small helpers the builder (`bpmnkit-builder`) and text formats (`bpmnkit-text`)
//! share: `element-shape.ts`, `stable-ids.ts`, `rest-connector.ts` and `plan/slug.ts`.
//!
//! ```
//! use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
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
//! assert_eq!(definitions.processes.len(), 1);
//! // Unknown attributes, prefixes and extension elements survive the round trip.
//! let again = parse_bpmn(&serialize_bpmn(&definitions)).unwrap();
//! assert_eq!(again, definitions);
//! ```

pub mod element_shape;
pub mod feel_condition;
pub mod ids;
pub mod js;
pub mod juel;
pub mod model;
mod number;
mod parser;
pub mod rest_connector;
mod serializer;
pub mod slug;
pub mod stable_ids;
pub mod swimlanes;
pub mod zeebe;

pub use bpmnkit_xml::{Attrs, XmlElement};
pub use element_shape::{
    create_flow_element, retype_element, BpmnElementType, CreateFlowElementOptions,
};
pub use model::*;
pub use parser::{parse_bpmn, ParseError};
pub use serializer::serialize_bpmn;
