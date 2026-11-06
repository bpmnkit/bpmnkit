//! Evaluator. Port of `packages/feel/src/evaluator.ts`.
// STUB: filled in by the evaluator port.
#![allow(unused_variables)]

use crate::ast::Node;
use crate::value::{Context, Value};

/// Evaluates `node` with `vars` in scope and `input` bound to `?`.
pub fn evaluate_root(node: &Node, vars: &Context, input: Option<&Value>) -> Value {
    todo!()
}

/// `evaluateUnaryTests`.
pub fn test_unary(node: &Node, input: &Value, vars: &Context) -> bool {
    todo!()
}
