# LLM recommendations for agentic processes — General recommendations for agentic processes — Account for limited memory and long processes

Agentic workflows can be long-running. The AI model won’t “remember” everything forever, as its memory is essentially the prompt history within the context window.

- If your process spans multiple steps or lengthy pauses, store important information outside the model’s short-term memory. Use Camunda’s document storage or your own persistent storage layer, such as a database, to save key data between steps.
- For example, if the agent gathers info in an early step that’s needed much later, persist that info so it can be reloaded into the prompt when required. This way, the agent can retrieve past knowledge without relying on an ever-growing prompt history.

**Note**
An agentic process might pause or wait for events, causing the context to reset between runs. By saving state to a database or Camunda document storage, you ensure nothing vital is lost when the process continues. Think of it as the agent’s long-term memory—use it for any details the agent might need beyond the current prompt.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
