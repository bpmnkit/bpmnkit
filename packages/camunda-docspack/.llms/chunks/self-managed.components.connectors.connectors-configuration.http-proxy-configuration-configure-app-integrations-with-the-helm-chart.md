# Configuration — HTTP proxy configuration — Configure App Integrations with the Helm chart

The two secret values, `apiKey` and `oauth`, take the chart's standard secret block. Reference an existing Kubernetes Secret in production, and use `inlineSecret` only for local testing.

To authenticate with OAuth 2.0 client credentials:

```yaml
connectors:
  appIntegrations:
    baseUrl: https://app-integrations.example.com
    clusterId: 11111111-2222-3333-4444-555555555555
    oauth:
      tokenEndpoint: https://idp.example.com/oauth/token
      clientId: camunda-app-integrations
      secret:
        existingSecret: app-integrations-oauth
        existingSecretKey: client-secret
```

To authenticate with an API key, where the cluster ID can be omitted:

```yaml
connectors:
  appIntegrations:
    baseUrl: https://app-integrations.example.com
    apiKey:
      secret:
        existingSecret: app-integrations-api-key
        existingSecretKey: api-key
```

The chart rejects a partially configured OAuth block, and OAuth without a cluster ID, at install time rather than at first job execution.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
