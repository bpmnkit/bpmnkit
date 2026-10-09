# Assertions — Value assertions

You can verify arbitrary string values, independent of a process instance, using `CamundaAssert.assertThatValue()`.

This is useful for evaluating
values produced outside of a running process. For example, a single property of a variable object, with the
same LLM judge and embedding-based similarity checks used for process variables.

### satisfiesJudge

Assert that the given value satisfies a natural language expectation using a configured LLM judge. The expectation is evaluated only once. The
assertion fails if the LLM score is below the configured threshold (default: 0.5). It requires [judge configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#judge-configuration).

[Document attachment](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#document-attachment) is not supported for value assertions. To evaluate document content, use [hasVariableSatisfiesJudge](#hasvariablesatisfiesjudge) or [hasLocalVariableSatisfiesJudge](#haslocalvariablesatisfiesjudge) instead.

```java
assertThatValue("The order has been shipped and will arrive tomorrow.")
    .satisfiesJudge("Confirms that the order is on its way to the customer.");
```

Override the global judge configuration for a single assertion chain using `withJudgeConfig`.

```java
assertThatValue(response)
    .withJudgeConfig(config -> config.withThreshold(0.9))
    .satisfiesJudge("Contains a valid JSON response with status OK.");
```

### isSimilarTo

Assert that the given value is semantically similar to an expected string using a configured embedding model. Both values are converted to embeddings,
and the cosine similarity is compared against the configured threshold. The assertion fails if the similarity score is below the configured threshold
(default: 0.5). It requires [semantic similarity configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#semantic-similarity-configuration).

```java
assertThatValue("Hi there, what can I do for you?")
    .isSimilarTo("Hello, how can I help you today?");
```

Override the global semantic similarity configuration for a single assertion chain using `withSemanticSimilarityConfig`.

```java
assertThatValue(response)
    .withSemanticSimilarityConfig(config -> config.withThreshold(0.9))
    .isSimilarTo("Hello, how can I help you today?");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
