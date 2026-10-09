# Set up the Helm chart with basic authentication — Enable additional components

The following components require Management Identity with an OIDC provider and, therefore, don't support basic authentication:

- Console
- Web Modeler
- Optimize

However, you can still enable these components alongside a Basic authentication Orchestration Cluster by using a hybrid authentication setup:

- **Orchestration Cluster and Connectors** use basic authentication
- **Console, Web Modeler, Optimize, and Management Identity** use OIDC

In this section, you'll learn how to configure hybrid authentication with internal Keycloak. You can also apply this approach with other OIDC setups, such as [external Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak) or an [external OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-oidc-provider)

When deploying process models from Web Modeler to a Basic authentication Orchestration Cluster, you'll be prompted to enter credentials in the deployment dialog.

### Configuration steps

Follow the [internal Keycloak guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak) with these modifications:

1. When you [create a secret](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak#create-a-secret), omit the following keys. They aren't needed for Basic authentication setups:
   - `identity-connectors-client-token`
   - `identity-orchestration-client-token`

2. Set `basic` as the authentication method for the Orchestration Cluster and Connectors:

```yaml
orchestration:
  security:
    authentication:
      method: basic

connectors:
  security:
    authentication:
      method: basic
```

3. Skip the OIDC sections for the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak#configure-orchestration-cluster) and [Connectors](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak#configure-connectors).

### Full configuration example

This example shows a complete configuration of hybrid authentication with internal Keycloak:

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
      method: basic

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
      method: basic
```

### Connect to the cluster

To access the additional components, refer to [Connect to the cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak#connect-to-the-cluster) in the internal Keycloak guide.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/basic-authentication
