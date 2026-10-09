# Install Camunda for production with Helm — Installation and configuration — Identity provider integration

Once secure HTTPS connections are enabled and correctly configured via Ingress, the next step is configuring authentication with an OIDC-compatible identity provider.

Camunda supports several authentication methods. Choose the guide that matches your identity provider:

- **[Microsoft Entra ID](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra)**: For organizations using Microsoft Entra ID (formerly Azure Active Directory).
- **[External Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak)**: For organizations with an existing Keycloak instance.
- **[Generic OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider)**: For other OIDC-compatible providers such as Okta, Auth0, or Amazon Cognito.

For a complete overview of authentication options and their trade-offs, see [Authentication and authorization](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index).

**Note**
You must create Kubernetes secrets for all client secrets required by your identity provider configuration before installing the Helm chart.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
