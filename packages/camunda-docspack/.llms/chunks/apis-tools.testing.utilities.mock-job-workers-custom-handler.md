# Utilities — Mock job workers — Custom handler

You can implement a custom handler to mock more complex behaviors.

```java
@Test
void shouldUseCustomHandler() {
    // given: mock job worker for the job type "calculate-discount"
    processTestContext
        .mockJobWorker("calculate-discount")
        .withHandler(
            (jobClient, job) -> {
                final Map<String, Object> variables = job.getVariablesAsMap();
                final double orderAmount = (double) variables.get("orderAmount");
                final double discount = orderAmount > 100 ? 0.1 : 0.0;

                jobClient.newCompleteCommand(job).variable("discount", discount).send().join();
            });

    // when: create a process instance
    // then: verify that the process instance has the expected variables
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
