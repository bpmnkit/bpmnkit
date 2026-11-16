# AI setup — for agents — Do / don't

- Do write the spec directly; do not plan in prose first.
- Do deploy the `.bpmn` with the `.form` files the `✓` line lists (`--deploy` does it).
- Do use `--edit` to change an existing file; do not rewrite it from scratch (layout is lost).
- Don't write BPMN XML or diagram coordinates by hand.
- Don't print or commit credentials.
- Don't claim the process is deployed unless the line says `deployed`.


## Example

```text
# Expense approval | id=expense
[start Expense submitted] > [service Check budget | job=check-budget] > [xor Within budget?]
Within budget? >(Yes: within = true) [end Paid]
Within budget? >(No: default) [user Review expense | fields=amount:number,reason] > Paid
```

`casen build expense.txt --deploy` → `✓ expense.bpmn + 1 form (expense-reviewExpense.form) · lint clean · process expense, tasks 2, gateways 2, forms 1 · Camunda 8.10.0 · deployed 2 to camunda8 (key …)`

---
Source: https://bpmnkit.com/docs/guides/ai-setup-for-agents
