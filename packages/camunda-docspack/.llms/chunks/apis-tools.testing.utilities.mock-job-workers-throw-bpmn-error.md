# Utilities — Mock job workers — Throw BPMN error

The mock throws BPMN errors for jobs with the given error code and optional error message and variables.

```java
@Test
void shouldThrowBpmnError() {
    // given: mock job worker for the job type "validate-order"
    // 1) Throw BPMN errors with error code "INVALID_ORDER"
    processTestContext.mockJobWorker("validate-order").thenThrowBpmnError("INVALID_ORDER");

    // 2) Throw BPMN errors with error code "INVALID_ORDER" and variables
    final Map<String, Object> variables = Map.of(
        "reason", "The order exceeds the item limit."
    );
    processTestContext
        .mockJobWorker("validate-order")
        .thenThrowBpmnError("INVALID_ORDER", variables);

    // 3) Throw BPMN errors with error code, error message, and variables
    processTestContext
        .mockJobWorker("validate-order")
        .thenThrowBpmnError("INVALID_ORDER", "Order validation failed", variables);

    // when: create a process instance
    // then: verify that the process instance handled the BPMN error
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
