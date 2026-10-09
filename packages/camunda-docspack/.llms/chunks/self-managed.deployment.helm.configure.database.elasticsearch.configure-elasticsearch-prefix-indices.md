# Configure Elasticsearch and OpenSearch index prefixes

Configure Elasticsearch and OpenSearch index prefixes to organize indices and isolate data when multiple Camunda instances share a cluster.

Camunda components store operational data in Elasticsearch or OpenSearch indices. By default, Camunda uses the standard index names created by each exporter.

This page applies to both the Orchestration Cluster and Optimize when they use Elasticsearch or OpenSearch in Helm deployments.

Configure an index prefix when you need to:

- Organize indices by grouping related indices under a consistent naming pattern.
- Isolate data when multiple Camunda instances share the same Elasticsearch or OpenSearch cluster, so they don’t write to or read from each other’s indices.
- Avoid index name collisions in multi-instance environments (for example, separate dev/test/prod installations using one shared cluster).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices
