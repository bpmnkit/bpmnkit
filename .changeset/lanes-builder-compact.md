---
"@bpmnkit/core": minor
---

Lanes and pools can be written: `ProcessBuilder.lane()` and `.participant()`, `DiagramBuilder.withAutoLayout()`, and the compact format's `lanes`, `executable`, `participants` and `messageFlows` keys (with `CompactLane`, `CompactParticipant`, `CompactMessageFlow`). Continuing a laned document puts a new node in its predecessor's lane. `DiagramBuilder` keeps a child process's pool, and writes `isExecutable="false"` for an empty partner process.
