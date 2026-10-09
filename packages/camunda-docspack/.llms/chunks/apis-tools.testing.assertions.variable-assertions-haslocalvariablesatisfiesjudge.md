# Assertions — Variable assertions — hasLocalVariableSatisfiesJudge

Assert that a local variable in the scope of a given element satisfies a natural language expectation using a configured LLM judge. Use the BPMN
element ID or an [element selector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the element. The expectation is evaluated only once. The assertion
fails if the LLM score is below the configured threshold (default: 0.5). It requires [judge configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#judge-configuration).

When [document attachment](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#document-attachment) is enabled, Camunda document references found in the variable value are resolved and their content is passed to the judge.

```java
assertThat(processInstance)
    .hasLocalVariableSatisfiesJudge(
        ElementSelectors.byName("Greet Customer"), "output",
        "Contains a polite greeting addressed to the customer.");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
