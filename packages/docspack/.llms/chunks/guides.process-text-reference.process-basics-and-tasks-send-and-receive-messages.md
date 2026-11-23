# BPMN Kit Text — element reference — Process basics and tasks — `send` and `receive` — messages

A `send` task publishes a message. A `receive` task waits for one: it needs `msg=` and `key=`.

```bpmnkit-text
# Send and receive
s[start Order shipped] > tell[send Tell customer | job=notify] > wait[receive Wait for reply | msg=reply key=orderId] > e[end Replied]
```

```typescript
const defs = Bpmn.createProcess("send-receive")
  .name("Send and receive")
  .startEvent("s", { name: "Order shipped" })
  .sendTask("tell", { name: "Tell customer", taskType: "notify" })
  .receiveTask("wait", { name: "Wait for reply", messageName: "reply", correlationKey: "= orderId" })
  .endEvent("e", { name: "Replied" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
