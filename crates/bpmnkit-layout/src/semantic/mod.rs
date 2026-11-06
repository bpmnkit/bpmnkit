//! Twin of `layout/semantic/index.ts`.

pub mod bands;
pub mod graph;
pub mod place;
pub mod route;

use crate::types::{GridHint, LayoutResult};
use bpmnkit_bpmn::model::BpmnProcess;
use indexmap::{IndexMap, IndexSet};

/// `semanticLayoutProcess(process, collapsed, grids)`.
pub fn semantic_layout_process(
    process: &BpmnProcess,
    collapsed: &IndexSet<String>,
    grids: Option<&IndexMap<String, GridHint>>,
) -> LayoutResult {
    let _ = (process, collapsed, grids);
    todo!("port semantic/index.ts")
}
