# Camunda Orchestration Cluster API connector — Configure authentication

For both SaaS and Self-Managed clusters, you need to provide **Client ID** and **Client secret**.
You will see these values when you [create an API client](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) for your cluster.

For Self-Managed clusters, you can additionally specify:

- **Audience**: The OAuth audience expected by your identity provider. Leave empty unless your identity provider requires a specific value.
- **Scopes**: Space-separated OAuth 2.0 scopes. Required by some identity providers, for example Microsoft Entra ID, which requires `api://<client-id>/.default`.


## Choose endpoint and operation

In the **Entity** dropdown list, select the Orchestration Cluster API v2 entity you want to query. The following entities are available:

- Process instances
- Process definitions
- Element instances
- Incidents
- Variables
- User tasks
- Jobs
- Decision instances
- Decision definitions
- Decision requirements
- Batch operations
- Batch operation items
- Message subscriptions
- Correlated message subscriptions
- Audit logs
- Authorizations
- Groups
- Roles
- Tenants
- Mapping rules

In the **Operation** dropdown list, select one of the supported operations: **Search** or **Get by key**.

**Note: Search-only entities**
**Batch operation items**, **Message subscriptions**, and **Correlated message subscriptions** only support the **Search** operation; **Get by key** is not available for these entities.

Refer to the [Orchestration Cluster API REST documentation](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) for the full list of endpoints, filter fields, and response shapes per entity.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/orchestration-cluster-api
