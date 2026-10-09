# Production architecture for Camunda 8 with RDBMS — When document-store secondary storage is required

Elasticsearch or OpenSearch is required **only for Optimize**. When Optimize is enabled:

- Deploy Elasticsearch/OpenSearch alongside your RDBMS
- Enable the Elasticsearch or OpenSearch exporter to store analytics data
- The Orchestration Cluster uses RDBMS as secondary storage

Without Optimize: RDBMS-only stack is fully supported.


## Production constraints

❌ **ES/OS ↔ RDBMS migration not supported**: Choose your secondary storage backend before production. No automated migration tools are available.

❌ **Uniform broker configuration required**: All brokers in the Orchestration Cluster must export to the same secondary storage backend for its Orchestration Cluster indices. In addition, you may run Elasticsearch/OpenSearch to support Optimize, but the Orchestration Cluster still uses a single backend for its own secondary storage.

❌ **v1 API not supported**: Only the v2 Orchestration Cluster REST API works with RDBMS. See [migrate to the Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/rdbms-production-architecture
