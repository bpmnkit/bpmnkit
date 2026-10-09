# Utilities — Resolve incidents

You can resolve an active incident. Use the [IncidentSelector](#incident-selector) to identify the incident based on
different criteria, for example, by the BPMN element ID where the incident occurred.

If the incident is caused by a job, the command increases the job retries by one before resolving the incident. If the
incident is caused by a missing variable, you should [update the variables](#update-variables) before resolving the
incident.

```java
@Test
void shouldResolveIncident() {
    // given: a process instance has an active incident

    // when: resolve the incident at the element with ID "validate-data"
    processTestContext.resolveIncident(IncidentSelectors.byElementId("validate-data"));

    // then: verify that the element is completed
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
