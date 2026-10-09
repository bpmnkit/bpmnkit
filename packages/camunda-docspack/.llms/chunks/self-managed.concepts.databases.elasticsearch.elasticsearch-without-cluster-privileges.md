# Elasticsearch without cluster privileges

If the Camunda single application cannot access Elasticsearch with cluster-level privileges, you can run the schema manager as a standalone application, separate from the main application.


## Standalone schema manager

When running the schema manager as a standalone application, cluster-level privileges are required only during schema creation. The single application itself does not need cluster-level privileges.

- Database support: This setup supports Elasticsearch only. For OpenSearch, see [Run OpenSearch without cluster privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges).
- Privileges required by the single application: The Camunda single application still requires an index-level privilege of at least `manage` to function properly.

To run the schema manager as a standalone application:

1. [Initialize the schema manager](#initialize): The database schema must first be initialized.
2. [Start the Camunda single application](#start): Once the schema is initialized, start the application without cluster-level privileges.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
