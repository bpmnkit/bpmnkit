# AI agents

Build and integrate AI agents into your end-to-end processes.

Build and integrate AI agents into your end-to-end processes.


## About AI agents

An AI agent is an addressable execution of an LLM-driven loop with shared memory context across iterations. An agent runs a loop where the model decides what to do next, which tools to invoke, and when to stop. The loop is what makes it an agent. A standalone LLM call with no loop and no autonomous tool selection, such as a single connector call that returns output along a fixed execution path, is not an agent.

AI agents can perform a variety of functions, including making decisions, solving problems, interacting with external environments, and taking actions.

### Agent types

Camunda supports two types of agents:

- **[Camunda AI agents](https://docs.camunda.io/docs/next/reference/glossary#camunda-ai-agent)** are native. They run their [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop) in Camunda's engine, which activates each tool call as a governed BPMN activity, maintains memory across iterations, and emits lifecycle events. They are implemented using the [AI Agent connector](#the-ai-agent-connector), either as an [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) or an [AI Agent Task](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent#ai-agent-task).
- **[External agents](https://docs.camunda.io/docs/next/reference/glossary#external-agent)** run their [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop) in an external runtime, such as, LangGraph, Amazon Bedrock, or custom code, instead of Camunda's engine.

**Note**
Camunda represents every agent with an [agent definition and agent instances](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/ai-agents
