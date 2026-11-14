---
"@bpmnkit/editor": minor
---

Pools and lanes can be edited. Edits land in the primary (executable) process and the diagram that draws it, wherever the file lists them; the canvas shows that process, and other processes' nodes are locked. New ops `addParticipant`, `addLane` and `space`; a pool tool, `editor.addLane()`, `editor.divideLanes()` and a swimlane context bar (Add lane, Divide, Connect, Edit label, Delete). Lane membership follows the drawing on move, create, paste and quick add; pools grow, push the pools beside them and shrink back; lanes and black-box pools can be deleted with their message flows. Connecting across pools draws a message flow. `applyProcessDelta` applies `lane`, `pool` and `msg` lines and keeps the layout. Edits no longer leave float noise in the diagram interchange; an op that changes nothing adds no undo step; a document without diagram interchange is laid out on load.
