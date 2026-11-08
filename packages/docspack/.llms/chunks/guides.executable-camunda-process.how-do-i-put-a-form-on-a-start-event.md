# Build an Executable Camunda Process — How do I put a form on a start event?

Pass `formId` to `startEvent`. It writes a `zeebe:formDefinition` with that `formId` on the
event, so the form is linked by id and Camunda looks it up in the cluster at runtime.

```typescript
model.startEvent("StartEvent_TaskReceived", {
	name: "Task to perform received",
	formId: "ai-agent-chat-initial-request",
})
```

A user task takes the same `formId` option. The `formId` is the id of a Camunda Form (a
`.form` file), not a file name or a path. Deploy the form together with the process: if the
cluster has no form with that id, the person who opens the task or starts the instance finds
no form. A start event without a `formId` has no start form at all; an instance then starts
only with the variables you pass to the API.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
