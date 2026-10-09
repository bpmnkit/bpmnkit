# Test your AI agents with CPT — Step 5: Verify the agent output — Add a similarity assertion

With the embedding model configured, use `hasVariableSimilarTo` as a complementary check on the `responseText` variable of the `User_Feedback` task instance:

```java
assertThat(processInstance)
    .hasVariableSimilarTo(
        "User_Feedback",
        "responseText",
        """
          Hey Ervin! Here is a joke for you:
          Why did the workflow cross the road? To get to the happy path.
        """);
```

The assertion converts both strings to embeddings, applies the default text preprocessors (lowercase, Unicode NFC, and whitespace normalization), and compares cosine similarity against the default threshold of 0.5.

Override the minimal success threshold for a single assertion if you require a higher precision for some assertions:

```java
assertThat(processInstance)
    .withSemanticSimilarityConfig(config -> config.withThreshold(0.8))
    .hasVariableSimilarTo(
        "User_Feedback",
        "responseText",
        """
          Hey Ervin! Here is a joke for you:
          Why did the workflow cross the road? To get to the happy path.
        """);
```

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
