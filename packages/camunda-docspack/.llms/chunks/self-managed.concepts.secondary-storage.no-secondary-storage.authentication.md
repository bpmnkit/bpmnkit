# Run without secondary storage — Authentication

Authentication works with no secondary storage mode. OIDC authentication is configured the same way as with secondary storage enabled. For details, see [Orchestration Cluster authentication](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster).

**Note: Basic authentication with no secondary storage**
If you use Basic authentication, you must also enable unprotected API mode because Basic auth requires access to user data in secondary storage.

```yaml
global:
  noSecondaryStorage: true

orchestration:
  security:
    authentication:
      method: basic
      unprotectedApi: true
      authorizations:
        enabled: false
```

This configuration should **only be used for development** or testing environments, as the unprotected API mode disables authentication checks on API endpoints.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage
