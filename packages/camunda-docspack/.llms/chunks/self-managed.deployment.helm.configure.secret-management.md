# Helm charts secret management

Provides an overview for configuring and managing secrets when using the official Helm chart.

This guide provides an overview for configuring and managing secrets when using the official Helm chart.


## Secret configuration patterns

The Helm chart supports different patterns for secret management.

### Structured secret pattern

The structured `secret:` configuration under components provides three options:

- `inlineSecret`: Plain-text value for non-production usage
- `existingSecret`: Reference to an existing Kubernetes Secret name
- `existingSecretKey`: Key within the existing secret object

Example:

```yaml
component:
  auth:
    secret:
      inlineSecret: "my-plain-text-secret" # Non-production only
      existingSecret: "my-secret-name" # Recommended
      existingSecretKey: "secret-key"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
