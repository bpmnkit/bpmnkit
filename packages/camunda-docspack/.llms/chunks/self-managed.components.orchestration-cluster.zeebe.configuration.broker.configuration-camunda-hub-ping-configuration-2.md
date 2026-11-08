# Broker configuration — Configuration — Camunda Hub ping configuration (2)

##### YAML snippet

```yaml
camunda:
  hub:
    ping:
      enabled: true
      endpoint: https://hub.endpoint.com/api/v1/clusters
      clusterName: test_cluster_name
      pingPeriod: 1h
      properties:
        testProperty: 123
      retry:
        maxRetries: 1
        minRetryDelay: 1s
        maxRetryDelay: 10s
        retryDelayMultiplier: 2
      credentials:
        tokenEndpoint: https://keycloak.example.com/realms/camunda/protocol/openid-connect/token
        clientId: zeebe-ping-client
        clientSecret: "***"
        tokenRequestParameters:
          audience: https://hub.example.com/api
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
