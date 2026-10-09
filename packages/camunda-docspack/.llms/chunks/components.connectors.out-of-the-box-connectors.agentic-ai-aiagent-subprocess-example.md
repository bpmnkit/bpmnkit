# Example AI Agent Sub-process connector integration

Example integration using the AI Agent Sub-process connector to implement an agent loop for tool calls with an LLM.

This worked example demonstrates how to use the [AI Agent Sub-process connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) applied to an [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) to model an AI Agent [agent loop for tools and response interaction](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent#agent-loop-use-cases).


## Create an AI Agent element

As the **AI Agent Sub-process** implementation implicitly creates an [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop) for tools, you only need to add an ad-hoc sub-process with an applied AI Agent connector template to the process.

**Info**
For more information on how to model the tools available to the AI agent, see [tool definitions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions).

After adding the element, open the properties panel to configure the connection to your model provider, and modify the system and user prompts as required.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess-example
