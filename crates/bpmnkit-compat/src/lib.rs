//! Camunda 8 compatibility checks and Camunda 7 migration: the Rust twin of
//! `@bpmnkit/core`'s `camunda-compat.ts`, `camunda-compat-feel.ts` and `camunda7/`.
//! TS is the oracle: `conformance/compat/` and `conformance/migrate/` pin the output.
//!
//! The finding type lives here, not in `bpmnkit-lint`, because the compatibility
//! check reports through it and `bpmnkit-lint` builds on this crate.

pub mod camunda7;
pub mod compat;
pub mod finding;

pub use finding::{ApplyFixResult, Category, Finding, FindingData, Fix, Severity};
