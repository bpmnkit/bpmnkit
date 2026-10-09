# Overview — External API

These values control how Optimize validates tokens on its External REST API.

In Camunda 8.10, the External REST API accepts only OIDC bearer tokens. Configure `camunda.security.authentication.oidc.issuer-uri` and `camunda.security.authentication.oidc.audiences`. Optimize gets the JWK set URI from the OIDC discovery document of the issuer. To use a different URI, set `camunda.security.authentication.oidc.jwk-set-uri`. The External REST API needs this configuration. Without it, Optimize rejects all API requests. For the upgrade steps, see [Optimize static API access token is no longer supported](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#optimize-static-api-access-token-is-no-longer-supported).

| YAML path       | Environment variable                                  | Default value | Description                                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| api.accessToken | OPTIMIZE_API_ACCESS_TOKEN                             | null          | Not functional in 8.10 unless you opt into the 8.9 component-specific configuration fallback, which Camunda plans to remove in a future release. Through 8.9, a static shared token that a client sends to the secured REST API in the authorization header. |
| api.jwtSetUri   | SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI | null          | Deprecated in 8.10. Use `camunda.security.authentication.oidc.jwk-set-uri`. Complete URI of the public keys for JWT validation.                                                                                                                              |
| api.audience    | CAMUNDA_OPTIMIZE_API_AUDIENCE                         | optimize      | Deprecated in 8.10. Use `camunda.security.authentication.oidc.audiences`. Optimize matches this value with the `aud` field in the JWT.                                                                                                                       |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
