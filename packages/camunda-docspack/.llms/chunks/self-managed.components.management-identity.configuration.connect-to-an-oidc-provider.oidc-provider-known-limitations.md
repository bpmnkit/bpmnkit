# Connect Management Identity to an identity provider — OIDC provider known limitations

Camunda requires the `aud` (audience) claim in JWT access tokens for authentication, including machine-to-machine (M2M) flows. The claim must match the configured audience (see [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3)).

OIDC providers that do not include the `aud` claim in access tokens issued via the OAuth 2.0 Client Credentials flow are not compatible with Camunda for M2M authentication.

### AWS Cognito

AWS Cognito does not include the `aud` claim in Client Credentials access tokens, using `client_id` instead. Camunda rejects these tokens with errors such as `Token audiences are [], expected at least one of [...]`, resulting in `UNAUTHENTICATED` errors for Connectors and other M2M clients. Cognito is not currently supported for M2M authentication.

For tracking and updates, see [camunda/camunda#44650](https://github.com/camunda/camunda/issues/44650).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
