# Assertions — Variable assertions — hasLocalVariables

Assert that the process instance has the local variables in the scope of the given element. Use the BPMN element ID or a
[ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the element. The assertion fails if at least one variable
doesn't exist or has a different value.

```java
Map<String, Object> expectedVariables = //
assertThat(processInstance).hasLocalVariables(ElementSelectors.byId("task_A"), expectedVariables);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
