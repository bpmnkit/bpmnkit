# Operation data structure — Inbound channel

Alongside the actor, operations record the inbound channel through which they were triggered, when available, identifying how the operation entered the system:

| Channel  | Description                                                                                                                                                                          |
| :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REST     | The operation was triggered through the Orchestration Cluster REST API.                                                                                                              |
| GRPC     | The operation was triggered through the gRPC API.                                                                                                                                    |
| MCP      | The operation was triggered through the [Model Context Protocol (MCP)](https://docs.camunda.io/docs/next/components/agentic-orchestration/expose-process-as-mcp-tool), for example, by an AI agent invoking an MCP tool. |
| INTERNAL | The operation was triggered internally by Camunda.                                                                                                                                   |

When the operation was triggered through MCP, the record also captures the name of the MCP tool that triggered it, so you can distinguish operations initiated by AI agents through MCP from those performed directly by users or clients.

In the REST API, these values are exposed as `inboundChannelType` and `inboundChannelToolName`.
In Operate, when the inbound channel is `MCP`, it is shown separately in the **Actor** column. The channel and the channel tool name are also shown in the operation details popup.

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview/operation-structure
