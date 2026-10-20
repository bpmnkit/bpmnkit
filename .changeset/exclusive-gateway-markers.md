---
"@bpmnkit/core": patch
"@bpmnkit/editor": patch
---

Exclusive gateways created outside auto-layout now carry `isMarkerVisible="true"`, so the bpmn-js Viewer draws their "X": shapes from `expand()` of the compact format, the merge gateway inserted by the `flow/multi-incoming-task` fix, and the editor's `createShape`. `changeElementType` into an exclusive gateway sets the marker unless the shape already has a value (#251).
