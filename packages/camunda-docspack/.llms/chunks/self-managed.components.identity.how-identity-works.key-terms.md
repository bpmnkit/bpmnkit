# How identity works in Camunda — Key terms

| Term          | Meaning                                                                                                                                      |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Client ID     | The identifier your IdP assigns to an OIDC application registration. Camunda needs one per subsystem.                                        |
| Client secret | The credential your IdP issues alongside the client ID. Treat it as a password.                                                              |
| Issuer URL    | The base URL of your IdP's OIDC authorization server. Camunda uses this to discover token and JWKS endpoints.                                |
| Redirect URI  | The URL Camunda registers with your IdP so the IdP knows where to send users after authentication.                                           |
| Scopes        | The OIDC permission sets Camunda requests from your IdP (typically `openid profile email`).                                                  |
| Claims        | The fields in the ID token your IdP returns. Camunda reads specific claims (such as `sub`, `email`, `preferred_username`) to identify users. |
| JWKS endpoint | The URL your IdP exposes to publish its public signing keys. Camunda uses this to validate token signatures.                                 |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/identity/how-identity-works
