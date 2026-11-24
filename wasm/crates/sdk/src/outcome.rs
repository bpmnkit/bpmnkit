use crate::bindings::bpmnkit::worker::types as wit;
use serde_json::Value;

/// What to do with the job. Build with [`Outcome::complete`], [`Outcome::fail`] or
/// [`Outcome::throw_error`].
#[derive(Debug, Clone, PartialEq)]
pub enum Outcome {
    /// Complete; the JSON object is merged into the process variables (`null` = none).
    Complete(Value),
    /// Fail; the engine retries until `retries` reaches 0, then raises an incident.
    Fail {
        message: String,
        /// Retries left; `None` = the job's current retries minus one.
        retries: Option<u32>,
        backoff_ms: Option<u64>,
    },
    /// Throw a BPMN error, caught by an error boundary event with this code.
    ThrowError {
        code: String,
        message: String,
        variables: Option<Value>,
    },
}

impl Outcome {
    pub fn complete(variables: Value) -> Self {
        Self::Complete(variables)
    }

    pub fn fail(message: impl Into<String>) -> Self {
        Self::Fail {
            message: message.into(),
            retries: None,
            backoff_ms: None,
        }
    }

    pub fn throw_error(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::ThrowError {
            code: code.into(),
            message: message.into(),
            variables: None,
        }
    }

    /// Fail without retrying: raise an incident now. No effect on other outcomes.
    pub fn no_retry(self) -> Self {
        self.retries(0)
    }

    /// Fail with this many retries left. No effect on other outcomes.
    pub fn retries(mut self, n: u32) -> Self {
        if let Self::Fail { retries, .. } = &mut self {
            *retries = Some(n);
        }
        self
    }

    /// Wait this long before the retry. No effect on other outcomes.
    pub fn backoff_ms(mut self, ms: u64) -> Self {
        if let Self::Fail { backoff_ms, .. } = &mut self {
            *backoff_ms = Some(ms);
        }
        self
    }

    /// Variables set at the error's catch event. No effect on other outcomes.
    pub fn with_variables(mut self, v: Value) -> Self {
        if let Self::ThrowError { variables, .. } = &mut self {
            *variables = Some(v);
        }
        self
    }

    pub(crate) fn into_wit(self) -> wit::Outcome {
        match self {
            Self::Complete(v) => match object_json(v, "Outcome::complete") {
                Ok(s) => wit::Outcome::Complete(s.unwrap_or_else(|| "{}".into())),
                Err(f) => f,
            },
            Self::Fail {
                message,
                retries,
                backoff_ms,
            } => wit::Outcome::Fail(wit::Failure {
                message,
                retries,
                retry_backoff_ms: backoff_ms,
            }),
            Self::ThrowError {
                code,
                message,
                variables,
            } => {
                let variables = match variables.map(|v| object_json(v, "Outcome::with_variables")) {
                    None => None,
                    Some(Ok(s)) => s,
                    Some(Err(f)) => return f,
                };
                wit::Outcome::ThrowError(wit::BpmnError {
                    code,
                    message,
                    variables,
                })
            }
        }
    }
}

/// Process variables must be a JSON object; `null` means none. Anything else is a worker bug,
/// reported as a fail without retry so it surfaces as an incident.
fn object_json(v: Value, what: &str) -> Result<Option<String>, wit::Outcome> {
    match v {
        Value::Null => Ok(None),
        Value::Object(_) => Ok(Some(v.to_string())),
        other => Err(
            Outcome::fail(format!("{what} needs a JSON object, got {other}"))
                .no_retry()
                .into_wit(),
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// The generated WIT types derive Debug, not PartialEq.
    fn d(o: wit::Outcome) -> String {
        format!("{o:?}")
    }

    #[test]
    fn complete_object() {
        assert_eq!(
            d(Outcome::complete(json!({"ok": true})).into_wit()),
            d(wit::Outcome::Complete(r#"{"ok":true}"#.into()))
        );
    }

    #[test]
    fn complete_null_is_empty_object() {
        assert_eq!(
            d(Outcome::complete(Value::Null).into_wit()),
            d(wit::Outcome::Complete("{}".into()))
        );
    }

    #[test]
    fn complete_non_object_fails_without_retry() {
        match Outcome::complete(json!([1])).into_wit() {
            wit::Outcome::Fail(f) => {
                assert_eq!(f.retries, Some(0));
                assert!(f.message.contains("needs a JSON object"), "{}", f.message);
            }
            o => panic!("{o:?}"),
        }
    }

    #[test]
    fn fail_builders() {
        assert_eq!(
            d(Outcome::fail("x").backoff_ms(5_000).into_wit()),
            d(wit::Outcome::Fail(wit::Failure {
                message: "x".into(),
                retries: None,
                retry_backoff_ms: Some(5_000),
            }))
        );
        assert_eq!(
            Outcome::fail("x").no_retry(),
            Outcome::Fail {
                message: "x".into(),
                retries: Some(0),
                backoff_ms: None
            }
        );
        assert_eq!(
            Outcome::fail("x").retries(2),
            Outcome::Fail {
                message: "x".into(),
                retries: Some(2),
                backoff_ms: None
            }
        );
    }

    #[test]
    fn builders_ignore_other_variants() {
        let c = Outcome::complete(json!({}));
        assert_eq!(
            c.clone()
                .no_retry()
                .backoff_ms(1)
                .with_variables(json!({"a": 1})),
            c
        );
        let t = Outcome::throw_error("C", "m");
        assert_eq!(t.clone().no_retry().backoff_ms(1), t);
    }

    #[test]
    fn throw_error_with_variables() {
        assert_eq!(
            d(Outcome::throw_error("PAYMENT_DECLINED", "card declined")
                .with_variables(json!({"reason": "funds"}))
                .into_wit()),
            d(wit::Outcome::ThrowError(wit::BpmnError {
                code: "PAYMENT_DECLINED".into(),
                message: "card declined".into(),
                variables: Some(r#"{"reason":"funds"}"#.into()),
            }))
        );
    }

    #[test]
    fn throw_error_non_object_variables_fail() {
        assert!(matches!(
            Outcome::throw_error("C", "m")
                .with_variables(json!(1))
                .into_wit(),
            wit::Outcome::Fail(_)
        ));
    }
}
