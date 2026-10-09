# Utilities — Mock child processes

You can mock a child process for a call activity to simulate its output without executing the actual child process.
The mock deploys a dummy process with the given process ID that returns the given variables.
You can optionally add a version tag. This is required when the call activity uses `bindingType="versionTag"` to resolve the child process by a specific version.

When to use it:

- Test the parent process in isolation from the actual child process
- Simulate different outcomes of a child process
- Mock a non-existing child process

```java
@Test
void shouldMockChildProcess() {
    // given: mock child process with the process ID "lunar-lander"
    // 1) Complete the child process without variables
    processTestContext.mockChildProcess().withProcessId("lunar-lander").thenComplete();

    // 2) Complete the child process with variables
    final Map<String, Object> variables = Map.of("landingStatus", "nominal");
    processTestContext.mockChildProcess().withProcessId("lunar-lander").thenComplete(variables);

    // 3) Complete the child process with a version tag
    // Use when the call activity has bindingType="versionTag"
    processTestContext.mockChildProcess()
        .withProcessId("lunar-lander")
        .withVersionTag("1.7.1")
        .thenComplete(variables);

    // when: create a process instance
    // then: verify that the process instance completed the call activity
}
```

### Child process with dynamic variables

You can mock a child process with dynamic behavior whose output variables are derived from the parent process instance.
The handler receives the parent variables and returns the child process variables.

```java
@Test
void shouldMockChildProcess() {
    // given: mock dynamic child process with the process ID "AstronautTrainingProcess"
    processTestContext
        .mockChildProcess()
        .withProcessId("AstronautTrainingProcess")
        .thenComplete(parentVariables -> {
            final String astronautName = (String) parentVariables.get("astronautName");
            final String grade = "Zee".equals(astronautName) ? "excellent" : "good";

            return Map.of(
                "trainingCompleted", true,
                "grade", grade);
        });

    // when: create a process instance
    // then: verify that the process instance completed the call activity
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
