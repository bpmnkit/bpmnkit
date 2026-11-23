# BPMN Kit Text — element reference — Pools, lanes and messages

A `lane` line names who does which nodes. Every node is in one lane. A `pool` is another party,
drawn as an empty pool, and a `msg` line is a message to it or from it.

```bpmnkit-text
# Order with lanes
s[start Order placed] > check[user Check order] > ship[service Ship | job=ship] > e[end Shipped]
lane sales[Sales]: s, check
lane ops[Operations]: ship, e
```

```typescript
const defs = Bpmn.createProcess("lanes")
  .name("Order with lanes")
  .inLane("sales", { name: "Sales" })
  .startEvent("s", { name: "Order placed" })
  .userTask("check", { name: "Check order" })
  .inLane("ops", { name: "Operations" })
  .serviceTask("ship", { name: "Ship", taskType: "ship" })
  .endEvent("e", { name: "Shipped" })
  .build()
```

```bpmnkit-text
# Order with a bank
s[start Order] > pay[send Ask bank to pay | job=pay] > wait[catch:message Bank confirms | msg=paid key=orderId] > e[end Paid]
pool bank[Bank]
msg pay >(Payment) bank
msg bank >(Confirmation) wait
```

```typescript
const defs = Bpmn.createDiagram("order-bank")
  .process("order", (p) =>
    p
      .name("Order with a bank")
      .startEvent("s", { name: "Order" })
      .sendTask("pay", { name: "Ask bank to pay", taskType: "pay" })
      .intermediateCatchEvent("wait", { name: "Bank confirms", messageName: "paid", correlationKey: "= orderId" })
      .endEvent("e", { name: "Paid" }),
  )
  .process("bank", (p) => p.name("Bank"))
  .participant("order-pool", { name: "Order with a bank", processId: "order" })
  .participant("bank-pool", { name: "Bank", processId: "bank" })
  .messageFlow("payment", { source: "pay", target: "bank-pool", name: "Payment" })
  .messageFlow("confirmation", { source: "bank-pool", target: "wait", name: "Confirmation" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
