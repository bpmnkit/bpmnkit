# Configure Elasticsearch and OpenSearch index prefixes — Configuration reference

| Configuration                            | Default        | Used By                                 | Purpose                                                  |
| ---------------------------------------- | -------------- | --------------------------------------- | -------------------------------------------------------- |
| `orchestration.index.prefix`             | `""`           | Camunda Exporter, Orchestration Cluster | Prefix for Orchestration Cluster indices                 |
| `optimize.database.elasticsearch.prefix` | `zeebe-record` | Legacy Zeebe Exporter                   | Prefix for `zeebe-record` indices (consumed by Optimize) |
| `optimize.database.opensearch.prefix`    | `zeebe-record` | Legacy Zeebe Exporter                   | Prefix for `zeebe-record` indices when using OpenSearch  |

### Optimize-specific configuration

When you use a custom prefix for `zeebe-record` indices and Optimize is enabled, you must also configure Optimize to use the same prefixes. If these values do not match the exporter prefix exactly, Optimize can start but does not display process data.

| Environment Variable                                   | Purpose                                                                                      |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX` | Prefix for Optimize's own indices (Elasticsearch)                                            |
| `CAMUNDA_OPTIMIZE_OPENSEARCH_SETTINGS_INDEX_PREFIX`    | Prefix for Optimize's own indices (OpenSearch)                                               |
| `CAMUNDA_OPTIMIZE_ZEEBE_NAME`                          | Must match `optimize.database.elasticsearch.prefix` or `optimize.database.opensearch.prefix` |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices
