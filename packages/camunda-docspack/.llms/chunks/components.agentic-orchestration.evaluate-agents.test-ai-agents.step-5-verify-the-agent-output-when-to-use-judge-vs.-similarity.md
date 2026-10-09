# Test your AI agents with CPT — Step 5: Verify the agent output — When to use judge vs. similarity

| Assertion                                               | Best for                                                                                                                                                                                                                                | Cost                                                                                                                  |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [Judge](#verify-with-judge-assertions)                  | Open-ended natural-language criteria, multi-part expectations, structured data, Camunda document content (with [document attachment](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#document-attachment) enabled), anything that needs reasoning. | One extra LLM call per assertion. Score and explanation depend on the configured judge model.                         |
| [Semantic similarity](#verify-with-semantic-similarity) | Checks where a concrete reference text is close to a variable's actual content. Deterministic and fast.                                                                                                                                 | One embedding call per value. No reasoning step, so it cannot evaluate criteria that aren't expressed in the wording. |

**Tip**

- Use judge assertions when it feels natural to express the expectation in natural language.
- Use similarity assertions when the expected answer is itself a sample string.

#### Limitations

- Judge assertions support Camunda document evaluation when [document attachment](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#document-attachment) is enabled. When enabled, document references in the variable are resolved, and their content is passed to the judge as structured content blocks.

- Semantic similarity assertions operate on the **serialized JSON string** of a process variable and cannot evaluate non-text content, such as [Camunda documents](https://docs.camunda.io/docs/next/components/document-handling/getting-started) or other embedded binaries. In those cases, only metadata or encoded strings reach the assertion.

- Semantic similarity assertions compare the serialized variable against the expected string using a vector space. Highly structured variables, such as JSON objects with many fields, may score lower than expected even when the semantic meaning matches.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
