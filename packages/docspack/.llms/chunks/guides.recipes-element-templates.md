# Recipes: Element Templates and Connectors

To apply an element template to a task, such as the REST connector, call `applyTemplateToElement`
in a script or `casen connector apply` from the command line. An element template (connector
template) sets a task's job type, headers and input mappings by property id.


## How do I apply an element template to a service task?

Parse the model, pick a template from the bundled catalog, and call `applyTemplateToElement(defs, id, template, values)`
from `@bpmnkit/core/connectors`. It returns a copy of the model plus a `problems` list. The
`values` are keyed by the template's property ids (`retryCount`, `url`, `method`), not by the
Zeebe attribute they write to (`retries`).

```typescript
import { Bpmn } from "@bpmnkit/core"
import { applyTemplateToElement, getTemplate } from "@bpmnkit/core/connectors"

const defs = Bpmn.createProcess("fetch-order")
	.executable(true)
	.startEvent("start")
	.serviceTask("call-api", { name: "Call API", taskType: "placeholder" })
	.endEvent("end")
	.build()

const template = getTemplate("io.camunda.connectors.HttpJson.v2")
if (!template) throw new Error("template not bundled")

const { definitions, problems } = applyTemplateToElement(defs, "call-api", template, {
	method: "GET",
	url: "https://example.com/orders/1",
	retryCount: "5",
})
if (problems.length > 0) throw new Error(problems.map((p) => p.message).join("; "))

console.log(Bpmn.export(definitions))
```

The call is deterministic and idempotent. It refuses (returns `problems`, model unchanged) when
the template's `appliesTo` does not cover the element. A template id such as
`io.camunda.connectors.HttpJson.v2` is a key into `BUNDLED_CONNECTOR_TEMPLATES`;
`searchConnectors("http")` finds ids by keyword.

---
Source: https://bpmnkit.com/docs/guides/recipes-element-templates
