# Elasticsearch without cluster privileges — Standalone backup application

If the Camunda application(s) cannot access Elasticsearch with cluster-level privileges, you can run the backup for Operate and Tasklist data as a standalone application, separate from the main application.

Creating a snapshot in Elasticsearch requires `manage_snapshots` cluster-level privileges. These privileges are only needed by the application responsible for creating the backups; the Camunda application(s) do not require cluster-level privileges.

- Database support: This setup supports Elasticsearch only. For OpenSearch, see [Run OpenSearch without cluster privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges).
- Indices: The standalone application only handles Operate and Tasklist indices. Optimize is not included in this procedure.

**Note**

Before using the standalone backup manager:

- A user with cluster-level privileges (including snapshot creation) must be configured in Elasticsearch. A user with the [snapshot_user](https://www.elastic.co/guide/en/elasticsearch/reference/current/built-in-roles.html#:~:text=related%20to%20rollups.-,snapshot_user,-Grants%20the%20necessary) role should be sufficient to run the backup application.  
  However, restoring snapshots also requires index-level permissions.
- An [Elasticsearch snapshot repository](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html) must be configured.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
