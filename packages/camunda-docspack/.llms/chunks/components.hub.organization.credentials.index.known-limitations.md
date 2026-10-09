# Manage credentials — Known limitations

In this release:

- You cannot create a secret from a credential. Create secrets in [Connector secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) first.
- The plain-text warning checks the whole field value, so a value that combines literal text with a reference, such as `Bearer camunda.secrets.TOKEN`, is flagged even though the reference resolves.
- Hub does not show which processes use a given credential, so check the impact yourself before you edit or delete one.
- Credentials are visible to everyone in your organization who has access to Camunda Hub. You cannot restrict a credential to a project or a subset of users.
- A credential's ID cannot be changed after creation.
- Credentials are edited in place, with no history of previous values.
- Secret suggestions are cluster-scoped, so a credential field offers every secret name on the cluster that hosts the environment you selected, including names that other environments on that cluster use.
- Filtering the **Managed in Hub** tab by environment matches every environment on that environment's cluster.
- Camunda Hub checks credential permissions per organization, not per environment, so its own check doesn't follow the isolation between environments on a cluster. The cluster's own authorizations still apply when Hub writes to it.
- The **Environments only** scan reads a cluster's shared variables, which on Self-Managed belong to the `default` Physical Tenant. A credential created directly in another Physical Tenant isn't found.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
