---
title: "Recipes: Element Templates and Connectors"
description: Apply an element template or connector to a service task, find a template's property ids with the casen CLI, and set values by property id.
sidebar:
  order: 20
---

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

## How do I find a connector template's property ids?

Use the `casen` CLI. `connector show` with `--condensed` prints one line per property: the id you
pass as a value, its type, default, whether it is required and the condition that switches it on.
`--filter` keeps the properties whose key or label contains the text.

```sh
casen connector show io.camunda.connectors.HttpJson.v2 --condensed --filter retry
casen connector search slack
```

The same ids apply to the file-based command, which edits a `.bpmn` in place:

```sh
casen connector apply order.bpmn call-api http --set url=https://example.com --set retryCount=5
```

In code, `propertyKey(prop)` from `@bpmnkit/core/connectors` returns the same id for each entry
of `getTemplate(id)?.properties`.
