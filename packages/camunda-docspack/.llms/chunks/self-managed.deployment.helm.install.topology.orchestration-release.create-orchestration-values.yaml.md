# Install an Orchestration Cluster release — Create `orchestration-values.yaml`

```yaml
global:
  host: orchestration.example.com
  ingress:
    enabled: true
    className: nginx
    tls:
      enabled: true
      secretName: orchestration-tls
  security:
    authentication:
      method: oidc
  topology:
    mode: orchestration
  identity:
    service:
      url: http://camunda-identity.hub.svc.cluster.local:80/identity
    auth:
      enabled: true
      type: KEYCLOAK
      # Must be the exact "iss" claim your provider mints. See Pin the issuer.
      issuer: https://login.example.com/realms/camunda-platform
      publicIssuerUrl: https://login.example.com/realms/camunda-platform
      issuerBackendUrl: https://login.example.com/realms/camunda-platform
      authUrl: https://login.example.com/realms/camunda-platform/protocol/openid-connect/auth
      tokenUrl: https://login.example.com/realms/camunda-platform/protocol/openid-connect/token
      jwksUrl: https://login.example.com/realms/camunda-platform/protocol/openid-connect/certs

identity:
  enabled: false

orchestration:
  enabled: true
  contextPath: /orchestration
  security:
    authentication:
      oidc:
        clientId: orchestration
        audience: orchestration-api
        redirectUrl: https://orchestration.example.com/orchestration
        secret:
          existingSecret: orchestration-oidc
          existingSecretKey: client-secret
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        url: https://elasticsearch.example.com:9200
        auth:
          username: camunda
          secret:
            existingSecret: secondary-storage
            existingSecretKey: password
  ingress:
    grpc:
      enabled: true
      className: nginx
      host: zeebe.orchestration.example.com
      tls:
        enabled: true
        secretName: orchestration-grpc-tls

connectors:
  enabled: true
  contextPath: /connectors
  security:
    authentication:
      oidc:
        clientId: connectors
        secret:
          existingSecret: connectors-oidc
          existingSecretKey: client-secret
```

`orchestration.security.authentication.oidc.redirectUrl` is deprecated and logs a deprecation warning, but it's used here because one value sets three properties: the OIDC callback (`<redirectUrl>/sso-callback`) and the Operate and Tasklist redirect roots. To remove the warning, set `camunda.security.authentication.oidc.redirect-uri`, `camunda.operate.identity.redirectRootUrl`, and `camunda.tasklist.identity.redirectRootUrl` in `orchestration.extraConfiguration` instead. The key is removed in chart v16 (Camunda 8.11).

This example uses Elasticsearch as secondary storage, and the `secondary-storage` Secret must exist in the orchestration namespace. For OpenSearch, relational database, and TLS configuration, see [database configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/index).

Optimize isn't part of this release. It's deployed separately, one release per Physical Tenant. See [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
