---
"@bpmnkit/connectors": patch
---

`validateElementTemplate` rejects `feel: "static"` on a property that is not `Number` or `Boolean`, as Camunda's element-template schema does — Camunda Modeler refuses the whole template over it. The Cloudflare Clef Decision template's timeouts are now `Number` fields with `=20`, like Camunda's REST connector, so the template loads in Modeler.
