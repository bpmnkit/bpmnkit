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

/// The shared FEEL context for `context` (for crates that call `bpmnkit-*` directly).
pub fn to_shared_context(context: &FeelContext) -> bpmnkit_feel::Context {
    convert::to_feel_context(context)
}

/// Reebe's value for a shared FEEL value.
pub fn from_shared_value(value: bpmnkit_feel::Value) -> FeelValue {
    convert::from_value(value)
}

/// Check whether an expression string is a FEEL expression.
/// FEEL expressions are prefixed with `=`.
pub fn is_feel_expression(expression: &str) -> bool {
    expression.starts_with('=')
}

/// Parse and evaluate a FEEL expression string with the given context.
///
/// If the expression starts with `=`, it is treated as a FEEL expression and
/// evaluated. Otherwise, it is returned as a string literal.
pub fn parse_and_evaluate(expression: &str, context: &FeelContext) -> Result<FeelValue, FeelError> {
    if let Some(feel_expr) = expression.strip_prefix('=') {
        evaluate(feel_expr.trim(), context)
    } else {
        Ok(FeelValue::String(expression.to_string()))
    }
}

/// A value with the failures FEEL suppressed into `null` while computing it,
/// each formatted as Zeebe prints them (`[NO_VARIABLE_FOUND] No variable found with name 'x'`).
#[derive(Debug, Clone, PartialEq)]
pub struct Evaluated {
    pub value: FeelValue,
    pub warnings: Vec<String>,
}

impl Evaluated {
    /// The suffix Zeebe appends to an incident when a result has the wrong type;
    /// empty when nothing was suppressed.
    pub fn warnings_suffix(&self) -> String {
        if self.warnings.is_empty() {
            String::new()
        } else {
            format!(
                " The evaluation reported the following warnings:\n{}",
                self.warnings.join("\n")
            )
        }
    }
}

/// [`evaluate`], also reporting the suppressed failures. Zeebe raises no incident for
/// them on their own: only where the null is not an accepted result.
pub fn evaluate_with_warnings(
    expression: &str,
    context: &FeelContext,
) -> Result<Evaluated, FeelError> {
    let ev =
        bpmnkit_feel::evaluate_with_diagnostics(expression, &convert::to_feel_context(context))
            .map_err(|e| FeelError::ParseError(e.to_string()))?;
    Ok(Evaluated {
        value: convert::from_value(ev.value),
        warnings: ev.warnings.iter().map(ToString::to_string).collect(),
    })
}

/// [`parse_and_evaluate`], also reporting the suppressed failures.
pub fn parse_and_evaluate_with_warnings(
    expression: &str,
    context: &FeelContext,
) -> Result<Evaluated, FeelError> {
    match expression.strip_prefix('=') {
        Some(feel_expr) => evaluate_with_warnings(feel_expr.trim(), context),
        None => Ok(Evaluated {
            value: FeelValue::String(expression.to_string()),
            warnings: Vec::new(),
        }),
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
