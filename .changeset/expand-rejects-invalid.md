---
"@bpmnkit/core": minor
---

`expand()` rejects a compact diagram that cannot become valid BPMN instead of emitting broken XML. It checks for:

- a flow or boundary event that names an element outside its scope
- a duplicate id
- a missing element or flow id
- an unknown `eventType`

It used to drop an unknown `eventType` silently. The error lists every problem in one message, so a model-written diagram can be sent back for repair.
