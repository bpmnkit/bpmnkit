# Gateway configuration — Configuration — zeebe.gateway.longPolling

It's possible to configure gateway long-polling behavior. Read more on long-polling behavior [here](https://docs.camunda.io/docs/next/components/concepts/job-workers#long-polling).

| Field             | Description                                                                                                                                                                                                                                     | Example value |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled           | Enables long polling for available jobs. This setting can also be overridden using the environment `variable ZEEBE_GATEWAY_LONGPOLLING_ENABLED`.                                                                                                | true          |
| timeout           | Set the timeout for long polling in milliseconds. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_LONGPOLLING_TIMEOUT`.                                                                                       | 10000         |
| probeTimeout      | Set the probe timeout for long polling in milliseconds. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_LONGPOLLING_PROBETIMEOUT`.                                                                            | 10000         |
| minEmptyResponses | Set the number of minimum empty responses, a minimum number of responses with jobCount of 0 infers that no job are available. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_LONGPOLLING_MINEMPTYRESPONSES`. | 3             |

#### YAML snippet

```yaml
longPolling:
  enabled: true
  timeout: 10000
  probeTimeout: 10000
  minEmptyResponses: 3
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
