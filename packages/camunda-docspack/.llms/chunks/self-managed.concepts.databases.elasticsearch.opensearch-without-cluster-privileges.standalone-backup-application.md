# OpenSearch without cluster privileges — Standalone backup application

Snapshot backups require the `manage_snapshots` cluster-level privilege. If the main application cannot hold this privilege, run a separate backup application with an elevated user.

- Database support: Supported only for OpenSearch installations in this procedure.
- Indices covered: Operate and Tasklist indices (Optimize indices excluded from this simplified procedure; handle separately if used).

Before running the standalone backup manager:

1. Ensure snapshot repository is configured (for example, S3, filesystem) with appropriate permissions.
2. Ensure elevated user has `manage_snapshots` and access to index patterns.
3. Prepare backup configuration file referencing OpenSearch connection under `camunda.data.secondary-storage.opensearch`.

(Backup command usage mirrors Elasticsearch steps; adjust endpoints to OpenSearch.)

### High-level flow recap

| Step | Action                                                               |
| ---- | -------------------------------------------------------------------- |
| 1    | Run the privileged schema manager to prepare templates and indices   |
| 2    | Start the application with a restricted user                         |
| 3    | (Upgrade) Run the next version of the schema manager with privileges |
| 4    | Upgrade the application with schema creation disabled                |
| 5    | (Optional) Run the standalone backup application                     |

This staged approach reduces or eliminates downtime for minor upgrades and isolates cluster-level privileges to short-lived administrative tasks rather than long-running services.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges
