# Manage API clients — View connection information

To view client connection information:

1. In Camunda Hub, in the left navigation, click **Environments**, and then click **Clusters**.
2. Select a cluster.
3. Click the **API** tab.
4. Select your client.
5. Under **Connection information**, find the following values:
   - Cluster ID
   - Region ID
   - Cluster URL
   - Tasklist URL
   - Operate URL
   - Optimize URL
   - OAuth URL
   - Camunda REST API


## Scopes

Camunda 8 SaaS supports the following scopes:

- **Orchestration Cluster API**: Access the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) and the [Zeebe gRPC API](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc).
- **Optimize API**: Access the [Optimize REST API](https://docs.camunda.io/docs/next/apis-tools/optimize-api/overview).
- **Administration API (Secrets resource)**: Access [SaaS-managed secrets](https://docs.camunda.io/docs/next/reference/glossary#saas-managed-secret) in a [hybrid setup](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode).

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients
