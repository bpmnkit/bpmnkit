---
"@bpmnkit/core": minor
"@bpmnkit/cli": patch
"@crates/bpmnkit-layout": minor
---

Auto-layout composes cleaner diagrams: one frame for all pools, crossing-aware pool order, stacked message tracks, a 10 px grid phase, artifacts under their task, an exception row for boundary handlers, shared columns for detours, and compacted lanes. New opt-in `engine: "layered"` (Sugiyama-style) next to the default `semantic` engine. `pnpm layout:score` scores layouts against a ratchet baseline.
