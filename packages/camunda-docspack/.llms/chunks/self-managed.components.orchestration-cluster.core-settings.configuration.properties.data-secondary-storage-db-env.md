# Property reference — Data - secondary storage — db-env

| Environment variable                                | Description                                                                                            | Default value | Overridable per Physical Tenant |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- | :------------------------------ |
| `CAMUNDA_DATABASE_INDEX_NUMBEROFSHARDS`             | Default number of primary shards for new indices.                                                      | `1` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_INDEX_SHARDSBYINDEXNAME`          | JSON map overriding shard count per index (key=index name, value=shards).                              | `-` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_INDEX_NUMBEROFREPLICAS`           | Default number of replicas for new indices.                                                            | `0` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_INDEX_REPLICASBYINDEXNAME`        | JSON map overriding replica count per index (key=index name, value=replicas).                          | `-` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_INDEX_TEMPLATEPRIORITY`           | Priority applied to index templates created by the platform. Higher values override provider defaults. | `-` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_RETENTION_ENABLED`                | Enables creation and application of retention/ILM policies.                                            | `false` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_RETENTION_MINIMUMAGE`             | Minimum age before data is eligible for deletion.                                                      | `30d` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_RETENTION_POLICYNAME`             | Name of the retention policy applied to standard indices.                                              | `camunda-retention-policy` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_RETENTION_USAGEMETRICSMINIMUMAGE` | Minimum age before usage metrics indices are deleted.                                                  | `730d` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |
| `CAMUNDA_DATABASE_RETENTION_USAGEMETRICSPOLICYNAME` | Name of the retention policy applied to usage metrics indices.                                         | `camunda-usage-metrics-retention-policy` | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
