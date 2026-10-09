# OpenSearch without cluster privileges

If the Camunda single application cannot access OpenSearch with cluster-level privileges (for example, due to restrictive IAM or fine‑grained access control policies), you can run the schema manager as a standalone application, separate from the main application.

This approach mirrors the Elasticsearch procedure, but uses OpenSearch-specific configuration and privileges. For Elasticsearch, see [Elasticsearch without cluster privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges).


## Standalone schema manager

When you run the schema manager as a standalone application, it requires
cluster-level privileges only during schema creation and settings updates.
The Camunda application then runs with minimal privileges (primarily index-level permissions, with one specific cluster-level requirement for clearing scrolls due to the OpenSearch security model).

- Database support: This setup is supported only for OpenSearch installations (Elasticsearch procedure uses a different configuration).
- Required privileges: The Camunda application requires the `manage` index-level privilege, and the `indices:data/read/scroll/clear` cluster permission to operate (see [OpenSearch privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-privileges)).

To run the schema manager as a standalone application:

1. [Initialize the schema manager](#initialize): Create templates, indices (as required), and apply retention ISM policies.

2. [Start the Camunda single application](#start): Run without cluster-level privileges using a restricted user.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges
