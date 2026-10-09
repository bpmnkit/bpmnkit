# Migrate to Camunda Process Test — Migrate your process tests — Deployment assertions

ZPT has assertions for a deployment using `BpmnAssert.assertThat()` with the `DeploymentEvent`.

CPT has no equivalent assertions. Instead, you could write
a [custom assertion](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#custom-assertions) with AssertJ to verify the properties of the
deployment event.

```java
// given
DeploymentEvent deploymentEvent = //

// ZPT:
BpmnAssert.assertThat(deploymentEvent).containsProcessesByResourceName("my-process.bpmn");

// CPT:
Assertions.assertThat(deploymentEvent.getProcesses())
    .extracting(Process::getResourceName)
    .contains("my-process.bpmn");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
