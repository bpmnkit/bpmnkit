# BPMN Kit Text — element reference — Events and exceptions — Start events

```bpmnkit-text
# Start by message
s[start:message Order arrives | msg=new-order key=orderId] > t[task Handle] > e[end Handled]
```

```typescript
const defs = Bpmn.createProcess("start-message")
  .name("Start by message")
  .startEvent("s", { name: "Order arrives", messageName: "new-order", correlationKey: "= orderId" })
  .task("t", { name: "Handle" })
  .endEvent("e", { name: "Handled" })
  .build()
```

A timer start takes `every=` (a cycle) or `at=` (a date-time):

```bpmnkit-text
# Start by timer
s[start:timer Every night | every=R/PT24H] > t[task Run report] > e[end Reported]
```

```typescript
const defs = Bpmn.createProcess("start-timer")
  .name("Start by timer")
  .startEvent("s", { name: "Every night", timerCycle: "R/PT24H" })
  .task("t", { name: "Run report" })
  .endEvent("e", { name: "Reported" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
