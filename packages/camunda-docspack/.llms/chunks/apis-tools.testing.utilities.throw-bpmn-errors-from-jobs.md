# Utilities — Throw BPMN errors from jobs

You can throw a BPMN error from an active job to simulate the behavior of a job worker without invoking the actual worker.
The command waits for the first job with the given job type and throws the BPMN error. If no job exists, the command fails.

Identify the job by its job type or using a [JobSelector](#job-selector). Optionally, you can pass variables and an
error message with the BPMN error.

When to use it:

- Test the error paths in the process
- Simulate different behaviors of a repeated task (success, BPMN error)

```java
@Test
void shouldThrowBpmnErrorFromJob() {
    // given: a process instance is waiting at a task

    // when: throw a BPMN error for the job with type "validate-data"
    // 1) With error code "VALIDATION_FAILED" and no variables
    processTestContext.throwBpmnErrorFromJob("validate-data", "VALIDATION_FAILED");

    // 2) With error code "VALIDATION_FAILED" and variables
    final Map<String, Object> variables = Map.of(
        "error-message", "Invalid customer data",
        "error-code", "ERR_VALIDATION_001"
    );
    processTestContext.throwBpmnErrorFromJob("validate-data", "VALIDATION_FAILED", variables);

    // 3) With error code, error message, and variables
    processTestContext.throwBpmnErrorFromJob(
        "validate-data",
        "VALIDATION_FAILED",
        "Data validation failed due to missing required fields",
        variables);

    // 4) With job selector by element ID "validate_data_task"
    processTestContext.throwBpmnErrorFromJob(
        JobSelectors.byElementId("validate_data_task"),
        "VALIDATION_FAILED");

    // then: verify that the process instance handled the error
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
