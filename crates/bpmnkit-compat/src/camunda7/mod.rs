//! `camunda7/`: C7 to C8 migration (`migrate.ts`), JUEL to FEEL (`juel.ts`) and
//! C8 to C7 export (`export.ts`).

pub mod export;
// The translator lives in bpmnkit-bpmn so the serializer-side helpers can use it too.
pub use bpmnkit_bpmn::juel;
pub mod migrate;
