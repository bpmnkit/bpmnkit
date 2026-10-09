# Connect Management Identity to an identity provider — Configuration — Component-specific configuration

| Component           | Redirect URI                                                                                                                           | Notes/Limitations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Management Identity | **Microsoft Entra ID:**  `https://<IDENTITY_URL>/auth/login-callback`  **Helm:**  `https://<IDENTITY_URL>`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Optimize            | **Microsoft Entra ID:**  `https://<OPTIMIZE_URL>/api/authentication/callback`  **Helm:**  `https://<OPTIMIZE_URL>` | There is a fallback if you use the existing environment variables to configure your authentication provider. If you use a custom `yaml`, update your properties to match the new values in this guide.When using an OIDC provider, the following Optimize features are not currently available: - The **User permissions** tab in collections- The **Alerts** tab in collections- Digests- Accessible usernames for owners of resources (the `sub` claim value is displayed instead).                                                                          |
| Hub                 | **Microsoft Entra ID:**  `https://<HUB_URL>/login-callback`  **Helm:**  `https://<HUB_URL>`                        | Hub requires two clients: one for the UI, and one for the API.  Required configuration variables for the `restapi` component: `CAMUNDA_HUB_OAUTH2_CLIENTID=[ui-client-id]` `CAMUNDA_IDENTITY_BASEURL=[identity-base-url]` `CAMUNDA_IDENTITY_TYPE=[provider-type]` `CAMUNDA_HUB_SECURITY_JWT_AUDIENCE_INTERNALAPI=[ui-audience]` `CAMUNDA_HUB_SECURITY_JWT_AUDIENCE_PUBLICAPI=[api-audience]` `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUERURI=[provider-issuer]` `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWKSETURI=[provider-jwks-url]`. |

#### Example component values

The examples below use these public URLs:

- Management Identity: `https://identity.example.com`
- Optimize: `https://optimize.example.com`
- Hub: `https://hub.example.com`

With those URLs, configure the following redirect URIs in your OIDC provider:

- Management Identity: `https://identity.example.com/auth/login-callback`
- Optimize: `https://optimize.example.com/api/authentication/callback`
- Hub UI: `https://hub.example.com/login-callback`

For Hub, the `restapi` component configuration varies by provider. The example below uses Keycloak; for other providers, retrieve the issuer and JWK set URLs from your provider's [OpenID configuration endpoint](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig) (typically `https://<provider>/.well-known/openid-configuration`):

```shell
CAMUNDA_HUB_OAUTH2_CLIENTID=web-modeler
CAMUNDA_IDENTITY_BASEURL=http://identity:8080
CAMUNDA_IDENTITY_TYPE=GENERIC
CAMUNDA_HUB_SECURITY_JWT_AUDIENCE_INTERNALAPI=web-modeler-api
CAMUNDA_HUB_SECURITY_JWT_AUDIENCE_PUBLICAPI=web-modeler-public-api
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUERURI=https://idp.example.com/realms/camunda
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWKSETURI=https://idp.example.com/realms/camunda/protocol/openid-connect/certs
```

Use the internal Identity base URL for `CAMUNDA_IDENTITY_BASEURL`, not the public redirect URL.

For Microsoft Entra ID, replace the provider-specific values:

```shell
CAMUNDA_IDENTITY_TYPE=MICROSOFT
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUERURI=https://login.microsoftonline.com/<tenant-id>/v2.0
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWKSETURI=https://login.microsoftonline.com/<tenant-id>/discovery/v2.0/keys
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
