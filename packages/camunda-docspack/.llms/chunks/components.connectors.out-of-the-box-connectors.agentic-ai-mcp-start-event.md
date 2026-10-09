# MCP start event

Reference for the MCP start event element template, which registers a BPMN process as a callable MCP tool in the Processes MCP Server.

The **MCP start event** is an [element template](https://docs.camunda.io/docs/next/reference/glossary#element-template) applied to a BPMN message start event. When deployed, it registers the process as an MCP tool in the [Processes MCP Server](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview).

**Note**
The MCP start event is not handled by the Connector Runtime like other Connectors. The element template configures the start event metadata that the Processes MCP Server uses to expose the process as a tool to MCP clients.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-start-event
