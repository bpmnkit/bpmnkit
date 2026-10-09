# Storage isolation — Operational considerations — Secondary storage failures during startup and runtime (2)

The secondary-storage readiness signal is based on schema initialization and does not continuously probe storage connectivity. As a result, a storage outage after startup does not automatically make a ready node fail its readiness probe. The full health endpoint, logs, and operation-specific errors provide the live storage status. The full `/actuator/health` result can be `DOWN` for one failed tenant even when `/actuator/health/readiness` remains `UP` because another tenant is serviceable.

When a tenant is degraded because its schema has not initialized, REST query API requests, that require secondary storage for that tenant, return `HTTP 503 Service Unavailable` and a `Retry-After: 5` header. Other tenants continue to be served. After the storage problem is fixed, a retryable failure recovers in the background without restarting the node.

#### Troubleshoot startup and readiness failures

- **The node stays at startup.** Check the application logs for the Physical Tenant named in the schema-initialization messages. Verify the tenant's storage endpoint, credentials, network access, and schema permissions. For Elasticsearch or OpenSearch, also verify that the cluster is at least yellow when the startup health check is enabled.
- **Readiness is `DOWN`.** Inspect the `camunda_physical_tenant_secondary_storage_ready` gauge for each tenant. If every tenant reports `0`, no tenant can currently serve secondary-storage-dependent requests.
- **One tenant returns `503` while another works.** This is expected partial degradation. Fix the affected tenant's storage problem and wait for its background initialization retry. No restart is required for a retryable failure.
- **An RDBMS tenant fails before schema initialization starts.** If the JDBC URL uses a wrapper or a non-standard format, Camunda might not be able to determine the database vendor without connecting to the database. Set `database-vendor-id` in the tenant's RDBMS configuration. See [RDBMS database configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration).
- **The logs report a terminal schema failure.** Fix the reported schema or configuration problem, then restart the node. Terminal failures are not retried because retrying cannot repair them.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
