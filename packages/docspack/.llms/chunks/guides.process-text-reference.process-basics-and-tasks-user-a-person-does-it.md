# BPMN Kit Text — element reference — Process basics and tasks — `user` — a person does it

`form=` links a form. `user` also reads the aliases `human`.

```bpmnkit-text
# User task
s[start Request] > review[user Review request | form=review_form] > e[end Reviewed]
```

```typescript
const defs = Bpmn.createProcess("user-task")
  .name("User task")
  .startEvent("s", { name: "Request" })
  .userTask("review", { name: "Review request", formId: "review_form" })
  .endEvent("e", { name: "Reviewed" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
