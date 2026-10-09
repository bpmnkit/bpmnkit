# Utilities — Selectors — Process instance selector

You can use a process instance selector to identify a process instance based on different criteria, such as process
instance key or BPMN process ID.

Predefined process instance selectors are available in the
`io.camunda.process.test.api.assertions.ProcessInstanceSelectors` class.

```java
// Assert a process instance by its process instance key
assertThatProcessInstance(ProcessInstanceSelectors.byKey(processInstanceKey)).isCreated();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
