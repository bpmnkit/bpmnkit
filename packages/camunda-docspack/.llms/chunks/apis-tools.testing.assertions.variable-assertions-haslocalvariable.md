# Assertions — Variable assertions — hasLocalVariable

Assert that the process instance has the local variable with the value in the scope of the given element. Use the BPMN
element ID or a [ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the element. The assertion fails if the
variable doesn't exist or has a different value.

```java
assertThat(processInstance).hasLocalVariable(ElementSelectors.byId("task_A"), "var1", 100);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
