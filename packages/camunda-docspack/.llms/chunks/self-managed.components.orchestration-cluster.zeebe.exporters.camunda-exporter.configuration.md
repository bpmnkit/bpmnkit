# Camunda Exporter — Configuration

Camunda Exporter is enabled by default if secondary storage is configured to use Elasticsearch or OpenSearch. See the properties prefixed with `CAMUNDA_DATA_SECONDARYSTORAGE` in [secondary-storage configuration properties](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#data---secondary-storage).

To connect to an external Elasticsearch or OpenSearch cluster, configure the secondary storage endpoint with `camunda.data.secondary-storage.elasticsearch.url` or `camunda.data.secondary-storage.elasticsearch.urls`. If you're using OpenSearch, use `camunda.data.secondary-storage.opensearch.url` or `camunda.data.secondary-storage.opensearch.urls` instead. The Camunda Exporter reuses that secondary storage connection automatically.

If you're deploying with Helm, configure the external cluster in your Elasticsearch or OpenSearch values, then set the secondary storage type for Orchestration Cluster. For a complete Helm example, see [configure secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage#configuration-options) and [using external Elasticsearch](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch).

**Info: Helm values mapping**
The option names in the tabs below (for example, `rolloverInterval`) are exporter option names, not top-level Helm values keys.

In Helm, configure these as Orchestration Cluster application properties using `orchestration.extraConfiguration` (or `orchestration.configuration`).

For example, set history rollover using:

- `camunda.data.secondary-storage.elasticsearch.history.rollover-interval`
- `camunda.data.secondary-storage.opensearch.history.rollover-interval`

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
