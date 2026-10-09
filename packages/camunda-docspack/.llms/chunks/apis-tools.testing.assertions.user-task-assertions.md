# Assertions — User task assertions

You can verify the user task states and other properties using `CamundaAssert.assertThat()` or
`CamundaAssert.assertThatUserTask()`. Use a [UserTaskSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#user-task-selector) to identify the user
task.

### With user task selector

Use a [UserTaskSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#user-task-selector) to identify the user task:

```java
// by BPMN element ID
assertThatUserTask(UserTaskSelectors.byElementId("user-task-id")).isCompleted();

// by user task name
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).isCompleted();

// by process instance key
assertThatUserTask(UserTaskSelectors.byProcessInstanceKey(processInstanceKey)).isCompleted();
```

### isCreated

Asserts that the user task is created. The assertion fails if the task is in any other state.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).isCreated();
```

### isCompleted

Asserts that the user task is completed. The assertion fails if the task is in any other state.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).isCompleted();
```

### isCanceled

Asserts that the user task is canceled. The assertion fails if the task is in any other state.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).isCanceled();
```

### isFailed

Asserts that the user task is failed. The assertion fails if the task is in any other state.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).isFailed();
```

### hasAssignee

Asserts that the user task has the expected assignee.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasAssignee("John Doe");
```

### hasPriority

Asserts that the user task has the expected priority.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasPriority(100);
```

### hasElementId

Asserts that the user task has the expected BPMN element ID.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasElementId("user-task-id");
```

### hasName

Asserts that the user task has the expected name.

```java
assertThatUserTask(UserTaskSelectors.byElementId("user-task-id")).hasName("User Task");
```

### hasProcessInstanceKey

Asserts that the user task has the expected process instance key.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasProcessInstanceKey(processInstanceKey);
```

### hasDueDate

Asserts that the user task has the expected due date.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasDueDate("2023-10-01T00:00:00Z");
```

### hasCompletionDate

Asserts that the user task has the expected completion date.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasCompletionDate("2023-10-01T00:00:00Z");
```

### hasFollowUpDate

Asserts that the user task has the expected follow-up date.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasFollowUpDate("2023-10-01T00:00:00Z");
```

### hasCreationDate

Asserts that the user task has the expected creation date.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasCreationDate("2023-10-01T00:00:00Z");
```

### hasCandidateGroup

Asserts that the user task has the expected candidate group.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasCandidateGroup("groupA");
```

### hasCandidateGroups

Asserts that the user task has the expected candidate groups.

```java
assertThatUserTask(UserTaskSelectors.byTaskName("User Task")).hasCandidateGroups("groupA", "groupB", "groupC");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
