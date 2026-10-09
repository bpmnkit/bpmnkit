# Design and architecture — Design agent orchestration workflows

Follow these principles when designing your agentic orchestration solution:

- **Guardrail sandwich**: Apply guardrails in your process when using agents. For example, you could have one agent performing the task execution, with another agent following up to check the chain of thought and make sure every execution is compliant. If the execution is not compliant, route to a human for additional validation.
- **Human-in-the-Loop escalation**: Provide an agent with an escalation path to a human - confidence levels are useful, but it is good to always provide deterministic outbreaks for agents.
- **Prompt versioning**: Version every prompt, so you can revert to using a previous prompt when required.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture
