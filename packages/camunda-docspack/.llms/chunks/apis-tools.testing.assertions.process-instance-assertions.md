# Assertions — Process instance assertions

You can verify the process instance state and other properties using `CamundaAssert.assertThat()` or
`CamundaAssert.assertThatProcessInstance()`. Use the process instance creation event or
a [ProcessInstanceSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#process-instance-selector) to identify the process instance.

### With process instance event

Use the creation event of the create instance command to identify the process instance:

```java
// given/when
ProcessInstanceEvent processInstance =
    client
        .newCreateInstanceCommand()
        .bpmnProcessId("my-process")
        .latestVersion()
        .send()
        .join();

// then
assertThat(processInstance).isActive();
```

### With process instance result

Use the result event of the create instance command to identify the process instance:

```java
// given/when
ProcessInstanceResult processInstance =
    client
        .newCreateInstanceCommand()
        .bpmnProcessId("my-process")
        .latestVersion()
        .withResult()
        .send()
        .join();

// then
assertThat(processInstance).isActive();
```

### With process instance selector

Use a [ProcessInstanceSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#process-instance-selector) to identify the process instance.

```java
// by process instance key
assertThatProcessInstance(ProcessInstanceSelectors.byKey(processInstanceKey)).isActive();

// by process ID
assertThatProcessInstance(ProcessInstanceSelectors.byProcessId("my-process")).isActive();
```

### isActive

Assert that the process instance is active. The assertion fails if the process instance is completed, terminated, or not created.

```java
assertThat(processInstance).isActive();
```

### isCompleted

Assert that the process instance is completed. The assertion fails if the process instance is active, terminated, or not created.

```java
assertThat(processInstance).isCompleted();
```

### isTerminated

Assert that the process instance is terminated. The assertion fails if the process instance is active, completed, or not created.

```java
assertThat(processInstance).isTerminated();
```

### isCreated

Assert that the process instance is created and either active, completed, or terminated. The assertion fails if the process instance is not created.

```java
assertThat(processInstance).isCreated();
```

### hasActiveIncidents

Assert that the process instance has at least one active incident. The assertion fails if there is no active incident.

```java
assertThat(processInstance).hasActiveIncidents();
```

### hasNoActiveIncidents

Assert that the process instance has no active incidents. The assertion fails if there is any active incident.

```java
assertThat(processInstance).hasNoActiveIncidents();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
