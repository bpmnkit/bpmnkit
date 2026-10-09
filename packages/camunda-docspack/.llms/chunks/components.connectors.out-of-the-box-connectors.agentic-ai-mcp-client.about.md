# MCP Client — About

Camunda's MCP Client enables you to use the [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent) together with MCP clients to access tools provided by MCP servers.

**Info**
The MCP Client supports only tool-related functionality. Other MCP features, such as resources or prompts, are not currently supported.

This includes:

- Locally started standard input/output servers [STDIO](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#stdio). These are operating system processes launched and managed by the connector runtime.
- Remote MCP servers using [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http) and [HTTP with SSE](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports#http-with-sse) (deprecated).

See the MCP Client architecture below:

![MCP Client architecture](agentic-ai/img/mcp-clients-architecture.png)

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client
