//! DMN model, parser and serializer: the Rust twin of `@bpmnkit/core`'s `dmn-model.ts`,
//! `dmn-parser.ts` and `dmn-serializer.ts`. TS is the oracle: `conformance/dmn/` pins the model
//! JSON and the round-trip XML. [`eval`] is the twin of `@bpmnkit/engine`'s DMN evaluation,
//! pinned by `conformance/dmn/<case>/evaluate.json`.
//!
//! ```
//! use bpmnkit_dmn::{evaluate_decision_table, parse_dmn};
//! use bpmnkit_feel::{Context, Value};
//!
//! let xml = r#"<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="D" namespace="urn:x">
//!   <decision id="grade" name="Grade">
//!     <decisionTable id="t" hitPolicy="FIRST">
//!       <input id="i"><inputExpression id="ie" typeRef="number"><text>score</text></inputExpression></input>
//!       <output id="o" name="grade" typeRef="string"/>
//!       <rule id="r1"><inputEntry id="e1"><text>&gt;= 50</text></inputEntry><outputEntry id="o1"><text>"pass"</text></outputEntry></rule>
//!       <rule id="r2"><inputEntry id="e2"><text>-</text></inputEntry><outputEntry id="o2"><text>"fail"</text></outputEntry></rule>
//!     </decisionTable>
//!   </decision>
//! </definitions>"#;
//! let definitions = parse_dmn(xml).unwrap();
//! let mut vars = Context::new();
//! vars.insert("score", Value::from(70));
//! let outcome = evaluate_decision_table(&definitions.decisions[0], &vars).unwrap();
//! assert_eq!(outcome.result, Value::from("pass"));
//! ```

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
