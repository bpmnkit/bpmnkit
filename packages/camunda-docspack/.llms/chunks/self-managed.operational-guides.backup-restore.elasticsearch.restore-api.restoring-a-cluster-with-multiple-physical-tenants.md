# Restore a backup with the Restore API — Restoring a cluster with multiple Physical Tenants

Self-Managed only

For multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), tenant-scoped Restore API calls target the Physical Tenant associated with the caller's credentials. To restore another tenant or all tenants, use the cluster-wide endpoints with [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) access.

| Step          | Tenant-scoped (your own tenant)                                                                           | Cluster-wide (cluster admin)                                                                                                             |
| :------------ | :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Recovery mode | [`PATCH /v2/mode`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/change-cluster-mode.api) | [`PATCH /cluster/v2/mode`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/change-cluster-mode-as-cluster-admin.api)       |
| Trigger       | [`POST /v2/restore`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/restore.api)           | [`POST /cluster/v2/restore`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/restore-as-cluster-admin.api)                 |
| Track         | [`GET /v2/restore`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-restore-status.api) | No cluster-wide status endpoint exists. Check each tenant's own restore status, or confirm recovery through cluster-wide topology below. |
| Confirm       | [`GET /v2/topology`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api)      | [`GET /cluster/v2/topology`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-cluster-topology.api)                     |

Use a tenant-scoped restore when one Physical Tenant has corrupted or missing data and the other tenants should keep processing. Use a cluster-wide restore when several tenants need recovery, or when the whole cluster must be returned to a coordinated state.

The cluster-wide endpoints accept an optional `physicalTenantId` query parameter. Naming a tenant restores only that tenant; omitting the parameter restores every configured tenant. Each tenant must have its own non-overlapping backup location, and the same backup ID must refer to compatible snapshots for every tenant included in the restore.

```bash
export CLUSTER_ADMIN_API=http://localhost:8080/cluster/v2

curl -X POST "${CLUSTER_ADMIN_API}/restore" \
  -H 'Content-Type: application/json' \
  -d '{ "backupIds": [1748937221] }'
```

Before returning a restored tenant to normal traffic, confirm through tenant-scoped topology that its partitions are healthy, that the expected data is present, and that exporting has resumed.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
