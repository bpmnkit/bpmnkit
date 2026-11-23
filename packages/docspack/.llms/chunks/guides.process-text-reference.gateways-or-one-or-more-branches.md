# BPMN Kit Text — element reference — Gateways — `or` — one or more branches

`or` takes every branch whose condition holds. It also has a default. The alias is `inclusive`.

```bpmnkit-text
# Inclusive choice
s[start Order] > pick[or What to send?]
pick >(Gift: gift = true) wrap[task Wrap] > e[end Sent]
pick >(Express: express = true) fast[task Ship express] > e
pick >(Default: default) std[task Ship standard] > e
```

```typescript
const defs = Bpmn.createProcess("or")
  .name("Inclusive choice")
  .startEvent("s", { name: "Order" })
  .inclusiveGateway("pick", { name: "What to send?" })
  .branch("Gift", (b) => b.condition("= gift = true").task("wrap", { name: "Wrap" }).endEvent("e", { name: "Sent" }))
  .branch("Express", (b) => b.condition("= express = true").task("fast", { name: "Ship express" }).connectTo("e"))
  .branch("Default", (b) => b.defaultFlow().task("std", { name: "Ship standard" }).connectTo("e"))
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
