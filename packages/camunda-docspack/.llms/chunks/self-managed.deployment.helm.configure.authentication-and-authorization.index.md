# Helm chart authentication and authorization configuration

Learn how to configure authentication and authorization for Camunda 8 Self-Managed deployments using Helm chart.

Camunda 8 Self-Managed supports multiple authentication methods for securing access to components deployed with the Helm chart. This section provides an overview of available authentication options and links to configuration guides for each method.


## Overview

By default, Camunda uses Basic authentication with predefined demo users. Alternatively, you can configure OpenID Connect (OIDC) authentication, either through an internal Keycloak instance deployed with Camunda or an external OIDC provider.

### Authentication options

| Method                                                                        | Description                                                                                                         | Recommended for                                                                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Basic authentication](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/basic-authentication)                             | Authentication using preconfigured demo users. No external identity provider (IdP) required.                        | Local development and testing, as well as smaller-scale production setups.                 |
| [Internal Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak)                                   | Deploys an internal Keycloak instance with the Helm release, preconfigured by Management Identity.                  | Small teams or self-contained environments.                                                |
| [External IdP via Internal Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-idp-via-internal-keycloak) | Uses the internal Keycloak as an identity broker, delegating authentication to an external identity provider (IdP). | Organizations with existing identity infrastructure that want to retain Keycloak features. |
| [External OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-oidc-provider)                         | Integrates Camunda with an external identity provider, such as Microsoft Entra ID or Okta, via OpenID Connect.      | Organizations with an existing enterprise identity infrastructure.                         |

When you use an external OIDC provider, assign each Camunda component its own resource audience by default. Only configure cross-component audience acceptance for supported integrations. See [Assign a unique audience to each component](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#assign-a-unique-audience-to-each-component).

**Note**
When running Camunda in **no secondary storage** mode, authentication requires special configuration. See [Authentication with no secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage#authentication) for details.

### Limitations of OIDC setups

Due to technical limitations regarding [third party content](https://openid.net/specs/openid-connect-frontchannel-1_0.html#ThirdPartyContent),
front channel single sign out is not supported. This means that when a user logs out of one component, they will not be logged out of the OIDC provider or the other components.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index
