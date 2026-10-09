# Set up the Helm chart with an in-cluster Keycloak instance — Configuration — Configure Management Identity and global defaults

Management Identity configures the Keycloak instance during startup. For example, it creates the Camunda realm and other required Keycloak entities. If the Camunda realm doesn’t appear in Keycloak after deployment, the setup process did not complete successfully.

Management Identity stores its data in a dedicated PostgreSQL database. Connect it to the `pg-identity` cluster created by the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) (or a managed database):

```yaml
global:
  identity:
    auth:
      enabled: true
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
```

`identity.firstUser` defines the first user created in Keycloak. By default, this user is named `demo`. You can override this by setting `identity.firstUser.username`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
