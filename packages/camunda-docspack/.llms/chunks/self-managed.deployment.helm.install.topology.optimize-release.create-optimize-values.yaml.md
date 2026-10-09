# Install an Optimize release — Create `optimize-values.yaml`

This example is the Optimize release for the Physical Tenant `tenanta` in the cluster `production-a`. Use the OpenSearch equivalents where applicable.

```yaml
global:
  topology:
    mode: optimize
  noSecondaryStorage: false
  identity:
    service:
      url: http://camunda-identity.hub.svc.cluster.local:80/identity
    auth:
      # The exact "iss" claim your provider mints. Optimize validates it on every token.
      issuer: https://login.example.com/realms/camunda-platform
      jwksUrl: https://login.example.com/realms/camunda-platform/protocol/openid-connect/certs

optimize:
  enabled: true
  contextPath: /optimize-tenanta
  security:
    authentication:
      method: oidc
      oidc:
        clientId: optimize-production-a-tenanta
        audience: optimize-production-a-tenanta-api
        redirectUrl: https://production-a.example.com/optimize-tenanta
        secret:
          existingSecret: optimize-production-a-tenanta-oidc
          existingSecretKey: client-secret
  database:
    elasticsearch:
      enabled: true
      external: true
      url:
        protocol: https
        host: elasticsearch.example.com
        port: 9200
      auth:
        username: camunda
        secret:
          existingSecret: secondary-storage
          existingSecretKey: password
      # Must exactly equal this tenant's exporter writer prefix.
      prefix: production-a-tenanta-records
  env:
    # Optimize's own indices. Must differ from every writer prefix.
    - name: CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX
      value: production-a-tenanta-optimize
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release
