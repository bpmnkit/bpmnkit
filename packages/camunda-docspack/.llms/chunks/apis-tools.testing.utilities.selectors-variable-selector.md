# Utilities — Selectors — Variable selector

You can use a variable selector to identify a variable based on different criteria, such as variable name or variable value.

Predefined variable selectors are available in the `io.camunda.process.test.api.assertions.VariableSelectors` class.

```java
// Assert a variable by its name
assertThatProcessInstance(processInstance).hasVariable(VariableSelectors.byName("approved"), true);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
