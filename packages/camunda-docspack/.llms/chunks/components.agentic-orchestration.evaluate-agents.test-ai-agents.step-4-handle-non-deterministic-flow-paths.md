# Test your AI agents with CPT — Step 4: Handle non-deterministic flow paths

In this guide, the test uses the prompt `"Give me a joke! Greet Ervin as an introduction"`. In response, the agent:

- Calls `List Users` and `Jokes API` in any order.
- Collects feedback through the `User Feedback` user task.

With [conditional behavior](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#conditional-behavior), you can register background reactions that monitor the process state and execute actions as conditions are met, without blocking the test thread. Register behaviors before starting the process; they then react independently as the process progresses.

Each behavior watches for a specific element to become active and then completes it with test data. If the agent never activates that element, the behavior simply never triggers and the test does not stall.

### Complete tool tasks

Register a behavior for each tool task the agent might invoke. In this integration test, these behaviors stand in for external tool executions such as REST connector calls.

First, define records for the tool call results:

```java
record User(int id, String name, String username) {}
```

Register a behavior that completes the `List Users` tool with a mock user list when the agent invokes it:

```java
processTestContext
    .when(
        () -> assertThatProcessInstance(ProcessInstanceSelectors.byProcessId("ai-agent-chat-with-tools"))
            .hasActiveElements("ListUsers"))
    .as("complete ListUsers")
    .then(
        () -> processTestContext.completeJob(
            JobSelectors.byElementId("ListUsers"),
            Map.of("toolCallResult",
                List.of(
                    new User(1, "Leanne Graham", "Bret"),
                    new User(2, "Ervin Howell", "Antonette")))));
```

Register a behavior that completes the `Jokes API` tool. This behavior uses chained `.then()` calls to return different jokes on repeated invocations:

```java
String firstJoke = "Why did the workflow cross the road? To get to the happy path.";
String secondJoke = "Why did the BPMN diagram apply for a job? It had excellent flow experience.";

processTestContext
    .when(
        () -> assertThatProcessInstance(ProcessInstanceSelectors.byProcessId("ai-agent-chat-with-tools"))
            .hasActiveElements("Jokes_API"))
    .as("complete jokes tool")
    .then(
        () -> processTestContext.completeJob(
            byElementId("Jokes_API"), Map.of("toolCallResult", firstJoke)))
    .then(
        () -> processTestContext.completeJob(
            byElementId("Jokes_API"), Map.of("toolCallResult", secondJoke)));
```

### Complete user tasks

The `User Feedback` user task is outside the agent and prompts the user to approve the agent output or request a different one.

Use chained `.then()` calls when a behavior should produce different results on repeated invocations: the first action is consumed on the first invocation, and the last action repeats for all subsequent invocations.

For example, register a behavior that first rejects the joke with a follow-up request, then approves the result on the next invocation:

```java
processTestContext
    .when(
        () -> assertThatProcessInstance(ProcessInstanceSelectors.byProcessId("ai-agent-chat-with-tools"))
            .hasActiveElements("User_Feedback"))
    .as("feedback loop")
    .then(
        () -> processTestContext.completeUserTask(
            "User_Feedback",
            Map.of(
                "userSatisfied", false,
                "followUpInput", "This joke is bad, send Ervin a better joke")))
    .then(
        () -> processTestContext.completeUserTask(
            "User_Feedback", Map.of("userSatisfied", true)));
```

**Important**
Each behavior's action should resolve the process state that the condition checks for. For example, if the condition checks for an active user task, the action should complete that task. Otherwise the behavior may execute repeatedly.

For the full conditional behavior API, see [Utilities](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#conditional-behavior).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
