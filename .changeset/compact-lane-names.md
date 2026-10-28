---
"@bpmnkit/core": patch
---

`reconcileCompact` removes the name of a lane, pool or message flow its compact entry lists without one, as `compactify` writes it; `writeProcessText` writes the pools and messages of the collaboration that holds the process's own pool, not always the first collaboration.
