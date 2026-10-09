# Management and modeling component authentication in Self-Managed — Connect to an external IdP via Keycloak

You can configure Keycloak to act as an identity broker, connecting to an external corporate Identity Provider. This allows you to leverage your existing user base from providers that support protocols like **SAML**, **LDAP**, or **OpenID Connect**.

In this setup, Keycloak remains the direct IdP for Camunda management and modeling components, but it delegates the authentication process to your configured external provider.

- **User authentication:** Users are redirected from Keycloak's login page to your external IdP.
- **User management:** Users are managed in your external IdP and federated into Keycloak.
- **Application authentication:** Applications use M2M tokens issued by Keycloak.

This method is useful when you need to integrate with an IdP that does not use OIDC, or when you want to use Keycloak's advanced features to manage roles and map claims from your external provider.

**Info**
For more information, see [configure an external IdP using Keycloak](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/configure-external-identity-provider).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components
