# Connect Camunda to any OIDC provider — Configure Camunda components — Configure Management Identity

Add configuration for Management Identity:

```yaml
global:
  identity:
    auth:
      identity:
        clientId: <identity-client-id>
        audience: <identity-audience>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: identity-client-secret
        initialClaimName: <user-claim-name>
        initialClaimValue: <admin-user-claim-value>

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
```

Management Identity requires an externally managed PostgreSQL database. Provision the database before you deploy, and adapt the connection values and secret references to your setup. For the full parameter list, see [Use external PostgreSQL](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres).

#### Identity-specific parameters

| Parameter           | Description                                  | How to Determine                                                                                                           |
| ------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `clientId`          | Client ID from your OIDC provider            | From your Identity client configuration                                                                                    |
| `audience`          | Expected audience in access tokens           | The unique value you assigned in [Assign a unique audience to each component](#assign-a-unique-audience-to-each-component) |
| `initialClaimName`  | Claim that identifies the initial admin user | `email`, `sub`, or another user claim from token inspection                                                                |
| `initialClaimValue` | Value granting initial admin access          | Your admin user's value for the specified claim (e.g., `admin@example.com`)                                                |

**Warning: Initial claim cannot be changed**
The `initialClaimName` and `initialClaimValue` parameters are used only during the first startup to grant initial admin access. Once Management Identity has started, these values are stored in the database and cannot be changed via Helm values.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
