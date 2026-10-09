# AI Agent Task connector — Tools

Specify the tool resolution for an accompanying ad-hoc sub-process.

| Field                 | Required | Description                                                                                                                                                                                                                                                                                                                        |
| :-------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ad-hoc sub-process ID | No       | Specify the element ID of the ad-hoc sub-process to use for tool resolution (see [Tool Definitions](https://docs.camunda.io/docs/next/agentic-ai-aiagent-tool-definitions)).When entering the AI Agent connector, the connector resolves the tools available in the ad-hoc sub-process, and passes these to the LLM as part of the prompt. |
| Tool call results     | No       | Specify the results collection of the ad-hoc sub-process multi-instance execution.Example: `=toolCallResults`                                                                                                                                                                                                        |

**Note**

- Leave this section empty if using this connector independently, without an accompanying ad-hoc sub-process.
- To actually use the tools, you must model your process to include an [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop), routing into the ad-hoc sub-process and back to the AI agent connector, and configure the sub-process for tool calls. See [agent loop for tool calls](https://docs.camunda.io/docs/next/agentic-ai-aiagent-task-example#tools-loop).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
