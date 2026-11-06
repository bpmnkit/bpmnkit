//! Camunda Form model, parser and serializer: the Rust twin of `@bpmnkit/core`'s
//! `form-model.ts`, `form-parser.ts` and `form-serializer.ts`.
//! TS is the oracle: `conformance/form/` pins the model JSON and the exported text.

mod json;
pub mod model;
mod parser;
mod serializer;

pub use json::{JsNumber, Json};
pub use model::*;
pub use parser::{parse_form, ParseError};
pub use serializer::export_form;
