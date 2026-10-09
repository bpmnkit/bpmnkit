# Camunda back up and restore — Considerations — Multiple Physical Tenants

Self-Managed only

In a cluster running multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), backup and exporting control are available at two scopes. The backup procedure itself is unchanged; only the endpoint you call and the identity you call it with differ.

There is no way to target a different tenant from a tenant-scoped call; the tenant is resolved from the caller's identity, not from the request path. To reach a specific tenant other than your own, or every tenant at once, use the cluster-wide endpoint with the optional `physicalTenantId` query parameter described below.

| Scope        | Endpoint                                   | Authorization                                       | Use it to                                                         |
| ------------ | ------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------- |
| Tenant       | Unprefixed, for example `/backups/runtime` | Tenant-local `BACKUP` and `EXPORTER` permissions    | Back up or inspect the Physical Tenant your credentials belong to |
| Cluster-wide | `/cluster/v2/…`                            | [Cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) | Back up every Physical Tenant in one call, or inspect them all    |

Both scopes serve the same operations:

| Operation         | Tenant-scoped (your own tenant) | Cluster-wide                        |
| ----------------- | ------------------------------- | ----------------------------------- |
| Runtime backup    | `/backups/runtime`              | `/cluster/v2/backups/runtime`       |
| Runtime state     | `/backups/runtime/state`        | `/cluster/v2/backups/runtime/state` |
| History backup    | `/backups/history`              | `/cluster/v2/backups/history`       |
| Exporting control | `/exporting`                    | `/cluster/v2/exporting`             |

Each cluster-wide endpoint also accepts an optional `physicalTenantId` query parameter, which narrows the same cluster-admin call to one tenant. Omit it to target every Physical Tenant.

A cluster-wide request fans out to each tenant and reports the outcome per tenant, so a partial result is visible rather than hidden. Because each tenant reaches its terminal state independently, a cluster-wide backup is a set of per-tenant backups rather than a single coordinated snapshot.

#### Backup IDs across Physical Tenants

A backup ID is unique within a Physical Tenant. Reusing an existing ID for the same tenant is rejected with `409`, while the same ID can be used by a different tenant, because each tenant has its own backup namespace.

When a tenant has scheduled or continuous backups enabled, backup IDs are generated and an explicit ID is rejected. Because backup configuration is per tenant, tenants in the same cluster can be in different modes. A cluster-wide request with an explicit ID fails if any tenant generates its own IDs, and a request without an explicit ID fails if any tenant requires one. Use the tenant-scoped endpoints for mixed configurations.

#### Storage backends and Physical Tenants

- **Elasticsearch and OpenSearch**: history backup endpoints are available. Each Physical Tenant requires its own snapshot repository, so tenants never share a snapshot namespace.
- **Relational databases (RDBMS)**: history backup endpoints are not served. Back up each tenant's schema, database, or table prefix with the database's own tooling.
- **Document stores**: back up each tenant's bucket, container, or path with the storage system's own tooling. The Orchestration Cluster exposes no backup API for document stores.

Configure non-overlapping backup locations before starting the cluster. Camunda validates the resolved location per tenant at startup and fails to start if two tenants resolve to the same one. For the isolation rules and configuration examples, see [storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore
