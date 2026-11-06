//! Lint and optimize: the Rust twin of `@bpmnkit/core`'s `optimize/`, `lint.ts`,
//! `bpmnlint.ts`, `dmn/lint.ts` and `form/lint.ts`. TS is the oracle:
//! `conformance/lint/` and `conformance/optimize/` pin the output.

pub mod optimize;

pub use bpmnkit_compat::finding::{ApplyFixResult, Category, Finding, FindingData, Fix, Severity};
