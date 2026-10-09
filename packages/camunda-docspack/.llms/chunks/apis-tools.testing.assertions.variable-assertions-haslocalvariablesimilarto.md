# Assertions — Variable assertions — hasLocalVariableSimilarTo

Assert that a local variable in the scope of a given element is semantically similar to an expected string using a configured embedding model. Use the BPMN
element ID or an [element selector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the element. The assertion fails if the variable doesn't exist or the
similarity score is below the configured threshold (default: 0.5). It requires [semantic similarity configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#semantic-similarity-configuration).

```java
assertThat(processInstance)
    .hasLocalVariableSimilarTo(
        ElementSelectors.byName("Greet Customer"), "output",
        "Hello, how can I help you today?");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
