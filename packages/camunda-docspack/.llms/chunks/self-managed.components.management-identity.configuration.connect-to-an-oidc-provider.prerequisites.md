# Connect Management Identity to an identity provider — Prerequisites

- Information about your OIDC provider's configuration, including the issuer URL.
- Ability to create applications in your OIDC provider.
- Ability to access the following information about the applications you have created in your OIDC provider:
  - Client ID
  - Client secrets
  - Audience
- A [claim name and value](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#oidc-configuration) to use for initial access.
- Your OIDC provider must issue access tokens that contain an `aud` (audience) claim matching the configured audience, as Camunda validates this claim for auth flows. Providers that are not configured to emit, or do not emit, the `aud` claim in their access tokens are not supported. Configure your identity provider to emit this claim if supported. See [known limitations](#oidc-provider-known-limitations) for details.
- A relational database that Identity can connect to. The database is required regardless of feature flags. See [database configuration](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#database-configuration) for connection details and supported databases.

**Note**
The steps below are a general approach for the Camunda components; it is important you reference the [component-specific
configuration](#component-specific-configuration) to ensure the components are configured correctly.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
