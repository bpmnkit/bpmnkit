# Add tools to an AI agent

Add BPMN elements as callable tools to your AI agents.

Add BPMN elements as callable tools to your AI agents.


## About

A tool is a single BPMN element, or a flow of BPMN elements, inside an [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) that an [LLM](https://docs.camunda.io/docs/next/reference/glossary#large-language-model-llm) can choose to invoke to complete a goal. When a tool is a flow of several elements, only the root node is exposed to the LLM as a tool.

You can use any BPMN element or connector as a tool. See [AI agent tool definitions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions) for more details.

**Note: See a full example**
For this in the context of a running AI agent, see [add your first tool](https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration#step-4-add-your-first-tool).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
