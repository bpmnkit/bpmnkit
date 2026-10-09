# Connect Camunda to any OIDC provider — Complete configuration example

Below is a complete Helm values file with all components configured:

```yaml
global:
  security:
    authentication:
      method: oidc

  identity:
    auth:
      enabled: true
      type: "GENERIC"

      # OIDC Provider Endpoints
      publicIssuerUrl: <issuer-url>
      issuerBackendUrl: <issuer-url>
      authUrl: <authorization-endpoint-url>
      tokenUrl: <token-endpoint-url>
      jwksUrl: <jwks-endpoint-url>

      # Management Identity
      identity:
        clientId: <identity-client-id>
        audience: <identity-audience>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: identity-client-secret
        initialClaimName: <user-claim-name>
        initialClaimValue: <admin-user-claim-value>

      # Optimize
      optimize:
        clientId: <optimize-client-id>
        audience: <optimize-audience>
        redirectUrl: <optimize-url>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: optimize-client-secret

      # Web Modeler
      webModeler:
        clientId: <web-modeler-ui-client-id>
        redirectUrl: <web-modeler-url>
        clientApiAudience: <web-modeler-ui-audience>
        publicApiAudience: <web-modeler-api-audience>

      # Console
      console:
        clientId: <console-client-id>
        audience: <console-audience>
        redirectUrl: <console-url>

# Orchestration Cluster
orchestration:
  enabled: true
  security:
    authentication:
      method: oidc
      oidc:
        clientId: <orchestration-client-id>
        audience: <orchestration-audience>
        redirectUrl: <orchestration-url>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: orchestration-client-secret
        # The following claim mappings use Camunda defaults and usually don't need to be changed.
        # Only uncomment if your decoded access token uses different claim names:
        # usernameClaim: email  # Use if tokens identify users with 'email' instead of 'preferred_username'
        # clientIdClaim: azp  # Use if tokens identify clients with 'azp' instead of 'client_id'
    authorizations:
      enabled: true
    initialization:
      defaultRoles:
        admin:
          users:
            - <admin-user-claim-value>
        connectors:
          clients:
            - <orchestration-client-id>

# Connectors
connectors:
  enabled: true
  security:
    authentication:
      method: oidc
      oidc:
        clientId: <orchestration-client-id>
        audience: <orchestration-audience>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: orchestration-client-secret

# Management Identity
identity:
  fullURL: <identity-base-url>
  enabled: true
  externalDatabase:
    enabled: true
    host: pg-identity-rw
    port: 5432
    database: identity
    username: identity
    secret:
      existingSecret: pg-identity-secret
      existingSecretKey: password
# Optimize
optimize:
  enabled: true

# Camunda Hub (Console and Web Modeler)
camundaHub:
  enabled: true # Deploys both Console and Web Modeler
  restapi:
    mail:
      fromAddress: <your-email-address>
    externalDatabase:
      host: pg-hub-rw
      port: 5432
      database: hub
      username: hub
      secret:
        existingSecret: pg-hub-secret
        existingSecretKey: password
```

**Placeholders to replace:**

| Placeholder                                               | Replace with                                       |
| --------------------------------------------------------- | -------------------------------------------------- |
| `https://your-provider.example.com`                       | Your OIDC provider's issuer URL                    |
| `identity`, `orchestration`, `optimize`, etc.             | Your actual client IDs                             |
| `identity`, `orchestration`, `optimize` (audience values) | The unique audience you assigned to each component |
| `admin@example.com`                                       | Your admin user's claim value                      |

### Verify before deploying

- All `<placeholders>` replaced with actual values.
- All client secrets stored in the `oidc-credentials` secret.
- Database credentials provided by the operator-managed database secrets (for example, `pg-identity-secret` and `pg-hub-secret`).
- Redirect URIs in OIDC provider match `redirectUrl` values.
- Each component has a distinct resource audience by default. Any cross-component audience acceptance supports a documented integration.
- Verify tokens contain `preferred_username` and `client_id` claims, or uncomment and configure alternative claim names.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
