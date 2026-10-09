# Utilities — Selectors

CPT provides selectors to identify entities such as jobs, user tasks, process instances, and more based on different
criteria. You can use selectors in both utilities and assertions to target the entities you want to interact
with or verify. The selector targets the first matching entity.

CPT provides predefined selectors for common use cases. You can combine multiple selectors using `.and()` to create more
specific selection criteria.

```java
// Combine job selectors by job type and process instance key
processTestContext.completeJob(
    JobSelectors.byJobType("send-notification")
        .and(JobSelectors.byProcessInstanceKey(processInstanceKey))
);
```

Alternatively, you can implement your own custom selector when you need specialized selection logic.

```java
// Implement a custom selector to select a user task by its assignee
private static UserTaskSelector byAssignee(String assignee) {
    return new UserTaskSelectorByAssignee(assignee);
}

private static final class UserTaskSelectorByAssignee implements UserTaskSelector {

    private final String assignee;

    public UserTaskSelectorByAssignee(String assignee) {
        this.assignee = assignee;
    }

    @Override
    public boolean test(final UserTask userTask) {
        return assignee.equals(userTask.getAssignee());
    }

    @Override
    public String describe() {
        return "assignee: " + assignee;
    }

    @Override
    public void applyFilter(final UserTaskFilter filter) {
        filter.assignee(assignee);
    }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
