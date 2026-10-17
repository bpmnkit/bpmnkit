# Escalation reference

Reference for the `escalation-reference` rule.

An [escalation event](https://docs.camunda.io/docs/next/components/modeler/bpmn/escalation-events) must reference an escalation defined in the process. The referenced escalation must have a defined escalation code. To fix this problem, open the **Escalation** group in the properties panel on the right side of the screen, select or create an escalation, and specify its escalation code.

Camunda 8.2 and later support catch-all events and do not require an escalation reference.


## (guideline) No escalation selected

![No escalation selected](./img/escalation-reference/wrong-no-escalation-reference.png)


## (guideline) No escalation code specified

![No escalation code specified](./img/escalation-reference/wrong-no-escalation-code.png)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/escalation-reference
