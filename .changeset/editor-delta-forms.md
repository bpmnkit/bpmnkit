---
"@bpmnkit/editor": minor
---

Change scripts (`applyProcessDelta`) apply `form=`, `in.`/`out.` mappings, `note <id>: text` and `doc <id>: text` to existing and new nodes, including tools inside an ad-hoc sub-process; restating what a node already has changes nothing.
