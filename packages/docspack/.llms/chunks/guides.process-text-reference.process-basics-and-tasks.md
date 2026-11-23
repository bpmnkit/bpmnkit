# BPMN Kit Text — element reference — Process basics and tasks

The first line is `# Process name`. A path is `a > b > c`. A start event, an end event and one task
make the smallest process.

```bpmnkit-text
# Smallest process
begin[start Begin] > work[task Do the work] > finish[end Finish]
```

```typescript
const defs = Bpmn.createProcess("smallest")
  .name("Smallest process")
  .startEvent("begin", { name: "Begin" })
  .task("work", { name: "Do the work" })
  .endEvent("finish", { name: "Finish" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
