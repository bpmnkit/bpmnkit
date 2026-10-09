# Migrate to Camunda Process Test — Migrate your process tests — Inspection utilities

ZPT provides the `InspectionUtility` to locate process instances and pass them to assertions. Some assertions also include methods to extract related entities, such as `extractingProcessInstance()` or `extractingLatestIncident()`.

CPT offers a similar utility via the [ProcessInstanceSelector](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#with-process-instance-selector), which can be used with `CamundaAssert.assertThatProcessInstance()`. For other entities, you can use the Camunda client to search for the entity and implement a [custom assertion](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#custom-assertions).

```java
// ZPT:
InspectedProcessInstance childProcessInstance = InspectionUtility.findProcessInstances()
    .withBpmnProcessId("child-process")
    .findFirstProcessInstance()
    .get();

BpmnAssert.assertThat(childProcessInstance).isCompleted();

// CPT:
CamundaAssert.assertThatProcessInstance(byProcessId("child-process"))
    .isCompleted();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
