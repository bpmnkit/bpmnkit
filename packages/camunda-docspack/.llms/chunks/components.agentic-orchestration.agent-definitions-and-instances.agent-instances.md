# Agent definitions and instances — Agent instances

An agent instance is a specific runtime execution of an agent definition that can be created for an active agent element. It is identified by an agent instance key, which the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-agent-instance.api) uses to represent the agent's state, including conversation, tool calls, and reasoning, for visibility and explainability in tools like Operate.

This representation is not the source of truth for the agent's runtime execution; how an agent's actual state is stored depends on its type, as described in [Agent context and memory](#agent-context-and-memory).

For [Camunda AI agents](https://docs.camunda.io/docs/next/reference/glossary#camunda-ai-agent), both the AI agent Sub-process and AI Agent Task types, the AI Agent connector automatically creates the agent instance through the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api) as the first step in handling the job for an active agent element. For [external agents](https://docs.camunda.io/docs/next/reference/glossary#external-agent), the external runtime creates the instance itself by calling the same API, which can happen at any point while the element is active.

You can reuse an agent instance across multiple element instances within the same process instance, allowing the agent to maintain a multi-turn conversation when the process loops back to it.

Use the [search endpoint](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-agent-instances.api) to list agent instances filtered by any of their properties, including their agent definition key. For example, you can find every runtime instance created from a specific process definition version.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
