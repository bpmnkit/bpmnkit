# Property reference — Data - secondary storage — db-helm

| Helm value key                                           | Description                                                                        | Default value                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `orchestration.history.retention.enabled`                | Enables creation and application of retention/ILM policies for historical indices. | `false`                                  |
| `orchestration.history.retention.minimumAge`             | Minimum age before standard historical indices are deleted.                        | `30d`                                    |
| `orchestration.history.retention.policyName`             | Name of the ILM policy applied to standard historical indices.                     | `camunda-retention-policy`               |
| `orchestration.history.retention.usageMetricsMinimumAge` | Minimum age before usage metrics indices are deleted.                              | `730d`                                   |
| `orchestration.history.retention.usageMetricsPolicyName` | Name of the ILM policy applied to usage metrics indices.                           | `camunda-usage-metrics-retention-policy` |

**Note**
Shards/replicas and template priority overrides are not currently exposed as Helm values.
Configure these via environment variables or `application.yaml` properties (`camunda.database.index.*`) if supported by your runtime version.

  

**Note**
Durations support ISO-8601 (`P30D`) or simplified suffix formats (`30d`, `12h`).
Use simplified suffix formats unless strict ISO-8601 compliance is required.

#### Replica count changes (`number-of-replicas` and per-index overrides`)

- For **newer versions (8.8+)**, changes are applied to existing indices on the next application restart—their settings are updated in place.
- Also written to the index templates so that **newly created indices** inherit the updated replica configuration.

#### Shard count changes (`number-of-shards` and per-index overrides`)

- Only applied to **index templates**, affecting indices created _after_ the change.
- Existing indices retain their original shard layout.

#### Template priority changes

- Adjust which template is applied when multiple patterns match.
- The effect is **only for indices created _after_ the change**.

**Note**
Some Elasticsearch and OpenSearch deployments may ship predefined wildcard (`*` pattern) index templates with their own priorities. Assign a **strictly higher** priority to the Camunda index templates to ensure Camunda's mappings and settings take precedence when multiple templates match the same index name. If the priority is not higher, provider wildcard templates may override shard/replica defaults, analyzers, or field mappings, leading to unexpected index behavior.

**Note**

Maps (for example, shards/replicas overrides) are key-value objects:

```yaml
camunda.database.index.shards-by-index-name:
  list-view: 3
  task: 2
```

 -->

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
