# Recipes: Forms and User Tasks

Recipes for the human side of a Camunda 8 process: the form on a start event and the
assignment of a user task.


## How do I set a start event form?

Pass `formId` to `startEvent`. It writes a `zeebe:formDefinition` with that id; the form itself
is a Camunda Form deployed to the cluster.

```typescript
import { Bpmn } from "@bpmnkit/core"

const defs = Bpmn.createProcess("request")
	.executable(true)
	.startEvent("start", { name: "Request received", formId: "request-form" })
	.endEvent("end")
	.build()

console.log(Bpmn.export(defs))
```

---
Source: https://bpmnkit.com/docs/guides/recipes-forms-and-user-tasks
