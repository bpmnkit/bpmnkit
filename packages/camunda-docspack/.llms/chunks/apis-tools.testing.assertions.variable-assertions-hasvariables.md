# Assertions — Variable assertions — hasVariables

Assert that the process instance has the given variables. The assertion fails if at least one variable doesn't exist or has a different value.

```java
Map<String, Object> expectedVariables = //
assertThat(processInstance).hasVariables(expectedVariables);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
