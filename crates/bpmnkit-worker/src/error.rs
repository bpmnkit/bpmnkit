use std::fmt;

/// What went wrong talking to the cluster.
#[derive(Debug)]
pub enum Error {
    /// The server answered with a non-success status; `body` is the RFC 9457 problem detail as sent.
    Http { status: u16, body: String },
    /// Connect, TLS, timeout or protocol failure before a status arrived.
    Transport(reqwest::Error),
    /// The token endpoint refused or answered something that is not a token.
    Auth(String),
    /// A success response whose body is not the documented shape.
    Decode(String),
    /// Invalid configuration (address, credentials, environment).
    Config(String),
}

impl Error {
    /// Whether the activation loop should back off and retry instead of treating it as a bug:
    /// throttling, unavailability, server faults and network errors.
    pub fn is_transient(&self) -> bool {
        match self {
            Error::Http { status, .. } => *status == 429 || *status >= 500,
            Error::Transport(_) => true,
            Error::Auth(_) | Error::Decode(_) | Error::Config(_) => false,
        }
    }

    /// The HTTP status, when the server answered.
    pub fn status(&self) -> Option<u16> {
        match self {
            Error::Http { status, .. } => Some(*status),
            Error::Transport(e) => e.status().map(|s| s.as_u16()),
            _ => None,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Http { status, body } => write!(f, "HTTP {status}: {body}"),
            Error::Transport(e) => write!(f, "transport: {e}"),
            Error::Auth(m) => write!(f, "auth: {m}"),
            Error::Decode(m) => write!(f, "decode: {m}"),
            Error::Config(m) => write!(f, "config: {m}"),
        }
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Error::Transport(e) => Some(e),
            _ => None,
        }
    }
}

impl From<reqwest::Error> for Error {
    fn from(e: reqwest::Error) -> Self {
        Error::Transport(e)
    }
}
