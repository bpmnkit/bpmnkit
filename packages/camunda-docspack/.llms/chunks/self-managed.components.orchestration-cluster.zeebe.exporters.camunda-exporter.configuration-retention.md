# Camunda Exporter — Configuration — retention

Helm property path prefix for these options:
`camunda.data.secondary-storage.retention.`

A retention policy can be set up to delete old data.
When enabled, this creates an Index Lifecycle Management (ILM) Policy that deletes the data after the specified
`minimumAge`.
All index templates created by this exporter apply the created ILM Policy.

| Option                 | Description                                                                                                                                                                        | Default                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| enabled                | If `true` the ILM Policy is created and applied to the index templates.                                                                                                            | `false`                                  |
| minimumAge             | Specifies how old the data must be, before the data is deleted as a duration.                                                                                                      | `30d`                                    |
| policyName             | The name of the created and applied ILM policy.                                                                                                                                    | `camunda-retention-policy`               |
| usageMetricsMinimumAge | Specifies how old the usage metrics data must be, before the data is deleted as a duration. Applies to `camunda-usage-metric-8.8.0_` and `camunda-usage-metric-tu-8.8.0_` indices. | `730d`                                   |
| usageMetricsPolicyName | The name of the created and applied usage metrics ILM policy.                                                                                                                      | `camunda-usage-metrics-retention-policy` |
| applyPolicyJobInterval | The interval at which the ILM policy is periodically applied to all historical indices (starting from version 8.8.1).                                                              | `PT1H`                                   |

**Note**
The duration can be specified in days `d`, hours `h`, minutes `m`, seconds `s`, milliseconds `ms`, and/or nanoseconds
`nanos`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
