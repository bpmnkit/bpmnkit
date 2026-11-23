# BPMN Kit Text — element reference — Gateways — `xor` — exactly one branch

`xor` reads the aliases `exclusive` and `gateway`.

```bpmnkit-text
# Exclusive choice
s[start Expense] > check[xor Over 1000?]
check >(Yes: amount > 1000) review[user Review] > e[end Paid]
check >(No: default) auto[service Approve | job=approve] > e
```

```typescript
const defs = Bpmn.createProcess("xor")
  .name("Exclusive choice")
  .startEvent("s", { name: "Expense" })
  .exclusiveGateway("check", { name: "Over 1000?" })
  .branch("Yes", (b) => b.condition("= amount > 1000").userTask("review", { name: "Review" }).endEvent("e", { name: "Paid" }))
  .branch("No", (b) => b.defaultFlow().serviceTask("auto", { name: "Approve", taskType: "approve" }).connectTo("e"))
  .build()
```

The two branches meet at `e`. Text joins them with an `xor` for you (a fix, not a problem). Fluent
infers the same join, or you close the branch yourself with `.connectTo("e")`.

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
