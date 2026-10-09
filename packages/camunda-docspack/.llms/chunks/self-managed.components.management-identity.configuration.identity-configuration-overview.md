# Configuration

Learn more about how Management Identity plays together with Keycloak and other OIDC IdP applications to provide authentication services

Configure Management Identity for your Camunda 8 Self-Managed deployment. This guide covers application-level configuration, including environment variables and IdP settings.

**Info: Deploying with Helm?**
If you deploy Camunda 8 Self-Managed with Helm, use the [Helm chart authentication and authorization guides](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index) to configure OIDC and Management Identity:


## Configure Management Identity IdP

When a deployment includes Management Identity, it uses Keycloak as its identity provider (IdP) by default.

The following table shows which installation methods start Management Identity and Keycloak. For the Docker Compose files, see [choose a Docker Compose configuration](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration#choose-a-docker-compose-configuration).

| Installation method                                                | Starts Management Identity                                          | Starts Keycloak                                                                                                                                                                                               |
| :----------------------------------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Docker Compose, full (`docker-compose-full.yaml`)                  | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, standalone Camunda Hub (`docker-compose-hub.yaml`) | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, lightweight (`docker-compose.yaml`)                | No                                                                  | No                                                                                                                                                                                                            |
| Helm                                                               | Yes, when you set `identity.enabled: true`. The default is `false`. | No. The chart doesn't deploy Keycloak. Deploy it with the [Keycloak operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) and connect the Helm chart to it. |

You can configure your Management Identity IdP using the following options:

| IdP configuration                                                                     | Description                                                                                                      |
| :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| [Connect to an identity provider](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider)                   | Connect to an OpenID Connect (OIDC) authentication provider to replace Keycloak.                                 |
| [Connect to an existing Keycloak instance](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak)      | Connect Management Identity to your existing Keycloak instance.                                                  |
| [Configure an external IdP using Keycloak](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/configure-external-identity-provider) | Configure an external identity provider using Keycloak, such as OpenID Connect, SAML, LDAP, or Active Directory. |

**Note**
Management Identity relies on a PostgreSQL. When running Management Identity with an external OIDC provider, you can [connect to an alternative Database](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/alternative-db) if your internal policies or compliance requirements prevent the use of PostgreSQL.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/identity-configuration-overview
