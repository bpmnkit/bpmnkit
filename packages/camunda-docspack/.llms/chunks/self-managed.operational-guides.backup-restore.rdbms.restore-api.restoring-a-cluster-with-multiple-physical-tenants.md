# Restore a backup with the Restore API (RDBMS) — Restoring a cluster with multiple Physical Tenants

Self-Managed only

In a cluster running multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), the `/v2/mode` and `/v2/restore` endpoints used above are scoped to whichever Physical Tenant your credentials belong to. There is no way to target a different tenant from these self-service endpoints, because the tenant is resolved from the caller's identity, not from the request path.

To restore a specific tenant other than your own, or every tenant at once, use the cluster-wide endpoints under `/cluster/v2/...`. These require [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) access instead of an Orchestration Cluster user's credentials:

| Step          | Tenant-scoped (your own tenant)                                                                           | Cluster-wide (cluster admin)                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Recovery mode | [`PATCH /v2/mode`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/change-cluster-mode.api) | [`PATCH /cluster/v2/mode`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/change-cluster-mode-as-cluster-admin.api)       |
| Trigger       | [`POST /v2/restore`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/restore.api)           | [`POST /cluster/v2/restore`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/restore-as-cluster-admin.api)                 |
| Track         | [`GET /v2/restore`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-restore-status.api) | No cluster-wide status endpoint exists. Check each tenant's own restore status, or confirm recovery through cluster-wide topology below. |
| Confirm       | [`GET /v2/topology`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api)      | [`GET /cluster/v2/topology`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-cluster-topology.api)                     |

### Choosing the Restore API scope

Use a tenant-scoped restore when one Physical Tenant has corrupted or missing data and the other tenants should keep processing. Use a cluster-wide restore when several tenants need recovery, or when the whole cluster must be returned to a coordinated state.

The cluster-wide endpoints accept an optional `physicalTenantId` query parameter. Naming a tenant restores only that tenant; omitting the parameter restores every configured tenant.

```bash
export CLUSTER_ADMIN_API=http://localhost:8080/cluster/v2

curl -X POST "${CLUSTER_ADMIN_API}/restore" \
  -H 'Content-Type: application/json' \
  -d '{ "backupIds": [1748937221] }'
```

To restore tenants from different backups in a single request, supply per-tenant restore arguments in the `overrides` field of the request body. A request that both names a single tenant and supplies overrides is rejected, because the two express conflicting targets.

### Cross-tenant safety

A backup created for one Physical Tenant is not reachable from another tenant's restore. This is enforced by configuration rather than by a runtime check: every Physical Tenant must resolve to a distinct backup store location, and Camunda fails startup if two tenants resolve to the same one. See [storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation).

Before returning a restored tenant to normal traffic, confirm through tenant-scoped topology that its partitions are healthy, that the expected process definitions, instances, variables, and history are present, and that exporting has resumed.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
