//! DMN model, parser and serializer: the Rust twin of `@bpmnkit/core`'s `dmn-model.ts`,
//! `dmn-parser.ts` and `dmn-serializer.ts`. TS is the oracle: `conformance/dmn/` pins the model
//! JSON and the round-trip XML. [`eval`] is the twin of `@bpmnkit/engine`'s DMN evaluation,
//! pinned by `conformance/dmn/<case>/evaluate.json`.

pub mod eval;
pub mod model;
mod number;
mod parser;
mod serializer;

pub use bpmnkit_xml::{Attrs, XmlElement};
pub use eval::{
    evaluate_decision_graph, evaluate_decision_table, literal_expression_text, DecisionEvaluation,
    Diagnostic, EvalError, EvaluatedDecision, GraphEvaluation,
};
pub use model::*;
pub use parser::{parse_dmn, ParseError};
pub use serializer::serialize_dmn;
