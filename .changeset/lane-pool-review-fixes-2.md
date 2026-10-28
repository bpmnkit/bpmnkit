---
"@bpmnkit/core": patch
"@bpmnkit/editor": patch
---

More lane and pool fixes from the branch review. `reconcileCompact` throws when a compact lane takes the id of a lane set the document keeps, at any depth, instead of exporting two elements with one id. Parsing a `bpmnkit:primaryProcess` pin keeps the namespace declaration while an element or attribute in the document still uses its prefix, so the export stays namespace-valid XML. In the editor, a change script's unconnected node that widens the own pool pushes the pools beside it right, as a resize does, instead of drawing the pool over a partner.
