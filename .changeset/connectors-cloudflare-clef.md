---
"@bpmnkit/connectors": minor
---

New template: **Cloudflare Clef Decision** (`io.bpmnkit.connectors.CloudflareClef.v1`). It asks a Clef decision model typed yes/no, choice and score questions and returns calibrated answers that a gateway can route on. It runs on Camunda's REST connector, so no extra job worker is needed. It is the first template this repo maintains itself: `BPMNKIT_CONNECTOR_TEMPLATES` holds such templates beside the generated `CAMUNDA_CONNECTOR_TEMPLATES`, and `listConnectors`, `searchConnectors` and `getTemplate` include them. `ElementTemplate` gains the schema's optional `category`.
