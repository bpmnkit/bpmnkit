# LLM recommendations for agentic processes — General recommendations for agentic processes — Mind the context window

Consider the model’s context size when designing your agent’s interactions:

- For example, if your model has a 4k token limit, plan your prompt and tool usage so you don’t exceed that. Only include relevant information in the prompt and trim any unnecessary details.
- When defining tools’ input and output, anticipate how large those could be. A large chunk of text returned from a tool can quickly consume the context window, leaving little room for the model’s reasoning or response.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
