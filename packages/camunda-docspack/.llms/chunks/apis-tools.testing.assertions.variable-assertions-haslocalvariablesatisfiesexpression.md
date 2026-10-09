# Assertions — Variable assertions — hasLocalVariableSatisfiesExpression

Assert that the process instance has a local variable in the scope of the given element with a value that satisfies the
given FEEL expression. Use the BPMN element ID or a [ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the
element.

The expression is evaluated with a context containing the variable under its name. The expression should access the
variable in a Boolean expression, for example, with comparisons. Learn more in the
[FEEL expressions introduction](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).

The assertion fails if the variable doesn't exist or the expression doesn't evaluate to `true`.

```java
assertThat(processInstance)
    .hasLocalVariableSatisfiesExpression(
        ElementSelectors.byId("review-order"),
        "order",
        "order.status = \"approved\" and list contains(order.items.name, \"Oxygen tank\")");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
