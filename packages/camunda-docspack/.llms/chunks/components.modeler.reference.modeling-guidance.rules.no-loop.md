# Infinite Loop

Reference for the `no-loop` rule.

This error occurs when a BPMN model contains an automated loop (without human interaction or external event triggers). It may cause an endless recursion.

This may result in:

- Endless execution
- [Excessive resource usage](https://docs.camunda.io/docs/next/components/saas/clusters/cluster-capacity)

To fix this problem, add a timer, user task, or external event (e.g., message catch) to break the straight-through loop and ensure controlled execution.


## (guideline) Straight-through processing loop

![Straight-through processing loop](./img/no-loop/wrong.png)


## (guideline) Controlled Loop

![Controlled Loop](./img/no-loop/right.png)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/no-loop
