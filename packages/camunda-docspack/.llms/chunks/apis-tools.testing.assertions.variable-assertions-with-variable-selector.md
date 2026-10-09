# Assertions — Variable assertions — With variable selector

Use a [VariableSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#variable-selector) to identify the variable:

```java
// by variable name
assertThat(processInstance).hasVariable(VariableSelectors.byName("approved"), true);

// by partial variable value
assertThat(processInstance).hasVariableSatisfies(
    VariableSelectors.byValueContains("order-123"),
    Order.class,
    order -> { });
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
