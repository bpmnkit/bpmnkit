# Configure Elasticsearch and OpenSearch index prefixes — Exporters and index prefixes

Starting with Camunda 8.8, index prefixes are configured per exporter. Camunda uses two exporters, and each exporter has its own index prefix configuration.

### Camunda Exporter (default)

The Camunda Exporter is enabled by default. It creates Orchestration Cluster indices used by Orchestration Cluster applications and APIs, including Operate and Tasklist.

- **Helm configuration**: `orchestration.index.prefix`
- **Default value**: `""` (empty string, meaning no prefix)
- **Controlled by**: `orchestration.exporters.camunda.enabled: true` (default)

### Legacy Zeebe Exporter

The legacy Zeebe Exporter creates `zeebe-record` indices consumed by Optimize. In the Camunda 8.10 Helm chart, the exporter requires Optimize and its Elasticsearch or OpenSearch backend to be enabled.

- **Helm configuration**: `optimize.database.elasticsearch.prefix` or `optimize.database.opensearch.prefix`
- **Default value**: `zeebe-record`
- **Required consumer**: Optimize (`optimize.enabled: true`)

**Note: When the legacy Zeebe Exporter is used**
In single-region deployments, the chart automatically enables the legacy Zeebe Exporter when Optimize and its Elasticsearch or OpenSearch backend are enabled in the same release. Without Optimize in the release, set `orchestration.exporters.zeebe.enabled: true` to enable it against the Elasticsearch or OpenSearch secondary storage, and set its prefix with `orchestration.exporters.zeebe.index.prefix`. This is how a separate Optimize release gets its records. See [export records for Optimize](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#export-records-for-optimize).

When Optimize is disabled, `optimize.database.elasticsearch.prefix` and `optimize.database.opensearch.prefix` have no effect. You can still configure the Camunda Exporter prefix with `orchestration.index.prefix`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices
