# Set up the Helm chart with an in-cluster Keycloak instance — Configuration — Deploy Keycloak and connect Camunda

Deploy an in-cluster Keycloak with the [Keycloak operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) and a PostgreSQL database with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment). The operator-based guide creates the Keycloak service (`keycloak-service`), the operator-generated `keycloak-initial-admin` secret, and the `pg-keycloak` database cluster.

Then connect the Camunda Helm chart to that Keycloak instance through `global.identity.keycloak`:

```yaml
global:
  identity:
    auth:
      type: KEYCLOAK
      publicIssuerUrl: http://keycloak-service:18080/auth/realms/camunda-platform
      issuerBackendUrl: http://keycloak-service:18080/auth/realms/camunda-platform
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
```

The `host`, `port`, admin user, and secret name above match the defaults created by the [operator-based Keycloak deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment). Adjust them if you customized that deployment.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
