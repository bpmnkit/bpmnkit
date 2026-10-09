# Install the Camunda Hub release — Create `hub-values.yaml`

Create a values file that sets the `hub` role, configures Camunda Hub and Management Identity, and declares one record for each Orchestration Cluster the Hub manages. The cluster records can describe Orchestration Clusters in different environments:

```yaml
global:
  host: hub.example.com
  ingress:
    enabled: true
    className: nginx
    tls:
      enabled: true
      secretName: hub-tls
  security:
    authentication:
      method: oidc
  topology:
    mode: hub
    clusters:
      - id: orchestration
        name: Orchestration
        namespace: orchestration
        releaseName: camunda
        host: orchestration.example.com
        # Match this to the Camunda version deployed by your selected chart.
        version: "8.10.x"
        contextPaths:
          orchestration: /orchestration
          optimize: /optimize
          connectors: /connectors
        components:
          orchestration:
            enabled: true
            clientId: orchestration
            audience: orchestration-api
            redirectUrl: https://orchestration.example.com/orchestration
            secret:
              existingSecret: orchestration-oidc
              existingSecretKey: client-secret
          optimize:
            enabled: true
            clientId: optimize
            audience: optimize-api
            redirectUrl: https://orchestration.example.com/optimize
            secret:
              existingSecret: optimize-oidc
              existingSecretKey: client-secret
          connectors:
            enabled: true
            clientId: connectors
            secret:
              existingSecret: connectors-oidc
              existingSecretKey: client-secret
  identity:
    keycloak:
      url:
        protocol: https
        host: login.example.com
        port: 443
      contextPath: /
      realm: /realms/camunda-platform
      auth:
        adminUser: admin
        secret:
          existingSecret: keycloak-admin
          existingSecretKey: password
    auth:
      enabled: true
      type: KEYCLOAK
      publicIssuerUrl: https://login.example.com/realms/camunda-platform
      issuerBackendUrl: https://login.example.com/realms/camunda-platform
      authUrl: https://login.example.com/realms/camunda-platform/protocol/openid-connect/auth
      tokenUrl: https://login.example.com/realms/camunda-platform/protocol/openid-connect/token
      jwksUrl: https://login.example.com/realms/camunda-platform/protocol/openid-connect/certs
      camundaHub:
        redirectUrl: https://hub.example.com/modeler

identity:
  enabled: true
  contextPath: /identity
  firstUser:
    secret:
      existingSecret: identity-first-user
      existingSecretKey: password
  externalDatabase:
    enabled: true
    host: identity-postgresql.example.com
    port: 5432
    username: identity
    database: identity
    secret:
      existingSecret: identity-database
      existingSecretKey: password

camundaHub:
  enabled: true
  contextPath: /modeler
  restapi:
    mail:
      fromAddress: noreply@example.com
    externalDatabase:
      url: jdbc:postgresql://hub-postgresql.example.com:5432/hub
      username: hub
      secret:
        existingSecret: hub-database
        existingSecretKey: password
    pusher:
      client:
        secret:
          existingSecret: hub-pusher
          existingSecretKey: app-key
      secret:
        existingSecret: hub-pusher
        existingSecretKey: app-secret
```

The `optimize` record under `components` describes the Optimize instance for the cluster's default Physical Tenant. To map additional tenants, add a `physicalTenants` list. See [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants).

Adapt the Keycloak endpoints and client configuration for your environment. See [external Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release
