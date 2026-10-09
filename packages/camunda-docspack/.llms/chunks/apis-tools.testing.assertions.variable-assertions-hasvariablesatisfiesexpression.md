# Assertions — Variable assertions — hasVariableSatisfiesExpression

Assert that the process instance has a variable with a value that satisfies the given FEEL expression.

The expression is evaluated with a context containing the variable under its name. The expression should access the
variable in a Boolean expression, for example, with comparisons. Learn more in the
[FEEL expressions introduction](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).

The assertion fails if the variable doesn't exist or the expression doesn't evaluate to `true`.

```java
assertThat(processInstance)
    .hasVariableSatisfiesExpression(
        "order",
        "order.status = \"approved\" and list contains(order.items.name, \"Oxygen tank\")");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
