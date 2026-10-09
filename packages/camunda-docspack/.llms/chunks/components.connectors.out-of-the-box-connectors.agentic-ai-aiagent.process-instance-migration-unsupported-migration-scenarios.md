# AI Agent connector — Process instance migration — Unsupported migration scenarios

The following migration scenarios are **not supported** and will result in an error:

| Migration scenario                                                                                                                            | Description                                                                                                                                                                                                                                                                                             |
| :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Removing or renaming tools                                                                                                                    | Removing an existing tool or changing its element ID can lead to stuck executions or validation errors if the agent references tools that no longer exist. The agent throws a `MIGRATION_MISSING_TOOLS` error when it detects a removed tool.                                                           |
| Adding or removing [gateway tool definitions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#gateway-tool-definitions) (such as MCP or A2A clients) | Gateway tools require a tool discovery flow during initialization. Adding or removing gateway tool definitions to a running agent is not supported as it would require re-executing tool discovery. The agent throws a `MIGRATION_GATEWAY_TOOL_DEFINITIONS_CHANGED` error when it detects such changes. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
