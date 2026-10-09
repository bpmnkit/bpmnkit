# Upgrade Camunda components from 8.9 to 8.10 — Authentication configuration

No action is required to upgrade to 8.10. Camunda Hub continues to authenticate with its own properties, documented under [Identity / Keycloak](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#identity--keycloak), not with the Orchestration Cluster's `camunda.security.authentication.oidc.*` settings. For the one exception, the username claim, see [Identity / Keycloak](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#identity--keycloak).

Note the following:

- Cross-origin resource sharing (CORS) settings are unchanged. Hub continues to use its own CORS configuration.
- User, group, role, tenant, and permission management is unchanged in 8.10, and is still handled by [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview).

For the full Hub authentication configuration, see [Camunda Hub authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
