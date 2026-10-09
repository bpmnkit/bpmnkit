# Assertions — Variable assertions — hasVariableSatisfiesJudge

Assert that a process variable satisfies a natural language expectation using a configured LLM judge. The expectation is evaluated only once. The assertion
fails if the LLM score is below the configured threshold (default: 0.5). It requires [judge configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#judge-configuration).

When [document attachment](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#document-attachment) is enabled, Camunda document references found in the variable value are resolved and their content is passed to the judge.

```java
assertThat(processInstance)
    .hasVariableSatisfiesJudge("result", "Contains a valid JSON response with status OK.");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
