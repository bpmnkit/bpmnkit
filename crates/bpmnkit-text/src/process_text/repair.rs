//! Port of `bpmn/process-text.ts` lines 1217–1622: the `if (final) { … }` block of
//! `assemble()` — boundary paths, a single blank start, missing starts, reachability,
//! loose fragments, ends, loop exits, rows between and-gateways, pass-through gateways,
//! implicit splits. Runs only for the final result, after defaults and before joins.
//!
//! Porter notes:
//! - TS reassigns `edges` (`edges = edges.filter(…)`) and deletes nodes inside loops over
//!   `[...nodes.values()]` snapshots: iterate over a snapshot of ids, re-check presence.
//! - `reach`, `addEnds` and `dedupe` are closures called several times; make them private
//!   methods here.
//! - Ids for added starts, ends and gateways come from `slug::unique_id(.., &mut taken)`.
//! - Every `asks.push` captures values (`targetIds` is read when pushed, names when asked).

use super::assemble::Assembly;

impl Assembly {
    /// The `if (final)` repair block of TS's `assemble()`.
    pub(crate) fn repair(&mut self) {
        todo!()
    }
}
