# Build an Executable Camunda Process — How do I map a user task's input?

Set `ioMapping` on `userTask`. Each input is a FEEL `source` expression, starting with `=`,
copied into a local variable named `target`. Add `zeebeUserTask: true` so the task is a
Camunda user task and not a job-worker one; the form and the input mapping belong to it. Name
`target` after the form field that shows the value. `ioMapping` also takes `outputs`, with the
same `source` and `target` shape, for values that leave the task.

```typescript
.userTask("UserTask_ReviewAgentResponse", {
	name: "User Feedback",
	zeebeUserTask: true,
	formId: "ai-agent-chat-user-feedback",
	ioMapping: { inputs: [{ source: "=agent.responseText", target: "responseText" }] },
})
```

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
