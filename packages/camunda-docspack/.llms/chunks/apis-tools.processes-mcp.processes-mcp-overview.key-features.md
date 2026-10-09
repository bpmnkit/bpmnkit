# Processes MCP Server — Key features

| Feature                   | Description                                                                                                                                                  |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Process tool registration | Processes with an MCP start event are automatically registered as MCP tools on deployment.                                                                   |
| Tool discovery            | MCP clients discover available process tools and their schemas at runtime.                                                                                   |
| Static tools              | The server also exposes a set of [static tools](#static-tools) for inspecting running process instances.                                                     |
| Version binding           | Only the latest deployed version of a process is exposed. See [Version binding](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-version-binding).                                         |
| Standard transport        | Uses [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http), compatible with any MCP-compliant client. |

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview
