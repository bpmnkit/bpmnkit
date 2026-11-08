//! Camunda Form model, parser and serializer: the Rust twin of `@bpmnkit/core`'s
//! `form-model.ts`, `form-parser.ts` and `form-serializer.ts`.
//! TS is the oracle: `conformance/form/` pins the model JSON and the exported text.
//!
//! ```
//! use bpmnkit_form::{export_form, parse_form};
//!
//! let form = parse_form(r#"{"id":"f","type":"default","components":[]}"#).unwrap();
//! assert_eq!(form.id, "f");
//! let text = export_form(&form);
//! assert_eq!(parse_form(&text).unwrap(), form);
//! ```

mod json;
pub mod model;
mod parser;
mod serializer;

pub use json::{JsNumber, Json};
pub use model::*;
pub use parser::{parse_form, ParseError};
pub use serializer::export_form;
