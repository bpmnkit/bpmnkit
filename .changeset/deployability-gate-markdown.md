---
"@bpmnkit/markdown": patch
---

A `bpmn-compact` / `bpmn-json` block that would not deploy on Camunda 8 (a service task without a job type, a message without a key) renders again: drawing a sketch is not a deployment, so it expands without the deploy gate.
