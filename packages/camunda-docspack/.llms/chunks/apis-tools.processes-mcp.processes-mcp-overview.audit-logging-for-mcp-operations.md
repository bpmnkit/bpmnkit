# Processes MCP Server — Audit logging for MCP operations

Operations triggered through the Processes MCP Server are recorded in the [audit log](https://docs.camunda.io/docs/next/components/audit-log/overview), like any other operation. Because the tool call enters through MCP, each resulting record has an inbound channel of `MCP` and captures the name of the MCP tool that triggered it, so you can distinguish operations initiated by AI agents through MCP from those performed directly by users or clients.

See [inbound channel](https://docs.camunda.io/docs/next/components/audit-log/overview/operation-structure#inbound-channel) for details on how this is presented in the applications and the REST API.

**Note**
The Processes MCP Server uses the same authentication as the REST API, so a tool call is attributed to the authenticated user or client.

By default, [only user operations are recorded](https://docs.camunda.io/docs/next/components/audit-log/overview/recorded-operations#limitations-and-constraints), not client operations. To capture MCP tool calls made by a client, configure the audit log to also track client operations.

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview
