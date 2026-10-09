# Configuration — Logging — Custom prompt

You can replace the default evaluation criteria with a custom prompt. The custom prompt replaces only the evaluation
criteria (the "You are an impartial judge..." preamble). The system still controls the expectation and value injection,
the scoring rubric, and the JSON output format.

By default, CPT uses an internal prompt that instructs the model to act as an impartial judge, compare the provided
value against the natural language expectation, apply the documented scoring rubric, and return the result in the
expected JSON structure.

```yaml
camunda:
  process-test:
    judge:
      custom-prompt: "You are a domain expert evaluating financial data accuracy."
```

```properties
judge.customPrompt=You are a domain expert evaluating financial data accuracy.
```

Or programmatically:

```java
JudgeConfig.of(prompt -> myChatModelAdapter.generate(prompt))
    .withCustomPrompt("You are a domain expert evaluating financial data accuracy.");
```

You can also override the custom prompt for a single assertion chain:

```java
assertThat(processInstance)
    .withJudgeConfig(config -> config
        .withCustomPrompt("You are a domain expert evaluating financial data accuracy."))
    .hasVariableSatisfiesJudge("result", "Contains valid totals.");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
