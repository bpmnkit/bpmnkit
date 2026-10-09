# Property reference — Data - secondary storage — db-yaml

| Application.yaml property                              | Description                                                                                            | Default value | Overridable per Physical Tenant |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- | :------------------------------ |
| `camunda.database.index.number-of-shards`              | Default number of primary shards for new indices.                                                      | `1` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.index.shards-by-index-name`          | Map overriding shard count per index (key=index name, value=shards).                                   | `-` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.index.number-of-replicas`            | Default number of replicas for new indices.                                                            | `0` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.index.replicas-by-index-name`        | Map overriding replica count per index (key=index name, value=replicas).                               | `-` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.index.template-priority`             | Priority applied to index templates created by the platform. Higher values override provider defaults. | `-` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.retention.enabled`                   | Enables creation and application of retention/ILM policies.                                            | `false` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.retention.minimum-age`               | Minimum age before data is eligible for deletion.                                                      | `30d` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.retention.policy-name`               | Name of the retention policy applied to standard indices.                                              | `camunda-retention-policy` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.retention.usage-metrics-minimum-age` | Minimum age before usage metrics indices are deleted.                                                  | `730d` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `camunda.database.retention.usage-metrics-policy-name` | Name of the retention policy applied to usage metrics indices.                                         | `camunda-usage-metrics-retention-policy` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
