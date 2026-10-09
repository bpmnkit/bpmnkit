# Configure RDBMS in Helm chart

Configure an external relational database (RDBMS) as secondary storage for Camunda 8 Self-Managed using the Helm chart. Helm values reference, JDBC drivers, schema management, and troubleshooting.

Camunda 8 Self-Managed supports using an external relational database (RDBMS) as the Orchestration Cluster's secondary storage instead of Elasticsearch or OpenSearch.

This page provides:

- **[Configuration reference](#configuration)**: All Helm values organized by function.
- **[Quick example](#example-usage)**: Minimal YAML to get started.
- Links to detailed guides for specific tasks.

Related guides:

- [Secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture)
- [Secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index)
- [RDBMS example deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms)
- [JDBC driver management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms
