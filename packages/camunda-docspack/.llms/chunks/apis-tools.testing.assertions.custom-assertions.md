# Assertions — Custom assertions

You can build your own assertions similar to the assertions from CPT.

- Use the preconfigured Camunda client to retrieve the process data.
- Use [AssertJ](https://github.com/assertj/assertj)'s assertions to verify the expected properties.
- Use [Awaitility](http://www.awaitility.org/) around verifications to compensate delays until the data is available.

```java
@Test
void shouldCreateUserTask() {
    // given: the process is deployed
    // when: create a process instance

    // then
    Awaitility.await()
        .ignoreException(ClientException.class)
        .untilAsserted(
            () -> {
                final List<UserTask> userTasks = getUserTasks(processInstanceKey);
                assertThat(userTasks).hasSize(1);

                final UserTask userTask = userTasks.getFirst();
                assertThat(userTask)
                    .returns("task", UserTask::getName)
                    .returns("me", UserTask::getAssignee);
            });
}

// helper method
private List<UserTask> getUserTasks(final long processInstanceKey) {
    return client
        .newUserTaskSearchRequest()
        .filter(filter -> filter.processInstanceKey(processInstanceKey).state(UserTaskState.CREATED))
        .send()
        .join()
        .items();
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
