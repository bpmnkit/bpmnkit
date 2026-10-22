# Recipes: Message Correlation — How do I set a message correlation key?

Camunda 8 correlates a published message to a process instance by the message name and a
correlation key, a FEEL expression evaluated in the waiting instance. While building, pass
`messageName` and `correlationKey` to `intermediateCatchEvent` or `receiveTask`. The key is
written as a `zeebe:subscription` on the root message.

```typescript
import { Bpmn } from "@bpmnkit/core"

const defs = Bpmn.createProcess("wait-payment")
	.executable(true)
	.startEvent("start")
	.intermediateCatchEvent("payment", {
		name: "Payment received",
		messageName: "payment-received",
		correlationKey: "=orderId",
	})
	.endEvent("end")
	.build()

console.log(Bpmn.export(defs))
```

---
Source: https://bpmnkit.com/docs/guides/recipes-message-correlation
