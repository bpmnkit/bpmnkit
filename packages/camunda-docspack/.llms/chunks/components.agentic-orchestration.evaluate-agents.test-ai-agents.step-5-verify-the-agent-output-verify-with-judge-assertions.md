# Test your AI agents with CPT — Step 5: Verify the agent output — Verify with judge assertions

Use a judge assertion to verify the agent output satisfies a natural language expectation.

The following example registers the conditional behaviors from [Step 4](#step-4-handle-non-deterministic-flow-paths), starts the process with the prompt `"Give me a joke! Greet Ervin as an introduction"`, and then asserts that the agent completed the scenario correctly:

```java
@Test
void shouldSendErvinAJoke() {
    ProcessInstanceEvent processInstance = client.newCreateInstanceCommand()
        .bpmnProcessId("ai-agent-chat-with-tools")
        .latestVersion()
        .variables(Map.of("inputText", "Give me a joke! Greet Ervin as an introduction"))
        .send()
        .join();

    assertThat(processInstance).isCompleted();
    assertThat(processInstance)
        .hasVariableSatisfiesJudge(
            "agent",
            """
            The agent correctly identified Ervin by calling ListUsers.
            The agent fetched a joke using Jokes_API.
            After the user rejected the first joke and asked for another one, the
            agent offered a second, different joke.
            """);
}
```

The expectation is a plain-text description of what the agent should have done. The judge does not compare strings literally. It evaluates whether the actual variable content satisfies the expectation semantically, so different phrasing or formatting in the agent's output does not cause false failures.

The judge evaluates matches using the following scoring scale:

| Score | Meaning                                                                                                                |
| ----- | ---------------------------------------------------------------------------------------------------------------------- |
| 1.0   | Fully satisfied semantically. Different wording or formatting that conveys the same meaning counts as fully satisfied. |
| 0.75  | Satisfied in substance with only minor differences that do not affect correctness.                                     |
| 0.5   | Partially satisfied. Some required elements are present but others are missing or incorrect.                           |
| 0.25  | Mostly not satisfied. Only marginal relevance.                                                                         |
| 0.0   | Not satisfied at all, or the actual value is empty.                                                                    |

The LLM may return any value between these anchor points (for example, 0.6 or 0.85). The default threshold is 0.5. This means the assertion passes when the response is at least partially satisfied according to the rubric, which is a practical default for AI-generated output that may vary in wording or completeness across runs. Use a higher threshold when the response must satisfy stricter semantic requirements. You can change the threshold globally in the [judge configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#judge-configuration) or per assertion using `withJudgeConfig`.

If the assertion fails, for example, because the agent made up its own joke instead of calling the `Jokes API` tool, or the feedback was not handled correctly, the judge returns a low score with an explanation of which parts of the expectation were not met. This gives you a clear, human-readable failure message instead of a generic assertion error.

#### Tune the judge evaluation

Use `withJudgeConfig` to set a stricter threshold for individual assertions:

```java
assertThat(processInstance)
    .withJudgeConfig(config -> config.withThreshold(0.8))
    .hasVariableSatisfiesJudge(
        "agent",
        "The email body contains a joke addressed to Ervin.");
```

You can also replace the default evaluation criteria with a custom prompt. The custom prompt replaces only the evaluation criteria. The system still controls the expectation and value injection, the scoring rubric, and the JSON output format.

Set a custom prompt globally in configuration:

```yaml
camunda:
  process-test:
    judge:
      custom-prompt: "You are evaluating whether an AI agent correctly identified the intended recipient, used the right tools, and produced an appropriate email response."
```

Or override the prompt for a single assertion:

```java
assertThat(processInstance)
    .withJudgeConfig(config -> config
        .withCustomPrompt("You are evaluating whether an AI agent correctly identified the intended recipient, used the right tools, and produced an appropriate email response."))
    .hasVariableSatisfiesJudge("agent", "The email body contains a joke addressed to Ervin.");
```

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
