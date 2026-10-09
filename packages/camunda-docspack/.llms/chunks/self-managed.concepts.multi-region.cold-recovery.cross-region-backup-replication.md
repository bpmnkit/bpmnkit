# Cold Recovery — Cross-region backup replication

Cross-region replication of the backup storage is the **necessary requirement** of Cold Recovery.

- If backups exist only in the primary region, there is no disaster recovery when that region is lost, as the backups are lost with it.
- As such, **replication is mandatory**, and not optional or just best practice. It is a prerequisite for Cold Recovery to work.

The primary backup bucket must replicate objects to a bucket in a **separate region** so that backup data remains accessible if the primary region becomes unavailable. For S3-compatible object storage, this is typically configured as continuous cross-region replication on the bucket itself. For RDBMS secondary storage, use the database's native cross-region backup replication instead of S3 bucket replication.

This means:

- The replica bucket lives in a different region from the primary cluster.
- Replication runs continuously and automatically - there is no manual copy step.
- Replication lag is monitored and bounded; an unreplicated backup is not yet a recoverable backup.
- The replica bucket's access policies allow restore from a freshly provisioned secondary-region environment that does not yet exist at backup time.

For provider-specific guidance, see [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery
