# Set up two isolated Physical Tenants — Day-2 operations

These operations are documented in full elsewhere. This section only covers the tenant-specific part of each.

**Scale `riskprod`'s partitions independently of `default`:**

```bash
curl -X PATCH "https://your-cluster/actuator/cluster?physicalTenant=riskprod" \
  -d '{"partitions": {"count": 6}}'
```

Only `riskprod`'s partition group changes. See [scale a cluster with multiple Physical Tenants](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling#scale-a-cluster-with-multiple-physical-tenants) for broker count, replication factor, and the other scaling dimensions.

**Back up `riskprod` specifically:** call the tenant-scoped endpoint rather than the cluster-wide one, `POST /physical-tenants/riskprod/v2/backups/history`, using a role granted both `BACKUP:CREATE` and `EXPORTER:PAUSE` (exporting must pause for the duration of a history backup). See [back up a cluster with multiple Physical Tenants](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#back-up-a-cluster-with-multiple-physical-tenants) for the full endpoint reference and required permissions.

**Restore `riskprod` without affecting `default`:** the recovery-mode and restore endpoints target one tenant at a time by default. Prefix them with `/physical-tenants/riskprod`. See [restore a cluster with multiple Physical Tenants](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#multiple-physical-tenants) for the full procedure. This is destructive to the targeted tenant's data. Follow that guide directly rather than improvising from this summary.

**Add a third tenant:** add its configuration block (following the same shape as `riskprod` above) and apply with a rolling restart. It's provisioned automatically, with no separate creation step. Removing a tenant from configuration disables it and retains its data; re-adding it later re-enables the tenant with that same data intact. There's no permanent-delete operation in this release. An actuator endpoint can logically remove an already-disabled tenant from the cluster topology (useful so a disabled tenant doesn't block operations like multi-region failover), but it deletes no data. See [disable, rename, and delete](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle#disable-rename-and-delete).

Before adding more tenants, check broker memory, database connections, and noisy-neighbor limits in [size clusters with Physical Tenants](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants).

Once you're validating a third tenant's rollout, check its topology alongside the cluster's overall status: `GET /physical-tenants/<id>/v2/topology` for the tenant, `GET /cluster/v2/topology` for the whole cluster (requires [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) access).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
