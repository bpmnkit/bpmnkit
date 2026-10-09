# Property reference — API - MCP

### application.yaml

### `camunda.mcp`

| Property              | Description                                                                                                                                                                                                                | Default value | Overridable per Physical Tenant |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `camunda.mcp.enabled` | Enable the MCP server. When enabled, the Orchestration Cluster exposes a [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http) MCP server at `/mcp/cluster`. | `false`       | No                              |

  
  
### env

### `CAMUNDA_MCP`

| Property              | Description                                                                                                                                                                                                                | Default value | Overridable per Physical Tenant |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_MCP_ENABLED` | Enable the MCP server. When enabled, the Orchestration Cluster exposes a [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http) MCP server at `/mcp/cluster`. | `false`       | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
