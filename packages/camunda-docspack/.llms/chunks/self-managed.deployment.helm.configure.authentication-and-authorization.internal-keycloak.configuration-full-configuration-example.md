# Set up the Helm chart with an in-cluster Keycloak instance — Configuration — Full configuration example

The following example shows a complete configuration for deploying Camunda with an in-cluster, operator-managed Keycloak and operator-managed PostgreSQL databases:

```yaml
global:
  identity:
    auth:
      enabled: true
      type: KEYCLOAK
      publicIssuerUrl: http://keycloak-service:18080/auth/realms/camunda-platform
      issuerBackendUrl: http://keycloak-service:18080/auth/realms/camunda-platform
      optimize:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-optimize-client-token"
      webModeler:
        # Default: http://localhost:8070
        # Update this when using a domain/Ingress, e.g., https://your-domain.com/modeler
        redirectUrl: "http://localhost:8070"
    keycloak:
      url:
        protocol: http
        host: keycloak-service
        port: "18080"
      contextPath: /auth
      realm: /realms/camunda-platform
      auth:
        adminUser: temp-admin
        secret:
          existingSecret: keycloak-initial-admin
          existingSecretKey: password
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

In this setup, Keycloak and PostgreSQL are deployed and managed by their operators, while the Camunda Helm chart handles the application-side Keycloak configuration automatically, including creating OIDC or OAuth clients and linking components. Your values file primarily connects to the operator-managed services, enables components, and defines client secrets.

To review how each component is configured and which OIDC clients are used:

- Run `kubectl get pods` and `kubectl get configmap`, then use `kubectl describe` to inspect component configurations.
- Log into Keycloak (using your administrative user) to review the OIDC client setup

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
