# Management and modeling component authentication in Self-Managed — Connect to an external OIDC IdP

You can connect the management and modeling components to an external Identity Provider (IdP) that supports **OpenID Connect (OIDC)** (e.g., Microsoft Entra ID, Keycloak, Auth0, Okta).

In this setup:

- Users are managed in your external IdP.
- User groups from your IdP can be used to manage permissions.
- Clients for M2M authentication are managed in your external IdP.

**Tip: Recommendation**
If you have configured the [authentication to Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster#oidc) with an external OIDC provider, we recommend using the same provider for the management and modeling components. Both read the same `camunda.security.authentication.oidc.*` settings, so you maintain one authentication configuration and manage users in one place.

**Info**
For more information, see [connect Management Identity to an external IdP](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components
