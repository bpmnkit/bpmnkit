# Authentication — Client credentials and scopes

To interact with Camunda 8 programmatically, [create client credentials](#generate-a-token) in the organization settings.

Client credentials are created for an organization, and therefore can access all Camunda 8 clusters of this organization. Scopes define the access for client credentials. A client can have one or multiple of the following permissions:

![createConsoleApiClient](../../components/saas/organization/img/create-console-api-client.png)

A client can have one or multiple permissions from the following groups:

- **Cluster**: [Manage your clusters](https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster).
- **Zeebe Client**: [Manage API clients](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients) for your cluster.
- **Hub API**: Interact with the [Camunda Hub API](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/overview).
- **IP allowlist**: Configure [IP allowlist](https://docs.camunda.io/docs/next/components/saas/clusters/manage-ip-allowlists) rules.
- **Connector Secrets**: [Manage secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) of your clusters.
- **Members**: [Manage users](https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles) in your organization.
- **Backups**: Manage [backups](https://docs.camunda.io/docs/next/components/saas/backups) of your Camunda 8 clusters (only available to Enterprise customers).

The full API description can be found [here](https://console.cloud.camunda.io/customer-api/openapi/docs/#/).

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/authentication
