# Error reference

Reference for the `error-reference` rule.

An [error event](https://docs.camunda.io/docs/next/components/modeler/bpmn/error-events) must reference an error defined in the process. The referenced error must have a defined error code. To fix this problem, open the **Error** group in the properties panel on the right side of the screen, select or create an error, and specify its error code.

Camunda 8.2 and later support catch-all events and do not require an error reference.


## (guideline) No error selected

![No error selected](./img/error-reference/wrong-no-error-reference.png)


## (guideline) No error code specified

![No error code specified](./img/error-reference/wrong-no-error-code.png)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/error-reference
