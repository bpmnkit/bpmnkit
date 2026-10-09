# Utilities — Selectors — Element selector

You can use an element selector to identify a BPMN element based on different criteria, such as element ID or element
name.

Predefined element selectors are available in the `io.camunda.process.test.api.assertions.ElementSelectors` class.

```java
// Assert the BPMN element with the ID "approve_request_task"
assertThat(processInstance).hasActiveElements(ElementSelectors.byId("approve_request_task"));

// Assert the BPMN element with the name "Approve Request"
assertThat(processInstance).hasActiveElements(ElementSelectors.byName("Approve Request"));
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
