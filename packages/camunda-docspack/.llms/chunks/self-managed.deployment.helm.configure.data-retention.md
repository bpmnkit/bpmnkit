# Configure data retention

Learn how to configure data retention policies in Camunda 8.8 Helm charts to automatically manage and delete old data.

Data retention policies automatically delete old data from secondary storage after a specified time period. This prevents unlimited data growth, reduces storage costs, and maintains system performance.

If you use Elasticsearch or OpenSearch as your secondary storage backend, retention is implemented using Index Lifecycle Management (ILM) for Elasticsearch or Index State Management (ISM) for OpenSearch. See [Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch) for details.

**Note**
If you use an RDBMS as your secondary storage backend, implement retention and cleanup using the RDBMS exporter and database-specific mechanisms. See [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration) for details.

**Tip: Best practice**
**Configure data retention during initial installation.** Adding retention configuration after deployment may require manual policy creation in Elasticsearch/OpenSearch. See [Differences from previous versions](#differences-from-previous-versions) for version-specific behavior.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
