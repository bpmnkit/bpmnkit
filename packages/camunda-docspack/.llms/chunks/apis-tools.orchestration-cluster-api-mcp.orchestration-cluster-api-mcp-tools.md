# Available tools

List of MCP tools exposed by the Orchestration Cluster MCP Server.

The following tools are available through the Orchestration Cluster MCP server, grouped by domain.

**Info**
Tool names, parameters, and response schemas are fully discoverable by MCP clients at runtime. The exact tool signatures may evolve across versions.


## Cluster

| Tool               | Description                                                                           |
| :----------------- | :------------------------------------------------------------------------------------ |
| `getClusterStatus` | Returns whether the cluster is healthy (at least one partition has a healthy leader). |
| `getTopology`      | Returns cluster topology including brokers, partitions, roles, health, and versions.  |

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-tools
