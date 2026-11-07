//! BPMN 2.0 + Zeebe model, parser and serializer: the Rust twin of `@bpmnkit/core`'s
//! `bpmn-model.ts`, `bpmn-parser.ts`, `bpmn-serializer.ts` and `zeebe-extensions.ts`.
//! TS is the oracle: `conformance/bpmn/` pins the model JSON and the round-trip XML.
//!
//! Also the small helpers the builder (`bpmnkit-builder`) and text formats (`bpmnkit-text`)
//! share: `element-shape.ts`, `stable-ids.ts`, `rest-connector.ts` and `plan/slug.ts`.

pub mod element_shape;
pub mod ids;
pub mod js;
pub mod model;
mod number;
mod parser;
pub mod rest_connector;
mod serializer;
pub mod slug;
pub mod stable_ids;
pub mod zeebe;

pub use bpmnkit_xml::{Attrs, XmlElement};
pub use element_shape::{
    create_flow_element, retype_element, BpmnElementType, CreateFlowElementOptions,
};
pub use model::*;
pub use parser::{parse_bpmn, ParseError};
pub use serializer::serialize_bpmn;
