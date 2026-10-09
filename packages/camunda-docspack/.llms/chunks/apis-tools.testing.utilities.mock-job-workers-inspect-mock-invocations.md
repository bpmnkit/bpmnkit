# Utilities — Mock job workers — Inspect mock invocations

You can inspect the invocations of a mock job worker to verify how many jobs were handled and to get the details of each
job.

```java
@Test
void shouldInspectMockInvocations() {
    // given: mock job worker for the job type "send-email"
    final JobWorkerMock mockJobWorker =
            processTestContext.mockJobWorker("send-email").thenComplete();

    // when: create a process instance that triggers the job worker

    // then: verify the number of invocations
    assertThat(mockJobWorker.getInvocations()).isEqualTo(1);
    // and: inspect the details of each invocation
    assertThat(mockJobWorker.getActivatedJobs())
        .hasSize(1)
        .flatExtracting(job -> job.getVariablesAsMap().entrySet())
        .contains(entry("receiver", "Zee"), entry("subject", "Greetings"));
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
