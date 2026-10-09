# Restore a cluster from backup — Monitor restore progress

During restore:

- Cluster status shows **Restoring**.
- Component cards show **Restoring**.
- Restore-conflicting actions are disabled.
- Backups tab shows active restore context.

Phase-level progress is not shown in Hub in this release.


## Confirm outcome

On success:

- Cluster status returns to **Healthy**.
- A success notification confirms which backup was restored.
- You can validate behavior in Operate and other cluster applications.

On failure:

- Cluster data remains unchanged.
- Cluster status returns to prior healthy/available state.
- Error notification is shown on the Backups tab until dismissed.

For failure handling, see [Restore troubleshooting](https://docs.camunda.io/docs/next/components/saas/restore-troubleshooting).

---
Source: https://docs.camunda.io/docs/next/components/saas/how-to-restore
