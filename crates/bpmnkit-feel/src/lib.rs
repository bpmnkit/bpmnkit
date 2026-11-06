//! FEEL for BPMN Kit: the Rust twin of `@bpmnkit/feel`, held to the same
//! behaviour by the shared cases in `conformance/feel`.
//!
//! ```
//! use bpmnkit_feel::{evaluate, Context, Value};
//! let mut ctx = Context::new();
//! ctx.insert("x", Value::from(2));
//! assert_eq!(evaluate("x * 3 + 1", &ctx).unwrap(), Value::from(7));
//! ```
//!
//! Numbers are exact decimals (28 significant digits), contexts keep insertion
//! order, and evaluation never fails: like FEEL, an invalid operation yields
//! `null`. Only parsing reports errors.

mod ast;
mod builtins;
mod evaluator;
mod lexer;
mod ops;
mod parser;
mod temporal;
mod value;

use std::fmt;
use std::sync::Arc;

pub use parser::{ParseError, ParseOptions};
pub use rust_decimal::Decimal;
pub use value::{
    Context, Date, DateTime, DaysTimeDuration, Function, Range, Time, Value, YearsMonthsDuration,
};

/// A parse failure: every problem the parser found, with byte offsets into the source.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FeelError {
    pub errors: Vec<ParseError>,
}

impl fmt::Display for FeelError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.errors.first() {
            Some(e) => write!(
                f,
                "FEEL parse error at {}..{}: {}",
                e.start, e.end, e.message
            ),
            None => write!(f, "FEEL parse error"),
        }
    }
}

impl std::error::Error for FeelError {}

/// A parsed FEEL expression, cheap to clone and to evaluate many times.
#[derive(Debug, Clone)]
pub struct Expression {
    ast: Arc<ast::Node>,
}

/// Parsed unary tests (a DMN input entry such as `< 10, > 20` or `-`).
#[derive(Debug, Clone)]
pub struct UnaryTests {
    ast: Arc<ast::Node>,
}

fn finish(result: parser::ParseResult) -> Result<Arc<ast::Node>, FeelError> {
    match result.ast {
        Some(ast) if result.errors.is_empty() => Ok(Arc::new(ast)),
        _ => Err(FeelError {
            errors: result.errors,
        }),
    }
}

/// Parses an expression. Multi-word variable names (`order total`) are only
/// recognised when listed in `options.names`.
pub fn parse(source: &str, options: &ParseOptions) -> Result<Expression, FeelError> {
    finish(parser::parse_expression(source, options)).map(|ast| Expression { ast })
}

/// Parses unary tests.
pub fn parse_unary_tests(source: &str, options: &ParseOptions) -> Result<UnaryTests, FeelError> {
    finish(parser::parse_unary_tests(source, options)).map(|ast| UnaryTests { ast })
}

impl Expression {
    pub fn evaluate(&self, context: &Context) -> Value {
        evaluator::evaluate_root(&self.ast, context, None)
    }
}

impl UnaryTests {
    /// Whether `input` satisfies the tests.
    pub fn test(&self, input: &Value, context: &Context) -> bool {
        evaluator::test_unary(&self.ast, input, context)
    }
}

/// Parses and evaluates `source` with `context`'s entries in scope (their names,
/// spaces included, are known to the parser).
pub fn evaluate(source: &str, context: &Context) -> Result<Value, FeelError> {
    let options = ParseOptions {
        names: context.keys().cloned().collect(),
    };
    Ok(parse(source, &options)?.evaluate(context))
}

/// Names of all built-in functions.
pub fn builtin_names() -> impl Iterator<Item = &'static str> {
    bpmnkit_spec::feel::FEEL_BUILTINS.iter().map(|b| b.name)
}
