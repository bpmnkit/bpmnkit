# BPMN Kit Text — element reference — Process basics and tasks — `rule` — a DMN decision

`rule` is a business rule task. The aliases `decision` and `dmn` mean the same.

```bpmnkit-text
# Rule task
s[start Loan asked] > score[rule Score applicant | result=score] > e[end Scored]
```

```typescript
const defs = Bpmn.createProcess("rule-task")
  .name("Rule task")
  .startEvent("s", { name: "Loan asked" })
  .businessRuleTask("score", { name: "Score applicant", decisionId: "applicant-score", resultVariable: "score" })
  .endEvent("e", { name: "Scored" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
