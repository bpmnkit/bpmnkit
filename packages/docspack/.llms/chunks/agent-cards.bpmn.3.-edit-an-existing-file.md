# BPMN agent card — 3. Edit an existing file

```js
// Insert a step after "reviewExpense" with an error path that loops back to it.
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "expense")
		.insertAfter("reviewExpense")
		.serviceTask("validate", { name: "Validate receipt", taskType: "validate-receipt" })
		.withBoundary("invalid", { name: "Receipt invalid", errorCode: "INVALID" }, (b) =>
			b.userTask("fix", { name: "Fix receipt" }).connectTo("validate"),
		)
```

`--edit order.bpmn` rewrites it in place: existing shapes and forms stay, shapes right of the insertion move only as needed, new user tasks get forms. `--camunda 8.10` sets `executionPlatformVersion`. `kit` is `@bpmnkit/core`, `model` the parsed file.

- `continueProcess(model, processId)`: `.insertAfter(id)` splices in after `id`; `.at(id)` continues from a node without outgoing flow.
- Steps: `serviceTask(id, { name, taskType })` · `userTask(id, { name, formId, assignee, candidateGroups })` · `intermediateCatchEvent(id, { name, messageName, correlationKey: "=orderId" })` or `{ timerDuration: "PT1H" }` · `endEvent(id, { name })` · `.connectTo(id)`.
- Decision: `.exclusiveGateway(id, { name }).branch("yes", (b) => b.condition("=x > 1").label("Yes")…).branch("no", (b) => b.defaultFlow().label("No")…)`. Boundary: `.withBoundary(id, { errorCode } | { timerDuration } | { messageName, correlationKey }, (b) => …)`.
- One attribute: change `model` and return it. Builder FEEL starts with `=`; text-spec conditions do not.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
