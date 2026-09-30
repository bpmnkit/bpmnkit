---
"@bpmnkit/core": patch
---

`parseProcessText` handles more of what real model answers do. Each rule below was replayed on recorded benchmark answers before it was kept:

- An id used but never declared becomes a task named from the id (`send_email` becomes "Send email"). Its flows and boundaries are kept instead of dropped.
- An id declared again after an arrow, with a different kind or name, becomes a new node (`done_2`). A bare reference to the id after that means the newest node.
- Restated exactly, or at the start of a line, the id means the node already there.
- A boundary event is always a new node, attached to what its `on=` meant before it was declared.
- `>(label) > next` and `id [spec]`, with a space before the bracket, both parse.
- A rule task without a decision takes its id as decision id.
