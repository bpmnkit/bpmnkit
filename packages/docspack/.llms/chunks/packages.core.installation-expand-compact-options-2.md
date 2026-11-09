# @bpmnkit/core — Installation — `expand(compact, options?)` (2)

- a flow that names an element outside its own scope (a sub-process's flows see only that
  sub-process's children)
- a boundary event without a host in the same scope
- a duplicate id, across elements, flows and processes
- a missing element or flow id
- an unknown `eventType`

The error lists every problem in one message. It does this so that a diagram written by a language
model can be sent back with the list instead of being turned into XML that a modeler rejects later.

---
Source: https://bpmnkit.com/docs/packages/core
