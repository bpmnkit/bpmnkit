---
"@bpmnkit/editor": minor
---

`applyProcessDelta` applies change-script `lane`, `pool` and `msg` lines, `- msg`, and `- <lane>` / `- <black-box pool>` removals, keeping the layout. It acts on the primary process and the diagram that draws it, leaves other processes untouched, and drops message flows whose node a script removes.
