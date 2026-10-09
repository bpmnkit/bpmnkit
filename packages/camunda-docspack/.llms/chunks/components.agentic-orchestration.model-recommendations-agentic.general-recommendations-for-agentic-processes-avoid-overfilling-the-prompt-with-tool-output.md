# LLM recommendations for agentic processes — General recommendations for agentic processes — Avoid overfilling the prompt with tool output

Be cautious that tool responses don’t unintentionally fill the entire context.

- If a tool returns very large data, consider post-processing it before feeding it back into the model.
- For example, you might take only a summary of a document rather than the full text.
  This prevents the model’s next prompt from being dominated by irrelevant or excessive content, which can degrade performance and increase cost.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
