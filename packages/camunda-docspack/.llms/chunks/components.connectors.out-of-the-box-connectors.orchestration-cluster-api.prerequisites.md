# Camunda Orchestration Cluster API connector — Prerequisites

To use the **Orchestration Cluster API connector**, you need an active Camunda 8.9 or later cluster. This connector is compatible with both Camunda 8 SaaS and Camunda 8 Self-Managed.

You also need OAuth 2.0 client credentials with permission to call the Orchestration Cluster API. Follow the links below to learn more about API client configuration.

- [API client configuration in Camunda 8 SaaS](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients)
- [Token-based authentication in Camunda 8 Self-Managed](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication#using-a-token-oidcjwt)

Basic authentication (username and password) is not supported. Only OAuth 2.0 client credentials are accepted.

**Note**
Use secrets to store credentials so you don't expose sensitive information directly from the process. See [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/orchestration-cluster-api
