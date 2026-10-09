# Utilities — Selectors — Decision selector

You can use a decision selector to identify a DMN decision evaluation based on different criteria, such as decision ID
or decision name.

Predefined decision selectors are available in the `io.camunda.process.test.api.assertions.DecisionSelectors` class.

```java
// Assert the evaluation of a DMN decision with the ID "credit-score"
assertThatDecision(DecisionSelectors.byId("credit-score")).hasOutput(750);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
