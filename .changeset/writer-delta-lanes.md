---
"@bpmnkit/core": minor
"@bpmnkit/editor": patch
---

`writeProcessText` writes the primary (executable) process with `lane`, `pool` and `msg` lines, and `parseProcessDelta` reads them, with `- msg a > b`; `PROCESS_DELTA_GUIDE` teaches them. The `lane`, `pool` and `msg` keywords are lowercase only. The editor's `applyProcessDelta` changes the primary process, as the writer writes it, even when it is not the first.
