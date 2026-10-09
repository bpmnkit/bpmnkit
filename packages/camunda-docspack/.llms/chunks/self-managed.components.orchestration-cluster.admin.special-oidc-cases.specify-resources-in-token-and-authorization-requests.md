# Special OIDC configuration cases — Specify resources in token and authorization requests

The Orchestration Cluster supports [RFC 8707 (Resource Indicators for OAuth 2.0)](https://datatracker.ietf.org/doc/html/rfc8707). With this, you can specify target resources when requesting access tokens and performing authorization with your OIDC provider.

This is useful when your OIDC provider issues different tokens depending on the intended resource (audience). By including resource indicators in token and authorization requests, you can ensure the Orchestration Cluster receives tokens with the appropriate audience claims for your environment.

### yaml

Configure resource indicators using the `camunda.security.authentication.oidc.resource` property:

```yaml
camunda:
  security:
    authentication:
      oidc:
        resource:
          - https://api.example.com
          - https://another-resource.example.com
```

### env

Configure resource indicators using the `CAMUNDA_SECURITY_AUTHENTICATION_OIDC_RESOURCE_0` environment variable:

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_RESOURCE_0=https://api.example.com
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_RESOURCE_1=https://another-resource.example.com
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/special-oidc-cases
