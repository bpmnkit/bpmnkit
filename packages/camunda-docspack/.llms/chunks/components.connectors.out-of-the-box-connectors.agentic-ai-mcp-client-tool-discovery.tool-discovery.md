# MCP Client tool discovery — Tool discovery

To mark an activity tool as a gateway tool definition, the agent expects an [extension property](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates#zeebeproperty) named `io.camunda.agenticai.gateway.type` with the value `mcpClient`. This is automatically applied by the provided [MCP connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector#mcp-connectors), but it also allows for more advanced use cases, such as tool calling with human-in-the-loop interaction, when added to other activities, like an intermediate event.

When the AI agent connector [resolves its available tools](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-resolution), it also resolves gateway tool definitions. If required by the gateway tool type, it initiates a tool discovery loop through the ad-hoc sub-process.

The implementation of tool discovery depends on the gateway tool type. For MCP clients (gateway type `mcpClient`), it triggers the [`tools/list`](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#listing-tools) method on each MCP Client connector configured within the ad-hoc sub-process. It is the responsibility of the MCP client implementation to fetch tool definitions from the connected MCP server and return them to the AI agent as part of this discovery call.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-tool-discovery
