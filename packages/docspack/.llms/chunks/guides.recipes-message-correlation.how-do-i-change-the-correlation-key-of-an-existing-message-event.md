# Recipes: Message Correlation — How do I change the correlation key of an existing message event?

Send `correlationKey` in an `update` patch to `applyBpmnOperations`, or in `changes` to the MCP
`update_element` tool. The key lives on the referenced message, so every element that shares
that message changes. An element with no message reference is an error.

```typescript
import { Bpmn, applyBpmnOperations } from "@bpmnkit/core"

const parsed = Bpmn.createProcess("wait-payment")
	.executable(true)
	.startEvent("start")
	.intermediateCatchEvent("payment", { messageName: "payment-received", correlationKey: "=orderId" })
	.endEvent("end")
	.build()

const { definitions } = applyBpmnOperations(parsed, [
	{ op: "update", id: "payment", patch: { correlationKey: "=customer.id" } },
])
console.log(Bpmn.export(definitions))
```

---
Source: https://bpmnkit.com/docs/guides/recipes-message-correlation
