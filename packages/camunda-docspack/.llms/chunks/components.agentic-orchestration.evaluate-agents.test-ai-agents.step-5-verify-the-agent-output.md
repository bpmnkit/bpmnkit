# Test your AI agents with CPT — Step 5: Verify the agent output

You can use two types of assertions to verify the agent output:

- **[Judge assertions](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariablesatisfiesjudge)** verify AI-generated output or tool execution results with a judge LLM that scores whether a value satisfies a natural-language expectation.
- **[Semantic similarity assertions](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariablesimilarto)** verify AI-generated output against a reference text using embeddings and cosine similarity. They are a deterministic, lower-cost alternative to judge assertions.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
