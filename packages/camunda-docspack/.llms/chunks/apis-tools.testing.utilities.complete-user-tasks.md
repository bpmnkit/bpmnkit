# Utilities — Complete user tasks

You can complete a user task to simulate the user behavior in Tasklist. The command waits for the first user task and
completes it. If no user task exists, the command fails.

Identify the user task by its BPMN element ID or using a [UserTaskSelector](#user-task-selector). You can pass variables
or complete the user task with the [example data](https://docs.camunda.io/docs/next/components/modeler/data-handling#defining-example-data) from the
related BPMN element.

When to use it:

- Test a process with user tasks

```java
@Test
void shouldCompleteUserTask() {
    // given: a process instance is waiting at a user task

    // when: complete the user task
    // 1) With element ID "task_approveRequest"
    final Map<String, Object> variables = Map.of(
        "approved", true,
        "comment", "Request approved by manager",
        "approvedAmount", 5000.00
    );
    processTestContext.completeUserTask("task_approveRequest", variables);

    // 2) With selector by task name "Approve Request"
    processTestContext.completeUserTask(
        UserTaskSelectors.byTaskName("Approve Request"),
        variables);

    // 3) With example data from the BPMN element
    processTestContext.completeUserTaskWithExampleData(
        UserTaskSelectors.byElementId("task_approveRequest"));

    // 4) With a mapper from input variables to output variables
    processTestContext.completeUserTask(
        "task_approveRequest",
        inputVariables -> Map.of("approved", inputVariables.containsKey("preApproved")));

    // then: verify that the process instance is completed
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
