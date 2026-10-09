# Configure secondary storage — Choosing a storage backend

- Local testing or Camunda 8 Run quickstart: H2 is fast, lightweight, and runs entirely in memory or file-based.
- Production workloads: Use a supported RDBMS or document-store backend. Choose based on operational needs and validate with [benchmarking and sizing guidance](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment).
- Debugging and troubleshooting: H2 or PostgreSQL are often easier to inspect and visualize.

### H2 limitations

Use H2 only for development, testing, and evaluation.

- H2 is non-production only.
- H2 in-memory mode does not persist data across restarts.
- H2 file-based mode persists only to local node disk and is intended for local/dev usage.
- H2 does not provide a shared database across brokers.
- Multi-broker clusters with H2 are not a valid architecture; query results can be broker-local and incomplete.
- H2 has limited concurrency and scalability compared to external production backends.

For Helm deployments, if you choose H2 you must run a single broker (`clusterSize: 1`, `partitionCount: 1`, `replicationFactor: 1`). For multi-broker Helm clusters, use a shared external backend (for example, PostgreSQL).

### Migration from invalid H2 setups

If you currently run an invalid H2 topology, use one of these paths:

1. Local/dev only: Move to file-based H2 with a single broker.
2. Shared or clustered deployment: Move to an external persistent backend (for example, PostgreSQL, MariaDB, MySQL, Oracle, SQL Server, Elasticsearch, or OpenSearch according to support and architecture).

**Note**
Starting in 8.9, H2 is the default secondary storage for lightweight Camunda 8 Run setups and quickstarts. H2 remains suitable for local testing, demos, and file-based setups, but it is not recommended for production workloads where persistence, scaling, and full analytics are required.

For production use, Orchestration Cluster applications and APIs (including Operate, Tasklist, Identity, and search endpoints) should run against a persistent secondary storage backend such as a supported RDBMS or a document-store backend (Elasticsearch/OpenSearch). Both are valid production choices when supported for your deployment. Consult the [RDBMS version support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) when choosing a relational database, and [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments) for Elasticsearch/OpenSearch versions.

Once a selection is made and the cluster is deployed, the secondary storage backend is fixed. Switching between backend families (document-store and RDBMS) or migrating between backends within the same family is not supported. Plan migration as a fresh cluster deployment, with new primary and secondary storage, and validate the procedure in a non-production environment before rollout. For upgrade planning, see [prepare for upgrade](https://docs.camunda.io/docs/next/self-managed/upgrade/prepare-for-upgrade).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage
