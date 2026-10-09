# Glossary — AI agent

An addressable execution of an [LLM](#large-language-model-llm)-driven loop with shared memory context across iterations. An agent runs an [agent loop](#agent-loop) where the model decides what to do next, which tools to invoke, and when to stop.

The loop is what makes it an agent. A standalone LLM call with no loop and no autonomous tool selection, such as a single connector call that returns output along a fixed execution path, is not an agent.

Camunda supports two types of agents: a [Camunda AI agent](#camunda-ai-agent) (native) and an [external agent](#external-agent) (non-native).

For example, you can build an invoice-processing AI agent in Camunda with BPMN, using the AI Agent Sub-process template to provide LLM reasoning, tool calling, and short-term memory in a governed feedback loop.

- [AI agents](https://docs.camunda.io/docs/next/components/agentic-orchestration/ai-agents)
- [Build your first AI agent](https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
