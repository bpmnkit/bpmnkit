# Connect Camunda to any OIDC provider — Configure Camunda components — Configure Connectors

Add configuration for Connectors:

```yaml
connectors:
  enabled: true
  security:
    authentication:
      method: oidc
      oidc:
        clientId: <orchestration-client-id>
        audience: <orchestration-audience>
        secret:
          existingSecret: oidc-credentials
          existingSecretKey: orchestration-client-secret
```

**Info: Connectors shares credentials**
Connectors calls the Orchestration Cluster as a client, so it deliberately reuses the Orchestration Cluster's OIDC client and audience. This is a scoped exception to the [unique audience guidance](#assign-a-unique-audience-to-each-component). If you prefer a separate OIDC client for Connectors, you must also configure the Orchestration Cluster to accept that client's audience.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
