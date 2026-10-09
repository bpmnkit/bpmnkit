# Broker configuration — Configuration — Continuous backups configuration

Configuration options for primary storage continuous backups.

#### camunda.data.primary-storage.backup

| Field                        | Description                                                                                                                                            | Example value    |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- |
| `continuous`                 | Enables or disables the continuous backups feature.                                                                                                    | `true`           |
| `required`                   | Forces the continuous backups feature to be properly configured during broker startup.                                                                 | `true`           |
| `schedule`                   | The interval at which a primary storage backup is taken. Can be a CRON expression, an ISO-8601 duration, or `none`.                                    | `PT12H`          |
| `checkpoint-interval`        | The interval at which checkpoints are ingested into the log stream. Uses an ISO-8601 duration.                                                         | `PT5M`           |
| `offset`                     | Optional offset for the generated backup identifiers.                                                                                                  | `20260215115715` |
| `retention.window`           | The active window of backups available for restore in the configured backup store. Uses an ISO-8601 duration.                                          | `P1W`            |
| `retention.cleanup-schedule` | The interval at which the retention mechanism checks for backups outside the active window. Can be a CRON expression, an ISO-8601 duration, or `none`. | `PT1H`           |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
