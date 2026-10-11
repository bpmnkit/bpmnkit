# JWT token claims reference — Required claims

When configuring OIDC authentication, Camunda requires you to identify the following claims in the token.

### User identification claim

Used to uniquely identify users during interactive login.

- **Helm configuration:** `usernameClaim`
- **Common claim names:** `email`, `preferred_username`, `sub`, `upn`, `unique_name`

### Client identification claim

Used for machine-to-machine authentication to identify the calling client.

- **Helm configuration:** `clientIdClaim`
- **Common claim names:** `client_id`, `azp`, `appid`, `clientId`

### Audience claim

Specifies the intended audience of the token.

- **Helm configuration:** `audience`
- **Claim name:** `aud`
- **Typical value:** Client ID or a custom value configured in the provider. Use a distinct resource audience for each component by default.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims
