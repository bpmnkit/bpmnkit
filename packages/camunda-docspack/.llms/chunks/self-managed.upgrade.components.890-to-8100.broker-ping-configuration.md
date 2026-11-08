# Upgrade Camunda components from 8.9 to 8.10 — Broker ping configuration

If you configured `camunda.console.ping` in your broker to send license information to Console, rename the configuration namespace to `camunda.hub.ping` and update the corresponding environment variables.

| 8.9 property                                      | 8.10 property                                 |
| :------------------------------------------------ | :-------------------------------------------- |
| `camunda.console.ping.enabled`                    | `camunda.hub.ping.enabled`                    |
| `camunda.console.ping.endpoint`                   | `camunda.hub.ping.endpoint`                   |
| `camunda.console.ping.clusterName`                | `camunda.hub.ping.clusterName`                |
| `camunda.console.ping.pingPeriod`                 | `camunda.hub.ping.pingPeriod`                 |
| `camunda.console.ping.properties`                 | `camunda.hub.ping.properties`                 |
| `camunda.console.ping.retry.maxRetries`           | `camunda.hub.ping.retry.maxRetries`           |
| `camunda.console.ping.retry.minRetryDelay`        | `camunda.hub.ping.retry.minRetryDelay`        |
| `camunda.console.ping.retry.maxRetryDelay`        | `camunda.hub.ping.retry.maxRetryDelay`        |
| `camunda.console.ping.retry.retryDelayMultiplier` | `camunda.hub.ping.retry.retryDelayMultiplier` |

The `POST /clusters` endpoint now requires authentication. Add the new `camunda.hub.ping.credentials` block with your OAuth 2.0 M2M client credentials. See the [broker configuration reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#camunda-hub-ping-configuration) for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
