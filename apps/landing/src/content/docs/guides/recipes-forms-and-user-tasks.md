---
title: "Recipes: Forms and User Tasks"
description: Set a start-event form, and set the assignee, candidate groups, due date and priority of a user task, in a builder script, with applyBpmnOperations, or with the MCP update_element tool.
sidebar:
  order: 21
---

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

## How do I set the assignee of a user task?

While building, pass `assignee`, `candidateGroups`, `candidateUsers`, `dueDate`, `followUpDate`
and `priority` to `userTask`. They write `zeebe:assignmentDefinition`, `zeebe:taskSchedule` and
`zeebe:priorityDefinition`. A FEEL expression must start with `=`; `priority` is 0 to 100.

```typescript
import { Bpmn } from "@bpmnkit/core"

const defs = Bpmn.createProcess("review")
	.executable(true)
	.startEvent("start")
	.userTask("review", {
		name: "Review request",
		assignee: "alice",
		candidateGroups: "reviewers,managers",
		dueDate: "P2D",
		priority: 80,
	})
	.endEvent("end")
	.build()

console.log(Bpmn.export(defs))
```

## How do I change the assignee, due date or priority of an existing user task?

Use an `update` operation with `applyBpmnOperations`. The patch takes the same field names, and
an empty string clears the field. A field the element cannot carry (an assignee on a service
task) is an error, and in strict mode (the default) nothing is applied.

```typescript
import { Bpmn, applyBpmnOperations } from "@bpmnkit/core"

const parsed = Bpmn.createProcess("review")
	.executable(true)
	.startEvent("start")
	.userTask("review", { assignee: "alice", dueDate: "P2D" })
	.endEvent("end")
	.build()

const { definitions, applied } = applyBpmnOperations(parsed, [
	{
		op: "update",
		id: "review",
		patch: { assignee: "bob", candidateGroups: "reviewers", dueDate: "", priority: 90 },
	},
])
console.log(applied, Bpmn.export(definitions))
```

Through the MCP server, call `update_element` with `processId`, `elementId` and
`changes`, for example `{"assignee": "bob", "dueDate": ""}`. The same fields and the same
empty-string clearing apply.
