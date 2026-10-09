# Overview — Document-store backends

Camunda supports document-store backends such as Elasticsearch and OpenSearch.

These systems are optimized for high-volume ingestion and flexible search queries.

Related documentation:

- [Elasticsearch privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-privileges)
- [OpenSearch privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-privileges)
- [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter)
- [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter)


## Relational databases (RDBMS)

Camunda also supports several relational databases for secondary storage, enabling the Orchestration Cluster API, Operate, Tasklist, and Admin to run without Elasticsearch or OpenSearch.

RDBMS and document-store backends are both valid secondary storage options. Select based on your workload, operational model, and platform standards.

A full list of supported vendors and versions, JDBC driver information, and component compatibility is published in the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

For configuration details in Helm deployments, see the [RDBMS configuration guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/overview
