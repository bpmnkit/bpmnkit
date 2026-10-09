# Set up the Helm chart with an external Microsoft Entra tenant — Configuration — Full configuration example

The following example shows a full configuration to enable Microsoft Entra with an externally managed Elasticsearch cluster. Replace `<elasticsearch-host>` with the hostname of your cluster.

```yaml
global:
  identity:
    auth:
      enabled: true
      issuer: https://login.microsoftonline.com/<tenant id>/v2.0
      issuerBackendUrl: https://login.microsoftonline.com/<tenant id>/v2.0
      authUrl: https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/authorize
      tokenUrl: https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/token
      jwksUrl: https://login.microsoftonline.com/<tenant id>/discovery/v2.0/keys
      type: "MICROSOFT"
      identity:
        clientId: "<mgmt-identity-app-id>"
        audience: "<mgmt-identity-app-id>"
        initialClaimName: preferred_username
        initialClaimValue: "<the email address of your initial admin user>"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "identity-client-secret"
      optimize:
        clientId: "<optimize-app-id>"
        audience: "<optimize-app-id>"
        redirectUrl: "<OPTIMIZE_URL>"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "optimize-client-secret"
      webModeler:
        clientId: "<web-modeler-ui-app-id>"
        clientApiAudience: "<web-modeler-ui-app-id>"
        publicApiAudience: "<web-modeler-api-app-id>"
        redirectUrl: "<WEB_MODELER_URL>"
      console:
        clientId: "<console-app-id>"
        audience: "<console-app-id>"
        redirectUrl: "http://localhost:8087"
  security:
    authentication:
      method: oidc

orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        url: "https://<elasticsearch-host>:9200"
  security:
    authentication:
      oidc:
        clientId: "<oc-app-id>"
        audience: "<oc-app-id>"
        usernameClaim: preferred_username
        clientIdClaim: azp
        preferUsernameClaim: true
        redirectUrl: "<OC_URL>"
        scope:
          - openid
          - profile
          - offline_access
          - "<oc-app-id>/.default"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "orchestration-cluster-client-secret"
    initialization:
      defaultRoles:
        admin:
          users:
            - "<the email address of your initial admin user>"
        connectors:
          clients:
            - "<oc-app-id>"
  env:
    - name: CAMUNDA_SECURITY_AUTHENTICATION_OIDC_USER_INFO_ENABLED
      value: "false"
    - name: SERVER_MAX_HTTP_REQUEST_HEADER_SIZE
      value: "65536"

connectors:
  security:
    authentication:
      oidc:
        clientId: "<oc-app-id>"
        audience: "<oc-app-id>"
        tokenScope: "<oc-app-id>/.default"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "orchestration-cluster-client-secret"

identity:
  enabled: true
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
  database:
    elasticsearch:
      enabled: true
      external: true
      url:
        protocol: https
        host: "<elasticsearch-host>"
        port: 9200

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
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
