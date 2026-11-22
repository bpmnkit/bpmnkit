---
"@bpmnkit/core": patch
"@crates/bpmnkit-layout": patch
---

Auto-layout: boundary handlers stay straight under their hosts and a gateway branch that would cross their row goes above the spine; loops stay inside their pool; `placeNewShapes` keeps a loop back off another flow's port and puts a boundary event's name beside its outgoing flow.
