# Storage isolation — Operational considerations — Backup and restore

- **Per-tenant**: Trigger runtime and history backups through the tenant-scoped endpoints. Back up RDBMS schemas and document stores with the storage system's tools.
- **Full cluster**: Back up all schemas, all index prefixes, all buckets simultaneously
- **Restore options**: Individual tenant or full cluster from backup

Example: back up Tenant A only.

```bash
# RDBMS
pg_dump -h db.example.com -U user tenant_a_schema > backup.sql

# Document store (S3)
aws s3 sync s3://camunda-documents/tenant-a/ ./backup/
```

For tenant-scoped and cluster-wide backup and restore endpoints, see [back up a cluster with multiple Physical Tenants](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#multiple-physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
