# Assertions — Process instance message assertions

You can verify the message subscriptions of a process instance using `CamundaAssert.assertThat(processInstance)`.

### isWaitingForMessage

Assert that the process instance is waiting for the given message. The assertion fails if the process instance has no
active message subscription for the given message name and optional correlation key.

```java
// 1) By message name
assertThat(processInstance).isWaitingForMessage("message-name");

// 2) By message name and correlation key
assertThat(processInstance).isWaitingForMessage("message-name", "correlation-key");
```

### isNotWaitingForMessage

Assert that the process instance is not waiting for the given message. The assertion fails if the process instance has
an active message subscription for the given message name and optional correlation key.

```java
// 1) By message name
assertThat(processInstance).isNotWaitingForMessage("message-name");

// 2) By message name and correlation key
assertThat(processInstance).isNotWaitingForMessage("message-name", "correlation-key");
```

### hasCorrelatedMessage

Assert that the given message was correlated to the process instance. The assertion fails if the process instance has no
correlated message subscription for the given message name and optional correlation key.

```java
// 1) By message name
assertThat(processInstance).hasCorrelatedMessage("message-name");

// 2) By message name and correlation key
assertThat(processInstance).hasCorrelatedMessage("message-name", "correlation-key");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
