//! REST API layer (Axum) for the Reebe workflow engine.
//!
//! Implements all `/v2/*` endpoints with RFC 7807 error responses,
//! cursor-based pagination, and long-polling for job activation.

pub mod app;
pub mod auth;
pub mod authorization;
pub mod dto;
pub mod error;
pub mod handlers;
pub mod pagination;
pub mod tenant;
#[allow(clippy::module_inception)]
pub mod tests;

pub use app::{create_app, ApiState};
pub use auth::AuthConfig;
pub use error::{ApiError, ApiResult, ProblemDetail};
