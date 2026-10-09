# OpenSearch without cluster privileges — Update index settings with the standalone schema manager {#settings-updates}

You can roll out index template setting changes (shards, replicas, template priority) via the standalone schema manager without providing cluster privileges to the running application.

Supported settings (see [configuration references](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#index--retention-settings) and [OpenSearch exporter configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter)):

- numberOfShards (new indices only; Operate / Tasklist / Camunda / Zeebe exporter)
- numberOfReplicas (dynamic for Operate / Tasklist / Camunda; static for Zeebe exporter indices)
- templatePriority (precedence when multiple templates match)

Procedure:

1. For Operate and Tasklist 8.7.11+, set `updateSchemaSettings: true` if applicable.
2. Run schema manager with privileged user while application remains online.
3. Verify successful completion.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges
