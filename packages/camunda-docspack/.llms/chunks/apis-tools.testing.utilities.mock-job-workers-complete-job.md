# Utilities — Mock job workers — Complete job

The mock completes jobs with/without variables.

```java
@Test
void shouldCompleteJob() {
    // given: mock job worker for the job type "send-email"
    // 1) Complete jobs without variables
    processTestContext.mockJobWorker("send-email").thenComplete();

    // 2) Complete jobs with variables
    final Map<String, Object> variables = Map.of(
        "emailSent", true,
        "timestamp", "2024-01-01T10:00:00Z"
    );
    processTestContext.mockJobWorker("send-email").thenComplete(variables);

    // when: create a process instance
    // then: verify that the process instance completed all tasks
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
