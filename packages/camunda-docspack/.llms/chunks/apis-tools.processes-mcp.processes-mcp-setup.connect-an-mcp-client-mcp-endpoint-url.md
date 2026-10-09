# Enable and connect — Connect an MCP client — MCP endpoint URL

The Processes MCP Server is served at `/mcp/processes` on the Orchestration Cluster. The full endpoint URL depends on your deployment type:

| Deployment                 | MCP endpoint URL                                                                  |
| :------------------------- | :-------------------------------------------------------------------------------- |
| Camunda 8 Run              | `http://localhost:8080/mcp/processes`                                             |
| Docker Compose             | `http://localhost:8080/mcp/processes`                                             |
| SaaS – public connectivity | `https://${REGION_ID}.api.camunda.io/${CLUSTER_ID}/mcp/processes`                 |
| SaaS – secure connectivity | `https://${CLUSTER_ID}.${REGION_ID}.privateconnectivity.camunda.io/mcp/processes` |
| Self-Managed (custom)      | `https://<your-host>/mcp/processes`                                               |

For SaaS, find your **Region Id** and **Cluster Id** in [Camunda Hub](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#view-connection-information).

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-setup
