# Management Identity — About Management Identity

The following table shows which installation methods start Management Identity and Keycloak. For the Docker Compose files, see [choose a Docker Compose configuration](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration#choose-a-docker-compose-configuration).

| Installation method                                                | Starts Management Identity                                          | Starts Keycloak                                                                                                                                                                                               |
| :----------------------------------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Docker Compose, full (`docker-compose-full.yaml`)                  | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, standalone Camunda Hub (`docker-compose-hub.yaml`) | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, lightweight (`docker-compose.yaml`)                | No                                                                  | No                                                                                                                                                                                                            |
| Helm                                                               | Yes, when you set `identity.enabled: true`. The default is `false`. | No. The chart doesn't deploy Keycloak. Deploy it with the [Keycloak operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) and connect the Helm chart to it. |

- Administrators can use Management Identity to manage Camunda 8 users, groups, roles, permissions, and applications.
- Users (interacting via Camunda web components) and applications (interacting via Camunda APIs, such as job workers) are supported, using secure authorization based on OAuth 2.0 standards.
- Users log in to web components via an IdP login page. Applications authenticate via machine-to-machine (M2M) tokens.
- You can integrate Management Identity with an [external OIDC provider](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider), [connect to an existing Keycloak instance](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak), or [configure an external IdP using Keycloak](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/configure-external-identity-provider).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview
