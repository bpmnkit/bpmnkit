# LLM recommendations for agentic processes — General recommendations for agentic processes — Incorporate human feedback when appropriate

Consider adding a “human in the loop” as one of the agent’s tools. In practice, this could be a special tool, such as `ask_human` or a review task, that the agent can invoke to get confirmation or guidance from a user.

- This is especially useful for high-stakes decisions or if the AI is unsure how to proceed. Designing your process with a human feedback option means the agent can defer to a person instead of guessing.
- For example, the workflow might include a step where an employee reviews the AI’s draft output or where the AI explicitly asks the user to clarify an ambiguous request. This supervision loop can greatly improve the quality and safety of the agent’s actions.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
