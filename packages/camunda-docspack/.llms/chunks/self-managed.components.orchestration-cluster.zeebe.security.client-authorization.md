# Client authorization

Learn how the Zeebe Gateway supports Camunda Admin-based auth token validation.

The Zeebe Gateway supports [Orchestration Cluster Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview)-based auth token validation.

In the Camunda 8 Self-Managed Helm chart, authentication is enabled by default via Camunda Admin.


## Camunda Admin authorization

[Orchestration Cluster Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview)-based OAuth token validation can be enabled by setting `security.authentication.mode` to `identity` and providing the corresponding `camunda.identity.*` properties. You can find more details about these in the [Camunda Management Identity documentation](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#core-configuration).

The Camunda 8 Self-Managed Helm chart is already fully preconfigured by default.

### YAML snippet

```yaml
security:
  authentication:
    mode: identity
    identity:
      issuerBackendUrl: http://keycloak:18080/auth/realms/camunda-platform
      audience: zeebe-api
      type: keycloak
```

With authentication enabled, every request to the Gateway requires a valid auth token in the `Authorization` header, granting access to the configured `security.authentication.identity.audience`, issued by the configured `security.authentication.identity.issuerBackendUrl`. The `zeebe-api` audience is already pre-configured in Camunda Admin.

The authentication could be disabled by setting `security.authentication.mode: none` in the Gateway configuration file or via `ZEEBE_GATEWAY_SECURITY_AUTHENTICATION_MODE=none` as environment variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/client-authorization
