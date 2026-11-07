//! Fluent BPMN and DMN builders: the Rust twin of `@bpmnkit/core`'s `bpmn/bpmn-builder.ts`,
//! `dmn/dmn-builder.ts` and `dmn/drd-builder.ts`. TS is the oracle: the built model's JSON,
//! its serialized XML and every error message match.
//!
//! TS throws at the call that went wrong; here the first error is kept and returned by
//! `build()` (see `shared.rs`), and every call after it does nothing.

// skeleton: removed once ported
#![allow(
    unused_variables,
    dead_code,
    unused_imports,
    unused_mut,
    clippy::ptr_arg
)]

pub mod branch;
pub mod diagram;
pub mod dmn;
pub mod drd;
mod elements;
pub mod facade;
pub mod options;
pub mod process;
mod shared;
pub mod subprocess;

pub use branch::BranchBuilder;
pub use diagram::DiagramBuilder;
pub use dmn::DecisionTableBuilder;
pub use drd::{
    drg_id, DecisionHandle, DrdBuilder, DrdDecisionOptions, DrgId, DrgRef, InputDataHandle,
};
pub use facade::{Bpmn, Dmn};
pub use options::*;
pub use process::ProcessBuilder;
pub use shared::BuildError;
pub use subprocess::SubProcessContentBuilder;
