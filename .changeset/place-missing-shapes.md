---
"@bpmnkit/core": minor
"@bpmnkit/cli": patch
"@bpmnkit/docspack": patch
---

`placeMissingShapes(definitions)` gives the elements, flows and message flows an edit added diagram interchange without moving any existing shape: each new node goes next to the node it connects to, inside its pool, lane or expanded sub-process, clear of other shapes, and new connections are routed around what is drawn. A pool or lane grows to the right only when it has no free room, and a flow re-pointed at a new element (as `continueProcess().insertAfter()` does) is re-routed. The BPMN agent card's edit example now inserts a task and calls it before `exportPreserving`.
