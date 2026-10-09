# Property reference — Data - secondary storage

Review [secondary storage management](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/managing-secondary-storage) for guidance on best practices, ensuring data integrity and performance optimization.

**Warning**
When Elasticsearch/OpenSearch Exporter indices and Orchestration Cluster indices share the same Elasticsearch or OpenSearch cluster, they must use different index prefixes. One prefix must not be the beginning of the other (for example, avoid `custom` and `custom-zeebe` together because `custom*` matches both). Do not use `operate`, `tasklist`, or `camunda` as the full exporter prefix, and do not use `zeebe-record` as the Orchestration Cluster index prefix, as `zeebe-record` is the default prefix for Elasticsearch/OpenSearch Exporter indices.

The Orchestration Cluster prefix is configured via
`camunda.data.secondary-storage.{elasticsearch|opensearch}.index-prefix`
(or `CAMUNDA_DATA_SECONDARYSTORAGE_{ELASTICSEARCH|OPENSEARCH}_INDEXPREFIX`).

For detailed requirements, configuration examples, and common mistakes, see
[index prefix configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices#index-prefix-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
