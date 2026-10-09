# Property reference — Data - secondary storage — Index & retention settings

Properties such as `camunda.data.secondary-storage.elasticsearch.number-of-shards` control index creation characteristics (shards, replicas, template priority) and retention/lifecycle policies for Orchestration Cluster indices.

**Note**
Shards/replicas and template priority overrides are not currently exposed as Helm values. Configure these via environment variables or `application.yaml` properties if supported by your runtime version.

#### Replica count changes (`number-of-replicas` and per-index overrides`)

- For newer versions (8.8+), changes are applied to existing indices on the next application restart, with settings updated in place.
- These are also written to the index templates so that newly created indices inherit the updated replica configuration.

#### Shard count changes (`number-of-shards` and per-index overrides`)

- These are only applied to index templates, affecting indices created _after_ the change.
- Existing indices retain their original shard layout.

#### Template priority changes

- Adjusts which template is applied when multiple patterns match.
- The effect is only for indices created _after_ the change.

**Note**
Some Elasticsearch and OpenSearch deployments may ship predefined wildcard (`*` pattern) index templates with their own priorities. Assign a **strictly higher** priority to the Camunda index templates to ensure Camunda's mappings and settings take precedence when multiple templates match the same index name. If the priority is not higher, provider wildcard templates may override shard/replica defaults, analyzers, or field mappings, leading to unexpected index behavior.

**Note**

Maps (for example, shards/replicas overrides) are key-value objects:

```yaml
camunda.data.secondary-storage.elasticsearch.number-of-shards-per-index:
  list-view: 3
  task: 2
```

<!-- ## Secondary storage

Review [secondary storage management](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/managing-secondary-storage) for guidance on best practices, ensuring data integrity and performance optimization.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
