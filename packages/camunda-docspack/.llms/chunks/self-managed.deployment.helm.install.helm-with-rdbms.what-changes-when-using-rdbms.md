# RDBMS example deployment for Camunda with Helm — What changes when using RDBMS?

In Camunda 8, secondary storage stores historical data and process state. You can use either a document-store backend (Elasticsearch/OpenSearch) or an RDBMS, depending on your requirements. For the canonical production trade-off guidance, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture).

This guide focuses on the Helm-specific RDBMS path. In practice, that means you provide and operate an external supported relational database, and the Orchestration Cluster reads operational data through that backend.

When using RDBMS, **Optimize still requires Elasticsearch or OpenSearch**. Only the Orchestration Cluster uses RDBMS.

In this topology:

- The RDBMS exporter writes Orchestration Cluster data to your external relational database.
- Operate, Tasklist, and Admin use the Orchestration Cluster API, and that API queries the configured RDBMS secondary storage.
- If you also deploy Optimize, keep Elasticsearch or OpenSearch available and enable an additional Elasticsearch/OpenSearch exporter for Optimize.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
