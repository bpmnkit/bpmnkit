---
"@bpmnkit/drop": minor
---

The editor on a drop gets a properties panel: select one element to see and change its configuration — name, task type, connector inputs, conditions, timers. It is fetched as its own chunk once the editor is open, so neither readers nor the editor's start wait for the connector templates, and it opens beside an open side panel (Ask AI, history, comments) instead of covering it.
