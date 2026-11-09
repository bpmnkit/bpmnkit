---
"@bpmnkit/core": patch
---

Reading Flowable Modeler files: a `<definitions>` without an `id` (the schema makes it optional, and the Flowable Modeler omits it) now parses, with `id: ""`, and is written back without one; it used to throw `ParseError`. `isExecutable` is read as an `xsd:boolean`, so `1`/`0` and surrounding whitespace count, and a value that is not a boolean is dropped rather than read as `false`. Nested lanes saved by earlier versions inside a `<laneSet>` (instead of `<childLaneSet>`) are read back instead of lost. `semanticHash` moves only for files that use those spellings or legacy nested lane sets, which previously lost the value or the lanes.
