# BPMN agent card — 3. Edit an existing file

```js
// Insert a step after "review" with an error path that loops back to it.
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "expense")
		.insertAfter("review")
		.serviceTask("validate", { name: "Validate receipt", taskType: "validate-receipt" })
		.withBoundary("invalid", { name: "Receipt invalid", errorCode: "INVALID" }, (b) =>
			b.userTask("fix", { name: "Fix receipt" }).connectTo("validate"),
		)
```

`npx casen build edit.mjs --edit order.bpmn` rewrites `order.bpmn` in place. Existing shapes keep their place, shapes right of the insertion move right to make room, a second flow into a task gets a merge gateway, new user tasks get forms. `kit` is `@bpmnkit/core`, `model` the parsed file.

- `continueProcess(model, processId)`: `.insertAfter(id)` splices into the path after `id`; `.at(id)` continues from a node that has no outgoing flow.
- Steps: `serviceTask(id, { name, taskType })` · `userTask(id, { name, formId })` · `sendTask(id, { name, taskType })` · `intermediateCatchEvent(id, { name, messageName, correlationKey: "=orderId" })` or `{ timerDuration: "PT1H" }` · `endEvent(id, { name })` · `.connectTo(id)` joins an existing node.
- Decision: `.exclusiveGateway(id, { name }).branch("yes", (b) => b.condition("=x > 1").label("Yes")…).branch("no", (b) => b.defaultFlow().label("No")…)`.
- Boundary: `.withBoundary(id, { errorCode } | { timerDuration } | { messageName, correlationKey }, (b) => …)` on the step before it.
- Rename or set one attribute: change `model` and return it: `model.processes[0].flowElements.find((e) => e.id === "pay").name = "Pay now"; return model`.
- Builder FEEL starts with `=`; text-spec conditions do not.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
