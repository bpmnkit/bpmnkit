mod ast;
mod context;
mod convert;
mod from_ai;
mod lexer;
mod parser;
pub mod types;

pub use context::FeelContext;
pub use from_ai::from_ai_parameters;
pub use types::{FeelError, FeelValue};

/// Check whether an expression string is a FEEL expression.
/// FEEL expressions are prefixed with `=`.
pub fn is_feel_expression(expression: &str) -> bool {
    expression.starts_with('=')
}

/// Parse and evaluate a FEEL expression string with the given context.
///
/// If the expression starts with `=`, it is treated as a FEEL expression and
/// evaluated. Otherwise, it is returned as a string literal.
pub fn parse_and_evaluate(
    expression: &str,
    context: &FeelContext,
) -> Result<FeelValue, FeelError> {
    if let Some(feel_expr) = expression.strip_prefix('=') {
        evaluate(feel_expr.trim(), context)
    } else {
        Ok(FeelValue::String(expression.to_string()))
    }
}

/// Evaluate a FEEL expression string (without the leading `=`) with the given context.
///
/// Evaluation is delegated to `bpmnkit-feel`, which follows the DMN spec: an invalid
/// operation or a missing variable is `null`, so only a syntax error is `Err`.
pub fn evaluate(expression: &str, context: &FeelContext) -> Result<FeelValue, FeelError> {
    let value = bpmnkit_feel::evaluate(expression, &convert::to_feel_context(context))
        .map_err(|e| FeelError::ParseError(e.to_string()))?;
    Ok(convert::from_value(value))
}
