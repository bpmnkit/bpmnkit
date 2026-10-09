# Assertions — Variable assertions — hasLocalVariableNames

Assert that the process instance has the local variables in the scope of the given element. Use the BPMN element ID or a
[ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the element. The assertion fails if at least one variable
doesn't exist.

```java
assertThat(processInstance).hasLocalVariableNames(ElementSelectors.byId("task_A"), "var1", "var2");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
