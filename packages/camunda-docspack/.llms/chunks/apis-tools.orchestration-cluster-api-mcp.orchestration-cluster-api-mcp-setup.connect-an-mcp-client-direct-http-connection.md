# Enable and connect — Connect an MCP client — Direct HTTP connection

If your Orchestration Cluster does not require authentication, for example, when running locally with [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) or [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), you can connect directly to the MCP server endpoint without any additional tooling.

Any MCP client that supports [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http) can be used. For authenticated environments, [use c8ctl `mcp-proxy`](#use-c8ctl-mcp-proxy) instead.

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

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-setup
