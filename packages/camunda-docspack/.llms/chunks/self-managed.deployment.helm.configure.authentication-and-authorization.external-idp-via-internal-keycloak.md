# Set up an external IdP with internal Keycloak

Configure an external identity provider to authenticate users through the internal Keycloak identity broker.

This guide explains how to configure the internal Keycloak instance as an identity broker that delegates authentication to an external identity provider (IdP), such as an OIDC provider, SAML, LDAP, or Active Directory.

This setup allows you to:

- Use your organization's existing identity provider for user authentication
- Retain the internal Keycloak for Camunda OIDC integration
- Manage user authorization in Camunda identity components


## Prerequisites

- A Camunda 8 deployment with internal Keycloak enabled. For setup instructions, see [Configure internal Keycloak for Helm deployments](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak).
- Access to your external IdP's configuration (client credentials, endpoints, etc.)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-idp-via-internal-keycloak
