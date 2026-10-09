# Utilities — Selectors — Incident selector

You can use an incident selector to identify an incident based on different criteria, such as BPMN element ID or process
instance key.

Predefined incident selectors are available in the `io.camunda.process.test.api.assertions.IncidentSelectors` class.

```java
// Resolve an incident by the BPMN element ID "approve_request_task"
processTestContext.resolveIncident(IncidentSelectors.byElementId("approve_request_task"));
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
