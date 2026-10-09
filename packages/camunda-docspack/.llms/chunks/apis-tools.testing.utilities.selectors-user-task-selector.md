# Utilities — Selectors — User task selector

You can use a user task selector to identify a user task based on different criteria, such as element ID, task name, or
process instance key.

Predefined user task selectors are available in the `io.camunda.process.test.api.assertions.UserTaskSelectors` class.

```java
// Complete a user task by its task name
processTestContext.completeUserTask(UserTaskSelectors.byTaskName("Approve Request"), variables);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
