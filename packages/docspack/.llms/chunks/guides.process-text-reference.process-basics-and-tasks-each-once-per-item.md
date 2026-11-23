# BPMN Kit Text — element reference — Process basics and tasks — `each=` — once per item

`each=<list>` runs the task once for every item of the list (a multi-instance task).

```bpmnkit-text
# For each item
s[start Order] > pick[service Pick item | job=pick each=items] > e[end Picked]
```

```typescript
const defs = Bpmn.createProcess("for-each")
  .name("For each item")
  .startEvent("s", { name: "Order" })
  .serviceTask("pick", { name: "Pick item", taskType: "pick", multiInstance: { collection: "= items", elementVariable: "item" } })
  .endEvent("e", { name: "Picked" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
