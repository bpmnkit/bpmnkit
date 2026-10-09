# Processes MCP Server — Get started

**Important: Camunda 8.10**
The Processes MCP Server is only available from Camunda 8.10 onwards.

To expose a BPMN process as an MCP tool, see [Expose a process as an MCP tool](https://docs.camunda.io/docs/next/components/agentic-orchestration/expose-process-as-mcp-tool).

If you have a local Orchestration Cluster running with [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) or [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), the Processes MCP Server is enabled by default. Connect any MCP client using this configuration:

```json
{
  "servers": {
    "camunda-processes": {
      "type": "http",
      "url": "http://localhost:8080/mcp/processes"
    }
  }
}
```

For production environments and other deployment types, the Processes MCP Server must be explicitly enabled before use. See [Enable and connect](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-setup) for more details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview
