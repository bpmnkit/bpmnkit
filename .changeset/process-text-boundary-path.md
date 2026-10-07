---
"@bpmnkit/core": patch
---

`parseProcessText`: a boundary leads only to the handling of what it catches. When a model writes the work that follows a task through its boundary (`read > err[boundary:error … | on=read] > handle`, then `err > count > post`), the ways out that are not named for handling (failure, error, notify, retry, … — the first when none is) move onto the task, and a bare end event the task led to is dropped. Before, the task got a "Process completed" end and the boundary forked into the handler *and* the rest of the work — so "read issues, count them, post to Slack" counted and posted only when the read failed. The guide now states the rule too.
