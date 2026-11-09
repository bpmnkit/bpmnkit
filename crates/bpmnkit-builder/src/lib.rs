//! Fluent BPMN and DMN builders: the Rust twin of `@bpmnkit/core`'s `bpmn/bpmn-builder.ts`,
//! `dmn/dmn-builder.ts` and `dmn/drd-builder.ts`. TS is the oracle: the built model's JSON,
//! its serialized XML and every error message match.
//!
//! TS throws at the call that went wrong; here the first error is kept and returned by
//! `build()` (see `shared.rs`), and every call after it does nothing.
//!
//! ```
//! use bpmnkit_builder::Bpmn;
//! use bpmnkit_bpmn::serialize_bpmn;
//!
//! let definitions = Bpmn::create_process("order")
//!     .start_event(Some("start"), None)
//!     .end_event(Some("end"), None)
//!     .build(None)
//!     .unwrap();
//! assert!(serialize_bpmn(&definitions).contains(r#"<bpmn:process id="order""#));
//! ```

pub mod branch;
pub mod diagram;
pub mod dmn;
pub mod drd;
mod elements;
pub mod facade;
pub mod options;
pub mod process;
mod rules;
mod shared;
pub mod subprocess;
mod xsd_guards;

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
