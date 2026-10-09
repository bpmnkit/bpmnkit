# Utilities — Conditional behavior

The `when(condition).then(action)` API on `CamundaProcessTestContext` registers background behaviors that react to process state changes without blocking the test thread. This is useful for non-deterministic flows where the execution order is unknown. You can register multiple behaviors before starting the process, and they will react independently as the process progresses. Behaviors are cleared automatically after each test.

```java
@Test
void shouldCompleteTaskAutomatically() {
    // given: define a conditional behavior
    processTestContext
        .when(() -> assertThat(processInstance).hasActiveElements("approve_order"))
        .as("approve order")
        .then(() -> processTestContext.completeUserTask("approve_order",
            Map.of("approved", true)));

    // when: create a process instance
    // then: verify that the process instance is completed
}
```

**Important**
The action should resolve the process state that the condition checks for. After an action executes, the engine waits for the condition to become false again before re-evaluating. For example, if the condition asserts that a user task is active, the action should complete that user task. This advances the process flow so that the condition no longer holds. Otherwise, the same condition may not be detected again reliably.

If the same conditional behavior applies to multiple tests, you can define it in a `@BeforeEach` method:

```java
@BeforeEach
void setupBehaviors() {
    processTestContext
        .when(() -> assertThat(processInstance).hasActiveElements("send_notification"))
        .as("complete send notification")
        .then(() -> processTestContext.completeJob("send-notification"));
}

@Test
void shouldCompleteOrder() {
    // given: the conditional behavior is defined in @BeforeEach

    // when: create a process instance
    // then: verify that the process instance completed the task
}
```

### Chain multiple actions

Actions are consumed in order on each condition match. The last action repeats indefinitely once all preceding actions are exhausted.

```java
@Test
void shouldHandleRepeatedTask() {
    // given: define a conditional behavior with chained actions
    processTestContext
        .when(() -> assertThat(processInstance).hasActiveElements("review_document"))
        .as("review document")
        .then(() -> processTestContext.completeUserTask("review_document",
            Map.of("approved", false, "comment", "Needs revision")))
        .then(() -> processTestContext.completeUserTask("review_document",
            Map.of("approved", true, "comment", "Looks good")));

    // when: create a process instance
    // then: verify that the process instance is completed
}
```

### Name a behavior

You can assign a descriptive name to a conditional behavior using `.as()`. The name is used in log messages and diagnostics.

```java
@Test
void shouldNameBehavior() {
    // given: define a named conditional behavior
    processTestContext
        .when(() -> assertThat(processInstance).hasActiveElements("send_notification"))
        .as("send-notification is active")
        .then(() -> processTestContext.completeJob("send-notification"));

    // when: create a process instance
    // then: verify that the process instance completed the task
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
