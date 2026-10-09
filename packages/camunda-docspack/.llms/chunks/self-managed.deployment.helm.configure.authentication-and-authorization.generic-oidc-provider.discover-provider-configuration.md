# Connect Camunda to any OIDC provider — Discover provider configuration

Since OIDC providers vary in their implementation details, you need to obtain the specific values from your provider.

### Find OIDC endpoints

Most OIDC providers expose a discovery document at:

```
https://your-provider.example.com/.well-known/openid-configuration
```

Access this URL (replacing `your-provider.example.com` with your provider's domain) to retrieve a JSON document containing endpoint URLs.

#### Example discovery document

```json
{
  "issuer": "https://your-provider.example.com",
  "authorization_endpoint": "https://your-provider.example.com/oauth/authorize",
  "token_endpoint": "https://your-provider.example.com/oauth/token",
  "jwks_uri": "https://your-provider.example.com/.well-known/jwks.json",
  ...
}
```

#### Record these values for Helm configuration

- `issuer` → Used for: `publicIssuerUrl`
- `authorization_endpoint` → Used for: `authUrl`
- `token_endpoint` → Used for: `tokenUrl`
- `jwks_uri` → Used for: `jwksUrl`

### Identify token claims

Camunda needs to know which claims in access tokens identify users and clients. Claim names vary by provider.

You need to identify:

- **User identification claim** (`usernameClaim`): Identifies users during web login (for example, `email`, `preferred_username`).
- **Client identification claim** (`clientIdClaim`): Identifies calling applications for M2M authentication (for example, `client_id`, `azp`).
- **Audience claim** (`audience`): The expected `aud` value in tokens.

For detailed instructions on obtaining and decoding tokens to identify these claims, see [JWT token claims reference](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims).

### Scopes requested by Camunda

Camunda components request OIDC scopes when authenticating users. The default scopes vary by component:

| Scope            | Description                         | Management Identity, Optimize, Web Modeler, Console | Orchestration Cluster applications (Identity, Operate, Tasklist) |
| ---------------- | ----------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| `openid`         | Required for OIDC authentication.   | ✔                                                   | ✔                                                                |
| `profile`        | Access to user profile information. | ✔                                                   | ✔                                                                |
| `email`          | Access to user email address.       | ✔                                                   |                                                                  |
| `offline_access` | Enables refresh token issuance.     | ✔                                                   |                                                                  |

**Info**
If your provider supports the `offline_access` scope, components will receive refresh tokens. This allows sessions to remain active longer without requiring users to re-authenticate.

If `offline_access` is not available or not granted, users will be redirected to your OIDC provider for re-authentication when their access token expires.

For more information, see [OpenID Connect Core specification](https://openid.net/specs/openid-connect-core-1_0.html#OfflineAccess).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
