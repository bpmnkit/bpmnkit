# Glossary — Agent instance

A specific runtime execution of an [agent definition](#agent-definition) that can be created for an active agent element. It is identified by an agent instance key, which the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api) uses to represent the agent's state, including conversation, tool calls, and reasoning, for visibility and explainability in tools like Operate.

An agent instance can be reused across several element instances within the same process instance, which is what allows an agent to continue a multi-turn conversation when the process returns to the agent element.

- [Agent definitions and instances](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
