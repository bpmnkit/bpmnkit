//! BPMN 2.0 + Zeebe model, parser and serializer: the Rust twin of `@bpmnkit/core`'s
//! `bpmn-model.ts`, `bpmn-parser.ts`, `bpmn-serializer.ts` and `zeebe-extensions.ts`.
//! TS is the oracle: `conformance/bpmn/` pins the model JSON and the round-trip XML.

pub mod model;
mod number;
mod parser;
mod serializer;
pub mod zeebe;

pub use bpmnkit_xml::{Attrs, XmlElement};
pub use model::*;
pub use parser::{parse_bpmn, ParseError};
pub use serializer::serialize_bpmn;
