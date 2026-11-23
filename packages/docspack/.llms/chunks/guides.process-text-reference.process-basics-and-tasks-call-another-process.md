# BPMN Kit Text — element reference — Process basics and tasks — `call` — another process

`called=` is the id of the process to call. `in.` and `out.` map variables in and out of the call.

```bpmnkit-text
# Call activity
s[start Order] > bill[call Bill customer | called=billing in.amount=total out.invoice=invoiceId] > e[end Billed]
```

```typescript
const defs = Bpmn.createProcess("call-activity")
  .name("Call activity")
  .startEvent("s", { name: "Order" })
  .callActivity("bill", {
    name: "Bill customer",
    processId: "billing",
    ioMapping: { inputs: [{ source: "= total", target: "amount" }], outputs: [{ source: "= invoiceId", target: "invoice" }] },
  })
  .endEvent("e", { name: "Billed" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
