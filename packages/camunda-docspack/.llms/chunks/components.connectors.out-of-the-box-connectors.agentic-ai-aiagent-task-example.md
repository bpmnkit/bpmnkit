# Example AI Agent Task connector integration

Example integration using the AI Agent Task connector to implement an agent loop for tool calls with an LLM.

This worked example demonstrates how to use the [AI Agent Task connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task) and an [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) to model an AI Agent [agent loop for tools and response interaction](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent#agent-loop-use-cases).


## Create an AI Agent element

First, an AI Agent connector is added and configured in the process diagram. Next, an ad-hoc sub-process is added in an [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop) to connect the agent to the tools it needs.

**Info**
For more information on how to model the tools available to the AI agent, see [tool definitions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions).

After adding the element, open the properties panel to configure the connection to your model provider and adapt the system and user prompts as needed.

It is important to align the **Agent context** field and the result variable. The following defaults should be set to ensure re-entering the process will pick up the previous context value:

- **Agent context**: `agent.context`
- **Result variable**: `agent`

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task-example
