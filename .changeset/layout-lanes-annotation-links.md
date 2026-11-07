---
"@bpmnkit/core": patch
---

Auto-layout draws the lanes of a process that is not inside a pool: lane shapes now sit on the process's own plane (lane header at the left edge, content moved clear of it), where before the semantic engine grouped nodes into lane bands that were never drawn. An association between two text annotations is now drawn, and an annotation linked only to another annotation is placed beside that annotation's element instead of at the fallback position.
