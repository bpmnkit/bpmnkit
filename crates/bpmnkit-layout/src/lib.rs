//! BPMN and DMN auto-layout, the Rust twin of `@bpmnkit/core`'s `applyAutoLayout`
//! (`bpmn/auto-layout.ts`, `layout/`) and `layoutDmn` (`dmn/dmn-layout.ts`).
//!
//! The port follows the TS line by line so coordinates match exactly: JS `Map`/`Set`
//! become [`indexmap`] (insertion order is observable), `Math.round` is [`js::round`],
//! and string lengths count UTF-16 units ([`js::len`]).

pub mod annotations;
pub mod auto_layout;
pub mod collaboration;
pub mod dmn;
pub mod engine;
pub mod grid;
pub mod hash;
pub mod js;
pub mod orthogonal;
pub mod overlap;
pub mod repair;
pub mod semantic;
pub mod types;

pub use auto_layout::apply_auto_layout;
pub use dmn::layout_dmn;
pub use engine::{layout_flow_nodes, layout_process, LayoutEngine};
pub use types::*;
