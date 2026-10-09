# Configure Elasticsearch and OpenSearch index prefixes — Index prefix configuration

When Elasticsearch/OpenSearch Exporter indices and Orchestration Cluster indices (secondary storage) share the same cluster, their prefixes must follow all of the rules below.

### Requirements

1. Use unique prefixes – Do not reuse the same prefix for both index types.
2. Avoid prefix relationships between prefixes – Neither prefix may match the other prefix’s wildcard pattern. In other words, the literal string of prefix A must not match `prefixB*`, and the literal string of prefix B must not match `prefixA*`. For example, `custom` (Elasticsearch/OpenSearch Exporter) and `custom-zeebe` (Orchestration Cluster) are unsafe because `custom*` matches both groups, while `custom-index1` and `custom-index2` are safe because `custom-index1*` matches only `custom-index1…` indices and `custom-index2*` matches only `custom-index2…` indices.
3. Avoid reserved names as bare prefixes – Do not use `operate`, `tasklist`, or `camunda` as the full exporter prefix. Using these names as part of a longer custom prefix (for example, `custom-camunda`) is allowed, as long as rules 1 and 2 are still satisfied.

### Configuration properties

| Index type                                | Configuration property                                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elasticsearch/OpenSearch Exporter indices | `zeebe.broker.exporters.{elasticsearch\|opensearch}.args.index.prefix` (and `ZEEBE_BROKER_EXPORTERS_{ELASTICSEARCH\|OPENSEARCH}_ARGS_INDEX_PREFIX`)     |
| Orchestration Cluster indices             | `camunda.data.secondary-storage.{elasticsearch\|opensearch}.index-prefix` (and `CAMUNDA_DATA_SECONDARYSTORAGE_{ELASTICSEARCH\|OPENSEARCH}_INDEXPREFIX`) |

### Common mistakes to avoid

- **Do not** set the Orchestration Cluster index prefix to `zeebe-record` (the default exporter prefix `zeebe.broker.exporters.{elasticsearch|opensearch}.args.index.prefix`).
- **Do not** set the exporter prefix to `operate`, `tasklist`, or `camunda`.

### Why this matters

Prefixes that violate these rules can cause ILM/ISM policies and wildcard patterns to match unintended indices, potentially leading to unexpected data loss.

**Warning**
Changing an index prefix after a Camunda instance has been running creates new, empty indices with the new prefix. Camunda does not provide built‑in migration support between old and new prefixes.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices
