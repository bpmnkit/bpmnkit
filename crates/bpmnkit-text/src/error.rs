use std::fmt;

/// What TS throws from `expand`, `defaultFlows` and `expandDmn`: the message only.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TextError {
    pub message: String,
}

impl TextError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl fmt::Display for TextError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for TextError {}
