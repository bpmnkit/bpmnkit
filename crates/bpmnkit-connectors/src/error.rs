use std::fmt;

/// Everything this crate can refuse with. Messages follow the TS twin where the TS throws.
#[derive(Debug)]
pub enum Error {
    /// The OpenAPI/Swagger text could not be read or is not a usable document.
    Spec(String),
    /// BPMN XML that does not parse.
    Bpmn(String),
    /// Writing template files failed.
    Io(std::io::Error),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Spec(m) | Error::Bpmn(m) => f.write_str(m),
            Error::Io(e) => write!(f, "{e}"),
        }
    }
}

impl std::error::Error for Error {}

impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        Error::Io(e)
    }
}
