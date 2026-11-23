# BPMN Kit Text — element reference — Process basics and tasks — `service` — a worker runs a job

`job=` is the job type the worker subscribes to. `result=` names the variable that holds the result.

```bpmnkit-text
# Service task
s[start Order placed] > pay[service Charge card | job=charge-card result=receipt] > e[end Paid]
```

```typescript
const defs = Bpmn.createProcess("service-task")
  .name("Service task")
  .startEvent("s", { name: "Order placed" })
  .serviceTask("pay", { name: "Charge card", taskType: "charge-card", ioMapping: { outputs: [{ source: "= result", target: "receipt" }] } })
  .endEvent("e", { name: "Paid" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
