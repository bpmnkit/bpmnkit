---
"@bpmnkit/core": minor
"@bpmnkit/cli": patch
"@crates/bpmnkit-builder": minor
"@crates/bpmnkit-lint": patch
"@crates/bpmnkit-layout": patch
---

Builder fixes for coding agents: nested `branch()` inside sub-processes no longer drops elements; an empty branch throws; message-flow endpoint errors suggest close ids; `branch(name)` no longer labels parallel/event-based gateway flows; `correlationKey` on message end/throw events; `DiagramBuilder.message()` merges into an existing message; a 2nd incoming flow into a task gets an exclusive `<id>_merge` gateway; edits give new event definitions ids; `placeNewShapes` reports overlapping new shapes; `dataObjectReference` declares its data object; data associations get ids and DI edges; root `bpmn:dataStore`; lint skips data elements in `flow/unreachable`/`flow/dead-end`; `DiagramBuilder.build()` reports ids reused across pools. BPMN agent card: path decision rule, compact example, one gate, stop rule.
