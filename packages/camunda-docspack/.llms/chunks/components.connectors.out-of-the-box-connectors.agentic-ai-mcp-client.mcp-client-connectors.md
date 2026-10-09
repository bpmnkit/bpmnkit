# MCP Client — MCP Client connectors

Camunda provides two MCP connectors with distinct purposes.

| Connector                                                                  | STDIO       | Remote/HTTP | Configuration                        | Availability                                                                                                | Description                                                                                                            |
| :------------------------------------------------------------------------- | :---------- | :---------- | :----------------------------------- | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [MCP Remote Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector) | Unsupported | Supported   | Properties panel                     | Available on SaaS                                                                                           | Suitable for prototyping with remote MCP servers. Uses on-demand HTTP connections instead of persistent ones.          |
| [MCP Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector)               | Supported   | Supported   | Connector runtime + properties panel | Not directly available on SaaS, but a custom runtime running the client connector can be connected to SaaS. | Flexible MCP integration based on persistent connections managed by the connector runtime. Supports STDIO MCP servers. |

**Info**
The two connectors are not mutually exclusive and can be used together as long as your environment is configured accordingly.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client
