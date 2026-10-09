# Task testing — Variable persistence

When a test completes:

- Input variables are stored locally for reuse in subsequent test runs.
- The last test result of an element is persisted, including output variables.
- You can rerun tests with the same input set or modify them to test new values.


## Best practices

- Use a staging cluster or sandbox environment for testing live integrations.
- Mock external API calls and disable production credentials when possible.
- Review results in Operate to confirm behavior and variable mappings.

---
Source: https://docs.camunda.io/docs/next/components/modeler/task-testing
