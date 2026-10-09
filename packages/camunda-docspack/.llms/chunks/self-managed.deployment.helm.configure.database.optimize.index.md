# Configure Optimize databases in Helm chart

Configure Elasticsearch and OpenSearch for Optimize in Camunda 8 Self-Managed Helm deployments.

Use this section to configure Optimize's database connection in Helm deployments.

Optimize supports Elasticsearch or OpenSearch only. It does not support RDBMS.

This section applies to Optimize only. If you also need to configure Elasticsearch or OpenSearch for the Orchestration Cluster, use the [Orchestration Cluster Elasticsearch/OpenSearch pages](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/non-sql).

Use the following pages based on your backend:

- [Use external Elasticsearch for Optimize with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-elasticsearch)
- [Use external OpenSearch for Optimize with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-opensearch)

Shared Elasticsearch and OpenSearch tasks:

- [Configure custom HTTP headers for database clients](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/configure-db-custom-headers)
- [Configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices)

For background on secondary storage choices and exporter behavior, see [secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/index
