---
"@bpmnkit/core": minor
---

Add `Dmn.drd()` builder for multi-decision DRDs: `decision()` returns typed handles, `requires` takes a handle or `drgId()` and throws at build time on unknown ids (listing valid ids, suggesting the id when a label is passed). `expandDmn` now throws on dangling `requires`.
