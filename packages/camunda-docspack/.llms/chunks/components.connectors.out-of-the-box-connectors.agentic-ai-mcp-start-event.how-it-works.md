# MCP start event — How it works

When the process is deployed:

1. The Processes MCP Server reads the element template metadata and registers the process as an MCP tool.
2. MCP clients can discover the tool by name and call it.
3. Each tool invocation starts a new process instance with the tool call arguments mapped as process variables.
4. The MCP Server returns the key of the started process instance to the client, which can use it to track execution status or retrieve results.

**Important**
Only the latest deployed version of a process is exposed. See [version binding](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-version-binding) for more details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-start-event
