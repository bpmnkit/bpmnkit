---
"@bpmnkit/core": patch
---

The round trip keeps what Flowable reads: a `<definitions>` without an `id` (as the Flowable Modeler exports it) parses and is written back without one, `isExecutable="false"` is kept instead of dropped (Flowable reads an absent attribute as executable), and a nested lane set is written as `<childLaneSet>` rather than an invalid `<laneSet>` (files saved that way are read back). Files that say `isExecutable="false"` get a new `semanticHash`.
