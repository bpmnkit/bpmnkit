# BPMN Kit Text — element reference — Process basics and tasks — `script` — FEEL on process data

Use a script task for work that only reads variables: count, sum, filter, format. `feel=` is last on
the line and takes the rest of it.

```bpmnkit-text
# Script task
s[start Counted] > count[script Count open | result=openCount feel=count(issues[state = "open"])] > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("script-task")
  .name("Script task")
  .startEvent("s", { name: "Counted" })
  .scriptTask("count", { name: "Count open", expression: '= count(issues[state = "open"])', resultVariable: "openCount" })
  .endEvent("e", { name: "Done" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
