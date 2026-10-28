---
"@bpmnkit/editor": minor
---

New ops `addParticipant` (first pool wraps the process, later ones are black boxes) and `addLane` (above or below a lane or pool; the first add makes two lanes), a pool tool, `editor.addLane()` and `editor.divideLanes()`, and a swimlane context bar with Add lane, Divide, Connect from a black box, Edit label and Delete. Cut leaves lanes and pools, an unchanged label adds no undo step.
