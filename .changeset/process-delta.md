---
"@bpmnkit/core": minor
"@bpmnkit/editor": minor
---

Change an existing diagram from a model's answer, keeping its layout.

- `writeProcessText(defs)` (core) writes the first process of a document in the line format, so a model can read a diagram someone drew. Nodes are written under short name-derived aliases, returned with the text as an alias → element id map. Sub-processes are written as the fixed kinds `sub` / `adhoc` / `transaction`, and complex gateways as `complex`. Lanes, data objects, annotations and the inside of a sub-process are left out.
- `parseProcessDelta(text)` and `PROCESS_DELTA_GUIDE` (core) read a change script: the line format, but only what changes. It adds `- x` / `- a > b` removals and `@n ids` lines that tie a change to a feedback item. It never throws, and it keeps conditions as written.
- `applyProcessDelta(defs, delta, { aliases })` (editor, also in `@bpmnkit/editor/headless`) applies a change script through the editor's modelling functions:
  - New nodes are placed beside what they follow.
  - An insert between connected nodes replaces their flow, keeps its condition or default, and moves only the shapes right of it.
  - Removing a node joins its neighbours.
  - New nodes join their lane.
  - Anything the script does not mention is unchanged, down to the byte.
- `parseProcessText` and `parseProcessDelta` now share one path tokenizer and one FEEL check. The FEEL check is exported as `conditionOrLabel`. `parseProcessText`'s behaviour is unchanged.
- A node retyped into a service, send or business rule task, and a new business rule task, gets the job type or decision it needs to deploy: the written id, as in a parsed draft. Each one is listed in `fixes`.
- A removal line takes one id, a comma-separated list, or `a > b`. A prose bullet ("- review is removed") is a problem and removes nothing.
- An `@` line can name a node the same script removes; it resolves to the removed id.
- Removing the only step on a branch of a parallel split or event-based gateway no longer joins its neighbours into an empty branch.
