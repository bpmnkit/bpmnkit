---
"@bpmnkit/core": minor
"@bpmnkit/editor": minor
---

Script tasks that compute FEEL, from the line format and from change scripts.

- `CompactElement.script` is a script task's FEEL expression, written as `zeebe:script` (with `resultVariable`) and read back by `compactify`; an `update` operation can patch it.
- The line format takes `result=<variable>` and `feel=<expression>` (last, so the expression keeps its spaces and commas): `count[script Count open issues | result=openCount feel=count(issues[state = "open"])]`. `feel=` on a plain task makes it a script task; an expression that is not FEEL is kept and reported. `writeProcessText` writes them back.
- `PROCESS_TEXT_GUIDE` tells the model that a step working only on process data — count, sum, filter, compare, format — is such a script task, reading what earlier steps stored with `result=`.
- `parseProcessDelta` and `applyProcessDelta` (`@bpmnkit/editor`) read and apply `result=` and `feel=`, so the AI chat in the editor can add or change one.
