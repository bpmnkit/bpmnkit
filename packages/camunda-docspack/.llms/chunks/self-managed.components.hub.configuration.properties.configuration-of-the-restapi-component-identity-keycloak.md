# Property reference — Configuration of the `restapi` component — Identity / Keycloak

Camunda Hub uses Keycloak as the default authentication provider (using OAuth 2.0 + OpenID Connect) and integrates with [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview) for user management and authorization (see [Manage access and permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview)).

**Note**
Configure Camunda Hub authentication with the properties on this page, not with the Orchestration Cluster's `camunda.security.authentication.oidc.*` settings. The one exception is the claim that identifies a user: you can also set `camunda.security.authentication.oidc.username-claim` directly, as an alternative to `CAMUNDA_HUB_OAUTH2_TOKEN_USERIDCLAIM` (`camunda.hub.oauth2.token.user-id-claim`). This is unrelated to `CAMUNDA_IDENTITY_USERNAMECLAIM` (`camunda.identity.username-claim`), which only sets a user's display name.

See [authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity) for more details.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
