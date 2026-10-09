# Agent definitions and instances

Understand agent definitions and agent instances, the entities Camunda uses to model AI agents.

Understand agent definitions and agent instances, the entities Camunda uses to model AI agents.


## About

Camunda models AI agents using the same definition-and-instance relationship as [processes](https://docs.camunda.io/docs/next/components/concepts/processes).

An **agent definition** describes a deployed agent, while an **agent instance** represents a specific running execution of that agent.

### Why definitions and instances are separate

An AI agent is not the same as the BPMN element that defines it, and it does not have the same lifecycle as an element instance.

- A single agent element defines one agent, whether it is an [AI Agent Sub-process](https://docs.camunda.io/docs/next/reference/glossary#ad-hoc-sub-process), an [AI Agent Task](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent), or an [external agent](https://docs.camunda.io/docs/next/reference/glossary#external-agent).
- Each time the process activates that element, Camunda creates an element instance.
- The agent instance can be **reused across several element instances** within the same process instance.

For example, in a process where the execution returns to the agent element after a user reply, the agent element is activated more than once. Each activation is a separate element instance, but they share the same agent instance so the agent keeps its memory and continues the same conversation.
This reuse is what allows an agent to hold a multi-turn conversation across a loop in the process.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
