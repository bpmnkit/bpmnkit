# Authentication — Use a different OIDC provider than Keycloak

By default, Camunda Hub uses the built-in Keycloak instance as its identity provider. To use a different OIDC provider, follow the steps in the [OIDC connection guide](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider).

**Tip**
If you connect the [Orchestration Cluster to an external identity provider](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider), use the same provider for Camunda Hub. Both components read the same `camunda.security.authentication.oidc.*` settings, which gives you one authentication configuration to maintain and one place to manage users.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity
