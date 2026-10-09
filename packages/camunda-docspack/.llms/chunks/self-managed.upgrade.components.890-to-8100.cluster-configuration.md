# Upgrade Camunda components from 8.9 to 8.10 — Cluster configuration

The following settings have been ported from the Console configuration in 8.9 to Camunda Hub in 8.10:

| 8.9                                                           | 8.10                                                              |
| :------------------------------------------------------------ | :---------------------------------------------------------------- |
| `camunda.console.managed.releases[0].tags`                    | `camunda.hub.clusters[0].tags`                                    |
| `camunda.console.managed.releases[0].custom-properties`       | `camunda.hub.clusters[0].custom-properties`                       |
| `camunda.console.managed.releases[0].components`              | `camunda.hub.clusters[0].components`                              |
| `camunda.console.managed.releases[0].components[0].id`        | `camunda.hub.clusters[0].components[0].type`                      |
| `camunda.console.managed.releases[0].components[0].url`       | `camunda.hub.clusters[0].components[0].urls.<webapp\|rest\|grpc>` |
| `camunda.console.managed.releases[0].components[0].readiness` | `camunda.hub.clusters[0].components[0].urls.readiness`            |
| `camunda.console.managed.releases[0].components[0].metrics`   | Removed.                                                          |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
