# MCP Remote Client connector — Transport type

Select the transport protocol for connecting to the remote MCP server.

### Streamable HTTP

Use for MCP servers exposing a Streamable HTTP endpoint.

**Info**
This is the recommended transport for new implementations.

| Field   | Required | Description                                                                        |
| :------ | :------- | :--------------------------------------------------------------------------------- |
| URL     | Yes      | The Streamable HTTP endpoint URL. Typically ends in `/mcp`.                        |
| Headers | No       | Custom HTTP headers as a FEEL map. For example, `={ "X-Custom-Header": "value" }`. |
| Timeout | No       | Connection timeout as an ISO 8601 duration. For example, `PT60S`.                  |

### Server-Sent Events (SSE)

Use for MCP servers exposing a Server-Sent Events (SSE) endpoint.

**Info**
This transport type is considered legacy; use Streamable HTTP for new implementations where possible.

| Field   | Required | Description                                                                        |
| :------ | :------- | :--------------------------------------------------------------------------------- |
| URL     | Yes      | The SSE endpoint URL. Typically ends in `/sse`.                                    |
| Headers | No       | Custom HTTP headers as a FEEL map. For example, `={ "X-Custom-Header": "value" }`. |
| Timeout | No       | Connection timeout as an ISO 8601 duration. For example, `PT60S`.                  |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector
