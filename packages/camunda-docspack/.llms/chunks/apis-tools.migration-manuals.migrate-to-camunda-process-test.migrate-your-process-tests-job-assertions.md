# Migrate to Camunda Process Test — Migrate your process tests — Job assertions

ZPT has assertions for an activated job using `BpmnAssert.assertThat()` with the `ActivatedJob`.

CPT has no equivalent assertions. Instead, you could write
a [custom assertion](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#custom-assertions) with AssertJ to verify the properties of the
activated job.

```java
// given
ActivatedJob activatedJob = //

// ZPT:
BpmnAssert.assertThat(activatedJob).hasElementId("elementId");

// CPT:
Assertions.assertThat(activatedJob.getElementId()).isEqualTo("elementId");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
