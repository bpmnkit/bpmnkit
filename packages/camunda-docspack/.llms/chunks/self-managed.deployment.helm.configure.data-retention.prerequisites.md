# Configure data retention — Prerequisites

- Camunda 8.8+ Helm chart deployment
- A [supported Elasticsearch or OpenSearch version](https://docs.camunda.io/docs/next/reference/supported-environments#opensearch-and-elasticsearch-support).
- Access to modify your `values.yaml` file


## Configuration

Configure retention policies in your `values.yaml` file under the `orchestration` section.

Retention policy types:

1. **Elasticsearch/OpenSearch Exporter indices (Zeebe records)** (`orchestration.retention`) – Retention for Zeebe record indices written by the legacy Elasticsearch/OpenSearch Exporter (for example, `zeebe-record-*`). These are _not_ Orchestration Cluster indices.
1. **Orchestration Cluster indices (historical data)** (`orchestration.history.retention`) – Retention for archived Operate, Tasklist, and Camunda indices stored in secondary storage.

For index prefix requirements and examples when both index families share the same Elasticsearch/OpenSearch cluster, see [Configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices).

**Warning**

Zeebe records retention requirements `orchestration.retention.*` apply only to Elasticsearch/OpenSearch Exporter indices (Zeebe records), not to Orchestration Cluster indices managed by the Camunda Exporter.

The `orchestration.retention` configuration requires the legacy Zeebe Elasticsearch/OpenSearch Exporter to be enabled. The legacy exporter is automatically enabled when:

- `orchestration.exporters.zeebe.enabled: true` is set, OR
- Optimize is enabled (`optimize.enabled: true`), OR
- Data migration is enabled (`orchestration.migration.data.enabled: true`)

Starting in Camunda 8.8, `orchestration.exporters.zeebe.enabled` defaults to `false`. If you need Zeebe record retention without Optimize, you must explicitly enable it.

For full exporter configuration and retention options, see [Zeebe Elasticsearch Exporter retention](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
