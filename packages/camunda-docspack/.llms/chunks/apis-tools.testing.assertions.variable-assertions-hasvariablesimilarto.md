# Assertions — Variable assertions — hasVariableSimilarTo

Assert that a process variable is semantically similar to an expected string using a configured embedding model. The variable value and the expected value are
converted to embeddings, and the cosine similarity is compared against the configured threshold. The assertion fails if the variable doesn't exist or the
similarity score is below the configured threshold (default: 0.5). It requires [semantic similarity configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#semantic-similarity-configuration).

```java
assertThat(processInstance)
    .hasVariableSimilarTo("greeting", "Hello, how can I help you today?");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
