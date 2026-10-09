# Utilities — Complete jobs

You can complete an active job to simulate the behavior of a job worker without invoking the actual worker.
The command waits for the first job with the given job type and completes it. If no job exists, the command fails.

Identify the job by its job type or using a [JobSelector](#job-selector). You can pass variables or complete the job
with the [example data](https://docs.camunda.io/docs/next/components/modeler/data-handling#defining-example-data) from the related BPMN element.

When to use it:

- Test the process with full control over the job completion
- Complete a repeated task with different outcomes

```java
@Test
void shouldCompleteJob() {
    // given: a process instance is waiting at a task

    // when: complete the job with type "send-notification"
    // 1) Without variables
    processTestContext.completeJob("send-notification");

    // 2) With variables
    final Map<String, Object> variables = Map.of(
        "notification-sent", true,
        "recipients", List.of("user1@example.com", "user2@example.com")
    );
    processTestContext.completeJob("send-notification", variables);

    // 3) With example data from the BPMN element
    processTestContext.completeJobWithExampleData("send-notification");

    // 4) With job selector by element ID "send_notification_task"
    processTestContext.completeJob(JobSelectors.byElementId("send_notification_task"));

    // 5) With a mapper from input variables to output variables
    processTestContext.completeJob(
        "send-notification",
        inputVariables -> {
            final String recipient = (String) inputVariables.get("recipient");
            return Map.of("notificationSent", true, "sentTo", recipient);
        });

    // then: verify that the process instance completed the task
}
```

### Ad-hoc sub-process jobs

You can simulate the behavior of
an [ad-hoc sub-process job worker](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses#job-worker-implementation),
for example, an AI agent, and control the execution of the ad-hoc sub-process. The job completion allows you to
activate an element in the ad-hoc sub-process or to fulfill the completion condition.

```java
@Test
void shouldCompleteJobOfAdHocSubProcess() {
    // given: the ad-hoc sub-process is active

    // when: complete the job of the ad-hoc sub-process
    // 1) With activating an element with variables
    processTestContext.completeJobOfAdHocSubProcess(
        JobSelectors.byElementId("ad-hoc-sub-process"),
        result -> result.activateElement("search-knowledge-base").variable("query", "launch rockets"));

    // 2) With job variables (for the ad-hoc sub-process)
    processTestContext.completeJobOfAdHocSubProcess(
        JobSelectors.byElementId("ad-hoc-sub-process"),
        Map.of("agent", agentContext),
        result -> result.activateElement("search-knowledge-base").variable("query", "launch rockets"));

    // 3) With fulfilling the completion condition
    processTestContext.completeJobOfAdHocSubProcess(
        JobSelectors.byElementId("ad-hoc-sub-process"),
        result -> result.completionConditionFulfilled(true));

    // then: verify that the ad-hoc sub-process completed the task
}
```

### User task listener jobs

You can simulate the behavior of
a [user task listener job worker](https://docs.camunda.io/docs/next/components/concepts/user-task-listeners#implement-a-user-task-listener). The job
completion allows to correct the user task data or to deny the user task lifecycle transition.

```java
@Test
void shouldCompleteJobOfUserTaskListener() {
    // given: the process instance is waiting at a user task

    // when: complete the job of the user task listener
    // 1) With correcting user task data
    processTestContext.completeJobOfUserTaskListener(
        JobSelectors.byElementId("approve_request_task"),
        result -> result.correctAssignee("me").correctPriority(100));

    // 2) With denying the user task lifecycle transition
    processTestContext.completeJobOfUserTaskListener(
        JobSelectors.byElementId("approve_request_task"),
        result -> result.deny(true).deniedReason("Policy violation"));

    // then: verify that the user task is completed
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
