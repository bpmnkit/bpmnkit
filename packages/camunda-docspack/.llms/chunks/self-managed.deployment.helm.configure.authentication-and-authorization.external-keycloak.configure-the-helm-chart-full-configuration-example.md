# Set up the Helm chart with an external Keycloak instance — Configure the Helm chart — Full configuration example

The following example shows a complete configuration for connecting to an external Keycloak instance:

```yaml
global:
  identity:
    auth:
      enabled: true
      publicIssuerUrl: <KEYCLOAK_URL>/realms/<realm>
      issuerBackendUrl: <KEYCLOAK_URL>/realms/<realm>
      authUrl: <KEYCLOAK_URL>/realms/<realm>/protocol/openid-connect/auth
      tokenUrl: <KEYCLOAK_URL>/realms/<realm>/protocol/openid-connect/token
      jwksUrl: <KEYCLOAK_URL>/realms/<realm>/protocol/openid-connect/certs
      identity:
        clientId: <identity_client_id>
      optimize:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-optimize-client-token"
    keycloak:
      url: # this URL must be reachable from within the cluster
        protocol: <keycloak_protocol>
        host: <keycloak_hostname>
        port: <keycloak_port>
      contextPath: <keycloak_context_path> # set to "/" for the root context path
      realm: /realms/<realm>
      auth:
        adminUser: <keycloak_admin>
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-keycloak-admin-password"
  security:
    authentication:
      method: oidc

identity:
  enabled: true
  firstUser:
    secret:
      existingSecret: "camunda-credentials"
      existingSecretKey: "identity-firstuser-password"
  externalDatabase:
    enabled: true
    host: pg-identity-rw
    port: 5432
    database: identity
    username: identity
    secret:
      existingSecret: pg-identity-secret
      existingSecretKey: password
  env:
    - name: KEYCLOAK_REALM
      value: <realm>
    - name: IDENTITY_CLIENT_ID
      value: <identity_client_id>

optimize:
  enabled: true

connectors:
  security:
    authentication:
      oidc:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-connectors-client-token"

camundaHub:
  enabled: true # Deploys both Console and Web Modeler
  restapi:
    mail:
      fromAddress: noreply@example.com
    # Connect Camunda Hub to the operator-managed PostgreSQL cluster (pg-hub)
    externalDatabase:
      host: pg-hub-rw
      port: 5432
      database: hub
      username: hub
      secret:
        existingSecret: pg-hub-secret
        existingSecretKey: password
orchestration:
  security:
    authentication:
      oidc:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-orchestration-client-token"
```

To review how each component is configured and which OIDC clients are used:

- Run `kubectl get pods` and `kubectl get configmap`, then use `kubectl describe` to inspect component configurations.
- Log into Keycloak (using your administrative user) to review the OIDC client setup

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
