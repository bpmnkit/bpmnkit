# Migrate to Camunda Process Test — Migrate your process tests — Message assertions

ZPT has assertions for a published message using `BpmnAssert.assertThat()` with the `PublishMessageResponse`.

CPT has no equivalent assertions. Instead, you could use
a [ProcessInstanceSelector](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#with-process-instance-selector) to find the correlated
process instance and verify the correlation using
a [message subscription assertion](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hascorrelatedmessage).

Alternatively, you could use
the [correlate message API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/correlate-message.api) that
returns the process instance key in the response.

```java
// ZPT:
final PublishMessageResponse publishMessageResponse = //

BpmnAssert.assertThat(publishMessageResponse)
    .hasCreatedProcessInstance()
    .extractingProcessInstance()
    .isCompleted();

// CPT:
final CorrelateMessageResponse correlateMessageResponse = //

// The correlate command would fail if the message could not be correlated
CamundaAssert.assertThatProcessInstance(byKey(correlateMessageResponse.getProcessInstanceKey()))
    .isCompleted();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
