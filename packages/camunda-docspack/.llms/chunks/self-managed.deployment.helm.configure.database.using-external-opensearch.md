# Use Amazon OpenSearch Service for Orchestration Cluster with Helm

Learn how to connect the Orchestration Cluster in a Camunda 8 Self-Managed Helm deployment to an external Amazon OpenSearch Service instance.

Configure the Orchestration Cluster in Camunda 8 Self-Managed to use Amazon OpenSearch Service as a secondary storage backend when deploying with the Helm chart. OpenSearch is used for indexing and querying operational data consumed by Orchestration Cluster applications and APIs. For a canonical definition, see [Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch).

Starting with Camunda 8.9, the Helm chart no longer provisions Elasticsearch by default. You can configure the Helm chart to connect to an external Amazon OpenSearch Service instance as an alternative secondary storage backend.

This page applies to the Orchestration Cluster only. If you also deploy Optimize, configure Optimize separately using [use external OpenSearch for Optimize with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-opensearch).

Secondary storage is configurable. For supported components, you can use an RDBMS-based secondary store instead. See [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration) or the glossary entry [RDBMS](https://docs.camunda.io/docs/next/reference/glossary#rdbms). For the [quick-install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install) scenario, RDBMS with embedded H2 is used instead.

**Info: OpenSearch support**
Camunda 8 supports both the open-source [OpenSearch](https://opensearch.org/) distribution and [Amazon OpenSearch Service](https://aws.amazon.com/opensearch-service).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch
