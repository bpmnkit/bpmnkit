# Dual-region setup (ECS Fargate) — Operations

### Backup and restore

The general [backup and restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) applies, with two dual-region specifics to keep in mind:

- **Backups are per region.** Each orchestration cluster writes to its local S3 backup bucket via `CAMUNDA_DATA_BACKUP_S3_BUCKETNAME`. The infra layer exposes both bucket names as outputs: `backup_bucket_region_0_name` and `backup_bucket_region_1_name`. Trigger backups against either region's API; ensure your backup tooling reads the correct bucket for that region.
- **Restore is not exposed by the dual-region app layer.** The underlying orchestration-cluster module supports an init-container restore (`restore_enabled`, `restore_backup_id` — see [restore options when using RDBMS](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application#restore-options)), but these variables are not surfaced in `terraform/app/camunda.tf` in this reference. Enabling restore for a dual-region deployment requires customizing the app layer to pass the restore variables to both regional module invocations and to coordinate broker IDs that span both regions. Treat dual-region restore as an advanced scenario; validate it against your specific topology before relying on it.

**Note**
Camunda recommends restoring to a fresh cluster rather than reusing an existing one. A newly created cluster has empty S3 backup buckets and EFS volumes, so no additional cleanup is needed. If you restore into an existing cluster, manually empty the S3 bucket configured for the node ID provider and fully clear the EFS volumes in both regions before starting the restore.

### Failover and failback

The reference repository ships helper scripts under `aws/containers/ecs-dual-region-fargate/procedure/`:

```bash
# Planned switchover to region 1
./procedure/failover.sh

# Unplanned promote-detach to region 1
./procedure/failover.sh --unplanned

# Failback to region 0
./procedure/failback.sh

# Failback and also switch the Aurora writer back to region 0
./procedure/failback.sh --switch-writer
```

Read the scripts in the reference repository for the exact actions and prerequisites. Failover is manual — no automated health-check-driven promotion is included.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
