# Dual-region setup (ECS Fargate) — Operations

### Backup and restore

The general [backup and restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) applies, with two dual-region specifics to keep in mind:

- **Backups share one bucket.** The infra layer creates a single S3 backup bucket in region 0, exposed as the `backup_bucket_region_0_name` output. Both orchestration clusters write to it through `CAMUNDA_DATA_BACKUP_S3_BUCKETNAME`, and region 1 brokers set `CAMUNDA_DATA_BACKUP_S3_REGION` to region 0 so they reach the bucket cross-region. All backup data stays in one place, whichever region you trigger the backup from. If you lose region 0, you lose access to the backup bucket until the region recovers, so plan S3 replication yourself if you need the backups in both regions.
- **Restore is not exposed by the dual-region app layer.** The underlying orchestration-cluster module supports an init-container restore (`restore_enabled`, `restore_backup_id` — see [restore options when using RDBMS](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application#restore-options)), but these variables are not surfaced in `terraform/app/camunda.tf` in this reference. Enabling restore for a dual-region deployment requires customizing the app layer to pass the restore variables to both regional module invocations and to coordinate broker IDs that span both regions. Treat dual-region restore as an advanced scenario; validate it against your specific topology before relying on it.

**Note**
Camunda recommends restoring to a fresh cluster rather than reusing an existing one. A newly created cluster has empty S3 backup buckets and EFS volumes, so no additional cleanup is needed. If you restore into an existing cluster, manually empty the S3 bucket configured for the node ID provider and fully clear the EFS volumes in both regions before starting the restore.

### Failover and failback

To recover from a region loss, follow the [ECS dual-region operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops). It fails over and back with the `failover.sh` and `failback.sh` scripts from the reference repository.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
