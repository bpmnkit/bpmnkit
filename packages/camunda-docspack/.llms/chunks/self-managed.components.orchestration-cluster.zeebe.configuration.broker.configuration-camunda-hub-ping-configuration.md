# Broker configuration — Configuration — Camunda Hub ping configuration

This feature enables components like the Zeebe Broker, Tasklist, Operate, and Zeebe Gateway to ping Camunda Hub with license information. For this feature to work, you must enable [dynamic cluster configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#dynamic-cluster-management), which exposes the create cluster API endpoint.

#### camunda.console.ping

| Field                        | Description                                                                                                                                                                                 | Example value                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `enabled`                    | Enables or disables the ping to console feature. Disabled by default. This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_ENABLED`                     | `true`                                     |
| `endpoint`                   | Create cluster API endpoint where pings should be sent. This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_ENDPOINT`.                                 | `https://hub.endpoint.com/api/v1/clusters` |
| `clusterName`                | Cluster name sent with telemetry. This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_CLUSTERNAME`.                                                    | `test_cluster_name`                        |
| `pingPeriod`                 | Frequency of pings (for example, `1s`, `1h`, `1d`). This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_PINGPERIOD`.                                   | `1h`                                       |
| `properties`                 | Additional properties to include in the ping payload (as key-value pairs). This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_PROPERTIES`.            | `testProperty: 123`                        |
| `retry.maxRetries`           | Maximum number of retry attempts after a failed ping. Uses exponential backoff. This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_RETRY_MAXRETRIES`. | `1`                                        |
| `retry.minRetryDelay`        | Minimum delay between retries. This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_RETRY_MINRETRYDELAY`.                                               | `1s`                                       |
| `retry.maxRetryDelay`        | Maximum delay between retries. This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_RETRY_MAXRETRYDELAY`.                                               | `10s`                                      |
| `retry.retryDelayMultiplier` | Multiplier applied to delay between retries. This setting can also be overridden using the environment variable `CAMUNDA_CONSOLE_PING_RETRY_RETRYDELAYMULTIPLIER`.                          | `2`                                        |

##### YAML snippet

```yaml
camunda:
  console:
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
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
