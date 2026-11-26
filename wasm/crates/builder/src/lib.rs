//! The worker build service: authenticated HTTP API over `bpmnkit-wasm-build`, cargo in a sandbox,
//! successful builds signed and published to a registry.
//!
//! `POST /check` · `POST /builds` → `{id}` · `GET /builds/{id}` · `GET /builds/{id}/events` (NDJSON)

pub mod auth;
pub mod rate;
pub mod sandbox;
pub mod service;

pub use auth::Tokens;
pub use rate::{RateConfig, RateLimiter};
pub use sandbox::{detect, Caps, Isolation, SandboxExecutor};
pub use service::{
    router, sign_entry, warm, BuildEvent, BuildState, BuildStatus, Builder, Config, Published,
    Submitted,
};

/// `n` bytes from the OS CSPRNG.
pub fn random_bytes(n: usize) -> std::io::Result<Vec<u8>> {
    use std::io::Read;
    let mut buf = vec![0; n];
    std::fs::File::open("/dev/urandom")?.read_exact(&mut buf)?;
    Ok(buf)
}
