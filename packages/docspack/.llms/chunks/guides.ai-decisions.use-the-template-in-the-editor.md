# AI Decisions — Use the template in the editor

In the BPMN Kit [editor](/editor), select a service task and pick **Cloudflare Clef Decision**
in the **Connector** list. The panel then shows the template's fields.


## Use the template in Camunda Modeler

To use the template in Desktop Modeler or Web Modeler, write it to a JSON file:

```typescript
import { writeFileSync } from "node:fs"
import { getTemplate } from "@bpmnkit/connectors"

const clef = getTemplate("io.bpmnkit.connectors.CloudflareClef.v1")
writeFileSync(".camunda/element-templates/cloudflare-clef.json", JSON.stringify(clef, null, 2))
```

The template is in the **AI decisions** category of the template chooser.

---
Source: https://bpmnkit.com/docs/guides/ai-decisions
