# Connect Camunda to any OIDC provider — Configure Camunda components — Global OIDC configuration

Start with the global configuration that applies to all components:

```yaml
global:
  security:
    authentication:
      method: oidc

  identity:
    auth:
      enabled: true
      type: "GENERIC"

      publicIssuerUrl: <issuer-url>
      issuerBackendUrl: <issuer-url>
      authUrl: <authorization-endpoint-url>
      tokenUrl: <token-endpoint-url>
      jwksUrl: <jwks-endpoint-url>
```

#### Parameter descriptions

| Parameter          | Description                                               | Example                                                                 |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `publicIssuerUrl`  | Issuer URL accessible from users' browsers                | `https://login.example.com`                                             |
| `issuerBackendUrl` | Issuer URL accessible from Kubernetes pods                | `https://login.example.com` or `http://oidc-internal.svc.cluster.local` |
| `authUrl`          | Authorization endpoint (must be accessible from browsers) | `https://login.example.com/oauth/authorize`                             |
| `tokenUrl`         | Token endpoint (must be accessible from pods)             | `https://login.example.com/oauth/token`                                 |
| `jwksUrl`          | JWKS endpoint for token signature verification            | `https://login.example.com/.well-known/jwks.json`                       |

**Warning: Network accessibility**
For generic OIDC providers, the **Issuer URL** must be accessible from both:

1. **Users' browsers**: To redirect users to the login page.
2. **Camunda components (backend)**: To fetch the provider's configuration and validate tokens.

Split-horizon DNS setups (where the provider has different URLs for internal and external access) are **not supported** for generic OIDC providers. Ensure your OIDC provider is exposed via a URL that is resolvable and reachable from both locations.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
