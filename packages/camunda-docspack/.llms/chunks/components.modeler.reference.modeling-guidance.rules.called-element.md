# Called element

Reference for the `called-element` rule.

Call activities must specify the [process ID of the called process](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities#defining-the-called-process). To fix this problem, open the **Called element** group in the properties panel on the right side of the screen and specify the process ID of the called process.


## (guideline) No process ID specified

![No process ID specified](./img/called-element/wrong.png)


## (guideline) Process ID specified

![Process ID specified](./img/called-element/right.png)


## References

- [Call Activities](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities)
- [Rule source](https://github.com/camunda/bpmnlint-plugin-camunda-compat/blob/main/rules/camunda-cloud/called-element.js)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/called-element
