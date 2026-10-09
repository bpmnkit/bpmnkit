# Storage isolation — Operational considerations — Secondary storage failures during startup and runtime

Camunda initializes the secondary-storage schema for each Physical Tenant independently. A tenant becomes ready only after its schema initialization succeeds. If one tenant cannot initialize, Camunda marks only that tenant as degraded and keeps other tenants independent.

#### Startup behavior

For multi-tenant initialization, Camunda starts one schema-initialization task per tenant. Retryable failures, such as temporary connectivity problems, are retried according to the schema manager retry settings. With the default settings, schema initialization continues retrying until it succeeds.

On a node with multiple Physical Tenants, startup uses the following rules:

| Node and storage type                               | Startup behavior                                                                                                                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elasticsearch or OpenSearch with an HTTP gateway    | Startup waits until every tenant has produced an initial result. If at least one tenant is serviceable, the node starts serving traffic. A tenant that failed keeps retrying in the background. |
| Elasticsearch or OpenSearch without an HTTP gateway | The node does not wait for schema initialization. It starts while each tenant retries in the background.                                                                                        |
| RDBMS, with or without an HTTP gateway              | Every node waits until at least one tenant is serviceable or no tenant can make further progress. One tenant's failure does not abort the node when another tenant is serviceable.              |

On nodes that wait at startup, Camunda retries temporary failures before allowing traffic. If every tenant has a failure that retrying cannot fix, startup aborts and the node exits with a non-zero status.

An RDBMS node with exactly one Physical Tenant keeps the existing synchronous, fail-fast behavior. An unreachable database or an unrepairable schema failure aborts startup instead of being retried in the background.

If you configure a finite retry limit and all attempts stop before any tenant becomes ready, startup can complete but the affected tenant remains degraded. On nodes whose readiness probe includes secondary storage, the node remains not ready. The application logs identify the tenant and report that its retry limit was exhausted.

#### Readiness and health

Readiness and health answer different questions:

| Endpoint or signal                                | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/actuator/health/readiness`                      | Node-level readiness. For Elasticsearch and OpenSearch deployments, the secondary-storage readiness contributor uses schema-initialization state and is `UP` when at least one Physical Tenant is ready and `DOWN` when no tenant is ready. The overall readiness group can still be `DOWN` because of other readiness contributors. In the current implementation, a degraded `default` tenant can also keep node readiness `DOWN` even when another tenant is ready; this known limitation is tracked in [camunda/camunda#63674](https://github.com/camunda/camunda/issues/63674). It does not mean that every tenant is healthy. |
| `/actuator/health`                                | Full node health, including live secondary-storage checks. On multi-tenant nodes, inspect the per-tenant `rdbmsStatus` or `searchEngineStatus` contributors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `camunda_physical_tenant_secondary_storage_ready` | Prometheus gauge with `physicalTenant` labels. A value of `1` means that the tenant's schema is initialized; `0` means that the tenant is degraded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
