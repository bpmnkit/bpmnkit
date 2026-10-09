# Orchestration Cluster MCP Server — Get started

**Important: Camunda 8.9**
The MCP server is only available from Camunda 8.9 onwards.

If you have a local Orchestration Cluster running with [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) or [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), the MCP server is enabled by default. Connect any MCP client using this configuration:

```json
{
  "servers": {
    "camunda": {
      "type": "http",
      "url": "http://localhost:8080/mcp/cluster"
    }
  }
}
```

For production environments and other deployment types, the MCP server must be explicitly enabled on your cluster before use. See [Enable and connect](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-setup) for more details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-overview
