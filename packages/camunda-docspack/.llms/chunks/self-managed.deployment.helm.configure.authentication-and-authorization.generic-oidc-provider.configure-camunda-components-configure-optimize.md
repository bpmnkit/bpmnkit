# Connect Camunda to any OIDC provider — Configure Camunda components — Configure Optimize

Add configuration for Optimize:

```yaml
global:
  identity:
    auth:
      optimize:
        clientId: <optimize-client-id>
        audience: <optimize-audience>
        redirectUrl: <optimize-base-url>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: optimize-client-secret

optimize:
  enabled: true
```

#### Optimize parameters

| Parameter     | Value                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `clientId`    | Optimize client ID from your provider                                                                                      |
| `audience`    | The unique value you assigned in [Assign a unique audience to each component](#assign-a-unique-audience-to-each-component) |
| `redirectUrl` | `http://localhost:8083` (local) or `https://your-domain.com/optimize` (Ingress)                                            |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
