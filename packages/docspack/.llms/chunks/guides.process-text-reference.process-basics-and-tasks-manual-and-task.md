# BPMN Kit Text — element reference — Process basics and tasks — `manual` and `task`

`manual` is work done outside the engine. `task` is the plain task with no type.

```bpmnkit-text
# Manual and plain
s[start Parcel arrived] > pack[manual Pack parcel] > log[task Log it] > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("manual-plain")
  .name("Manual and plain")
  .startEvent("s", { name: "Parcel arrived" })
  .manualTask("pack", { name: "Pack parcel" })
  .task("log", { name: "Log it" })
  .endEvent("e", { name: "Done" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
