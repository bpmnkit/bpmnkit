---
"@bpmnkit/connectors": minor
"@bpmnkit/cli": patch
---

`@bpmnkit/connectors` exports `applyTemplates`, which the CLI's `connector` command imports. It was added without a release, so the published CLI 1.5.0 (`@bpmnkit/connectors: ^1.3.1`) crashed on start against connectors 1.3.1. The CLI release raises its dependency range to the connectors version that has the export.
