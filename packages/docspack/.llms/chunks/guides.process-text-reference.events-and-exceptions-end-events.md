# BPMN Kit Text — element reference — Events and exceptions — End events

`end:error`, `end:signal` and `end:escalation` take the code or name after a bar. `end:terminate`
stops the whole process at once.

```bpmnkit-text
# End events
s[start Payment] > check[xor Paid?]
check >(Yes: paid) ok[end Done]
check >(No: default) bad[end:error Payment failed | error=PAY_FAILED]
```

```typescript
const defs = Bpmn.createProcess("end-events")
  .name("End events")
  .startEvent("s", { name: "Payment" })
  .exclusiveGateway("check", { name: "Paid?" })
  .branch("Yes", (b) => b.condition("= paid").endEvent("ok", { name: "Done" }))
  .branch("No", (b) => b.defaultFlow().endEvent("bad", { name: "Payment failed", errorCode: "PAY_FAILED" }))
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
