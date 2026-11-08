use std::fmt;

use bpmnkit_compat::zeebe::DeployabilityError;

/// What TS throws from `expand`, `defaultFlows` and `expandDmn`: the message, and the
/// `DeployabilityError` when it was the deploy gate that refused.
#[derive(Debug, Clone, PartialEq)]
pub struct TextError {
    pub message: String,
    /// Set when `expand`'s gate refused the model (TS throws the `DeployabilityError`
    /// itself); `message` is its message.
    pub deployability: Option<Box<DeployabilityError>>,
}

impl TextError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            deployability: None,
        }
    }
}

impl From<DeployabilityError> for TextError {
    fn from(error: DeployabilityError) -> Self {
        Self {
            message: error.to_string(),
            deployability: Some(Box::new(error)),
        }
    }
}

impl fmt::Display for TextError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for TextError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.deployability
            .as_deref()
            .map(|e| e as &(dyn std::error::Error + 'static))
    }
}
