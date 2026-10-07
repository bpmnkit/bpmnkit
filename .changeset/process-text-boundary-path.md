---
"@bpmnkit/core": patch
---

`parseProcessText`: a boundary with several ways out, on a task with none, is read as the task's own path written through its boundary. The first way out stays the boundary's handler; the others continue from the task. Before, the task got a "Process completed" end and the boundary forked into the handler *and* the rest of the work — so "read issues, count them, post to Slack" ran the count and the post only when the read failed.
