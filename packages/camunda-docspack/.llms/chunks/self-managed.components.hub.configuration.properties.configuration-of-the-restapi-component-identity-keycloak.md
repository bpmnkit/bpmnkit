# Property reference — Configuration of the `restapi` component — Identity / Keycloak

Camunda Hub uses Keycloak as the default authentication provider (using OAuth 2.0 + OpenID Connect) and integrates with [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview) for user management and authorization (see [Manage access and permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview)).

**Note**
In 8.10, Camunda Hub authentication is configured under `camunda.security.authentication.oidc.*`, using the same settings as the Orchestration Cluster. The properties listed in the mapping below continue to work and are translated to their 8.10 equivalents at startup, but they are deprecated and are removed in 8.11.

See [authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity) for the current settings, and [upgrade Camunda components from 8.9 to 8.10](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#authentication-configuration) for the mapping between them.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
