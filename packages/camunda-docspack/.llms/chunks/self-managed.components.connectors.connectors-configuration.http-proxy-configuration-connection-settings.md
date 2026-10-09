# Configuration — HTTP proxy configuration — Connection settings

| Environment variable          | Helm value                             | Required       | Description                                                                                            |
| :---------------------------- | :------------------------------------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| `APP_INTEGRATIONS_BASE_URL`   | `connectors.appIntegrations.baseUrl`   | Yes            | Base URL of your app integrations deployment.                                                          |
| `APP_INTEGRATIONS_CLUSTER_ID` | `connectors.appIntegrations.clusterId` | With OAuth 2.0 | The cluster's UUID as declared in the app integrations `clusters` configuration, not the cluster name. |

App integrations use the cluster ID to tell which cluster a call comes from. When the runtime authenticates with an API key, app integrations identify the cluster from the key instead, so the cluster ID is optional.

The physical tenant is not configured here. The connector reads it from the job it is executing, as described in [how the runtime identifies the Physical Tenant](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime#how-the-runtime-identifies-the-physical-tenant).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
