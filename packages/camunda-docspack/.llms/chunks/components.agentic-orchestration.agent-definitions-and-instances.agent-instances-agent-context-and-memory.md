# Agent definitions and instances — Agent instances — Agent context and memory

For [Camunda AI agents](https://docs.camunda.io/docs/next/reference/glossary#camunda-ai-agent), the AI Agent connector keeps the agent's runtime state in an agent context object. The context holds the conversation, tool calls and their results, reasoning traces, and metadata such as token usage. It also records the agent instance key, which links the context back to its agent instance.

[External agents](https://docs.camunda.io/docs/next/reference/glossary#external-agent) don't use this agent context. Their runtime manages the agent's actual state independently of Camunda, and reports only what it chooses through the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api) for visibility.

By default, the agent context is stored as a process variable, typically named `agent`, and is available both on the agent element and on the process instance. When the process returns to the agent element, the agent evaluates a FEEL expression (for example, `agent.context`) to load the existing context and continue the conversation with the same agent instance.

You control this behavior through the agent's memory configuration:

- **Reuse the context** to continue an existing conversation. The process passes the stored context back to the agent element, and the same agent instance handles each activation.
- **Start with a fresh context** on each activation. The agent element receives an empty context, so Camunda creates a new agent instance every time the element is entered, and no memory carries over.

Where the context is stored depends on the memory storage type. See [memory](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#memory) for more details.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
