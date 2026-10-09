# Utilities

Use utilities to interact with the process instance.

There are different utilities that can help you to write your process test.


## Manipulate the clock

The Camunda runtime uses an internal clock to execute process instances and to calculate when a BPMN timer event is due. In a test, you can use `CamundaProcessTestContext` to manipulate the clock.

When to use it:

- Trigger an active BPMN timer event
- Test scenarios that require a specific date or time, for example, a leap year

**Tip**
If you trigger a BPMN timer event, you should assert that the BPMN timer event is active before manipulating the clock.
Otherwise, you may manipulate the clock too early and the BPMN timer event is not triggered.

### Increase time

You can increase the time by a given duration. As a result, the clock is moved forward (i.e., in the future).

```java
@Test
void shouldTriggerTimerEvent() {
    // given: a process instance waiting at a BPMN timer event

    // when
    assertThat(processInstance).hasActiveElements("wait_2_days");

    processTestContext.increaseTime(Duration.ofDays(2));

    // then
    assertThat(processInstance).hasCompletedElements("wait_2_days");
}
```

### Set time

You can set the clock to a given date and time.

```java
@Test
void shouldCreateProcessInstanceInTheMorning() {
    // given
    processTestContext.setTime(Instant.parse("2025-10-01T08:00:00Z"));

    // when: create a process instance
    // then: verify the behavior at the given time
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
