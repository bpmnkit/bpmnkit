# MCP Remote Client connector

The MCP Remote Client connector allows connecting an AI agent to a remote MCP server by configuring a connection to a
[Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http) (recommended) or [HTTP with SSE](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports#http-with-sse) (legacy) endpoint.


## Limitations

Since the MCP client functionality is handled by a stateless [job worker](https://docs.camunda.io/docs/next/components/concepts/job-workers), each activation of an activity using the MCP Remote Client connector requires opening a dedicated HTTP connection/SSE subscription to the MCP server.

For example, each of the following actions in an agent loop opens and closes a dedicated MCP client connection to the remote server:

1. Tool discovery
2. Tool call
3. Every subsequent tool call

Due to this overhead, the MCP Remote Client connector is primarily intended for prototyping and testing purposes. For production or more efficient usage, consider using the [MCP Client](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector) connector instead.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector
