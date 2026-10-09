# Helm charts secret management — Extract plaintext values and reference them as Kubernetes Secrets — Reference it in your values file

Replace plaintext values with secret references.

```yaml
someApp:
  auth:
    secret:
      existingSecret: "app-credentials"
      existingSecretKey: "some-app-client-secret"

database:
  auth:
    existingSecret: "app-credentials"
    secretKeys:
      adminPasswordKey: "db-admin-password"
```

_Note: Remove any old plaintext values so the chart doesn’t override the secret._

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
