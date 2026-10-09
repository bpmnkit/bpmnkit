# Management and modeling component authentication in Self-Managed — Choose an Identity Provider setup

Authentication relies on the **OpenID Connect (OIDC)** and **OAuth 2.0** protocols. Where your user identities live, and which IdP issues tokens, is a separate choice from how authentication is configured.

Three primary setups are supported:

- Use Keycloak as the default Identity Provider (IdP).
- Configure Keycloak to connect to an external IdP.
- Connect directly to an external OIDC IdP.


## Use Keycloak as the default IdP

Management Identity uses Keycloak as its Identity Provider (IdP) by default. With Helm, Keycloak is an option. The Helm default is Basic authentication. See [Helm chart authentication and authorization](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index).

The following table shows which installation methods start Management Identity and Keycloak. For the Docker Compose files, see [choose a Docker Compose configuration](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration#choose-a-docker-compose-configuration).

| Installation method                                                | Starts Management Identity                                          | Starts Keycloak                                                                                                                                                                                               |
| :----------------------------------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Docker Compose, full (`docker-compose-full.yaml`)                  | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, standalone Camunda Hub (`docker-compose-hub.yaml`) | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, lightweight (`docker-compose.yaml`)                | No                                                                  | No                                                                                                                                                                                                            |
| Helm                                                               | Yes, when you set `identity.enabled: true`. The default is `false`. | No. The chart doesn't deploy Keycloak. Deploy it with the [Keycloak operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) and connect the Helm chart to it. |

In this setup:

- **User authentication:** Users log in through the Keycloak's login page.
- **Application authentication:** Applications authenticate using Machine-to-Machine (M2M) tokens.
- **User management:** Administrators manage users, groups, roles, and permissions within Keycloak.

This method is convenient for getting started quickly and is suitable for environments that do not need to integrate with an existing corporate identity management system.

**Info**
For more information, see [connect to an existing Keycloak instance](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components
