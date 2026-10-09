# Optimize authentication in Self-Managed — Fall back to the 8.9 component-specific configuration

If the 8.10 authentication changes cause a regression in your deployment, you can temporarily revert Optimize to its 8.9 behavior. Use this only if your integrations depend on the static API access token that the 8.9 stack accepted, or if your migration to the `camunda.security.*` keys was misconfigured and you need a working deployment while you fix it:

```yaml
optimize:
  security:
    csl:
      enabled: false
```

Treat this as a temporary escape hatch, not a supported long-term mode. Camunda plans to remove `optimize.security.csl.enabled=false`, the 8.9 behavior it restores, and the component-specific configuration keys in a future release. Falling back doesn't pause the migration, it only delays it, so the same `camunda.security.*` migration is still required.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-optimize
