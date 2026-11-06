//! Twin of `bpmn/auto-layout.ts`.

use crate::engine::LayoutEngine;
use crate::types::LayoutHints;
use bpmnkit_bpmn::model::BpmnDefinitions;

/// `applyAutoLayout(defs, engine, hints)`: a new model with every DI position computed.
pub fn apply_auto_layout(
    defs: &BpmnDefinitions,
    engine: LayoutEngine,
    hints: Option<&LayoutHints>,
) -> BpmnDefinitions {
    let _ = (defs, engine, hints);
    todo!("port bpmn/auto-layout.ts")
}
