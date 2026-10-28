---
"@bpmnkit/core": minor
---

Swimlane helpers (`allLanes`, `leafLanes`, `laneOf`, `assignLane`, `pruneLaneRefs`, `buildLaneSet`, `laneForNewNode`, `primaryProcess`, `poolLanedProcesses`, `laneProblems`, `collaborationProblems`), and auto-layout for nested lanes: each level is inset by its header, nodes in no lane stay inside their pool, and a laned process without nodes still gets lane bands. `DiagramBuilder` now refuses a diagram with a collaboration in which a process with content has no participant.
