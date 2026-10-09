# Migrate to Camunda Process Test — Migrate your process tests — ZeebeTestEngine utilities

ZPT provides the `ZeebeTestEngine` utilities to interact with the runtime, for example, to advance time.

CPT offers a similar utility via the [CamundaProcessTestContext](https://docs.camunda.io/docs/next/apis-tools/testing/utilities), but the following utilities are **not supported**:

- `waitForIdleState(duration)`
- `waitForBusyState(duration)`

CPT does not require these utilities because it provides [blocking assertions](https://docs.camunda.io/docs/next/apis-tools/testing/assertions) that wait until the expected condition is fulfilled.

```java
// ZPT
engine.waitForIdleState(duration);
engine.increaseTime(Duration.ofDays(1));

// CPT:
assertThat(processInstance).hasActiveElements("timer_event");

processTestContext.increaseTime(Duration.ofDays(1));
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
