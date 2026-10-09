# Storage isolation — Operational considerations — Secondary storage failures during startup and runtime (3)

#### Troubleshoot startup and readiness failures

- **The node stays at startup.** Check the application logs for the Physical Tenant named in the schema-initialization messages. Verify the tenant's storage endpoint, credentials, network access, and schema permissions. For Elasticsearch or OpenSearch, also verify that the cluster is at least yellow when the startup health check is enabled.
- **Readiness is `DOWN`.** Inspect the `camunda_physical_tenant_secondary_storage_ready` gauge for each tenant. If every tenant reports `0`, no tenant can currently serve secondary-storage-dependent requests.
- **One tenant returns `503` while another works.** This is expected partial degradation. Check the tenant's state in the [`physicalTenantSchemaInitialization` contributor](#schema-initialization-health). For `RETRYING`, fix the affected tenant's storage problem and wait for its background initialization retry. No restart is required for a retryable failure.
- **An RDBMS tenant fails before schema initialization starts.** If the JDBC URL uses a wrapper or a non-standard format, Camunda might not be able to determine the database vendor without connecting to the database. Set `database-vendor-id` in the tenant's RDBMS configuration. See [RDBMS database configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration).
- **A tenant reports `FAILED` or `GAVE_UP`, or the logs report a terminal schema failure.** Fix the problem reported in the tenant's `error` detail or in the logs, then restart the node. These failures aren't retried, so the tenant stays degraded until the node restarts.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
