# Management and modeling component authentication in Self-Managed — Choose an Identity Provider setup

Authentication relies on the **OpenID Connect (OIDC)** and **OAuth 2.0** protocols. Where your user identities live, and which IdP issues tokens, is a separate choice from how authentication is configured.

Three primary setups are supported:

- Use Keycloak as the default built-in Identity Provider (IdP).
- Configure the built-in Keycloak to connect to an external IdP.
- Connect directly to an external OIDC IdP.


## Use Keycloak as default (built-in) IdP

This is the default authentication setup for Self-Managed installation methods, including [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), [Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/index) and [Manual installation](https://docs.camunda.io/docs/next/self-managed/deployment/manual/install). It comes with a pre-packaged Keycloak instance that acts as the Identity Provider.

In this setup:

- **User authentication:** Users log in through the Keycloak's login page.
- **Application authentication:** Applications authenticate using Machine-to-Machine (M2M) tokens.
- **User management:** Administrators manage users, groups, roles, and permissions within Keycloak.

This method is convenient for getting started quickly and is suitable for environments that do not need to integrate with an existing corporate identity management system.

**Info**
For more information, see [connect to an existing Keycloak instance](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components
