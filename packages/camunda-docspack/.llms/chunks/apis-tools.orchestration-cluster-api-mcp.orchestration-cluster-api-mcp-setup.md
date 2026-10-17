# Enable and connect

Enable the Orchestration Cluster MCP Server and configure MCP clients to connect.

Enable the Orchestration Cluster MCP Server and configure MCP clients to connect.


## Enable the Orchestration Cluster MCP Server

The MCP server is enabled by default in [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) and [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose). For other deployment types, it must be explicitly enabled before MCP clients can connect.
Depending on your deployment, enable it as follows:

### c8run

The MCP server is **enabled by default** in Camunda 8 Run. No additional configuration is needed.

### docker-compose

The MCP server is **enabled by default** in the Docker Compose distribution. No additional configuration is needed.

### helm

Set the following [`extraConfiguration`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs#configuration-options) value in your Helm chart values:

```yaml
orchestration:
  extraConfiguration:
    - file: mcp-gateway.yaml
      content: |
        camunda:
          mcp:
            enabled: true
```

### saas

In Camunda Hub:

1. In the left navigation, under **Clusters**, select a cluster.
1. Open the **Settings** tab
1. Enable MCP support.

**Info**
MCP server support is available on SaaS clusters running Camunda 8.9.0 or later.

For a full reference of MCP configuration properties, see the [property reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#api---mcp).

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-setup
