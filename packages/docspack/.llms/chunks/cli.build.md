# casen build

`casen build` takes a short spec and does everything after it: lay out, write the `.bpmn`,
generate a Camunda form for every user task without one, lint (deploy gate plus the warnings
bpmnlint and camunda-compat report), and with `--deploy` send the model and its forms in one
deployment. It prints one line when all is well and one line per problem otherwise.

```sh
casen build expense.txt --deploy
```

```
✓ expense.bpmn + 2 forms (expense-review.form, expense-fix.form) · lint clean · process expense, tasks 3, gateways 2, forms 2 · Camunda 8.10.0 · deployed 3 to camunda8 (key 2251799813685249)
```

---
Source: https://bpmnkit.com/docs/cli/build
