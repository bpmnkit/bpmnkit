---
title: "Recipes: Message Correlation"
description: Set the message correlation key on a message catch event or receive task, when building and when editing an existing diagram.
sidebar:
  order: 22
---

## How do I set a message correlation key?

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

## How do I change the correlation key of an existing message event?

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
