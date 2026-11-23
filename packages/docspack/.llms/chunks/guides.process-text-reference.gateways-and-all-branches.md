# BPMN Kit Text — element reference — Gateways — `and` — all branches

`and` splits into parallel paths and waits for all of them where they meet. The alias is `parallel`.

```bpmnkit-text
# Parallel work
s[start Order] > fork[and Fork]
fork > pack[task Pack] > join[and Join]
fork > bill[task Invoice] > join
join > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("parallel")
  .name("Parallel work")
  .startEvent("s", { name: "Order" })
  .parallelGateway("fork", { name: "Fork" })
  .branch("pack", (b) => b.task("pack", { name: "Pack" }).parallelGateway("join", { name: "Join" }))
  .branch("bill", (b) => b.task("bill", { name: "Invoice" }).connectTo("join"))
  .endEvent("e", { name: "Done" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
