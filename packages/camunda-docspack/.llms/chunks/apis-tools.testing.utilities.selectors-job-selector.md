# Utilities — Selectors — Job selector

You can use a job selector to identify a job based on different criteria, such as job type, BPMN element ID, or process
instance key.

Predefined job selectors are available in the `io.camunda.process.test.api.assertions.JobSelectors` class.

```java
// Complete a job by its BPMN element ID
processTestContext.completeJob(JobSelectors.byElementId("send_notification_task"));

// Throw a BPMN error from a job by its job type
processTestContext.throwBpmnErrorFromJob(JobSelectors.byJobType("validate-data"), "VALIDATION_FAILED");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
