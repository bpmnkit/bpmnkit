# Restore a cluster from backup — Restore in Hub

1. In Camunda Hub, in the left navigation under **Clusters**, select your cluster.
2. Click the **Backups** tab.
3. In the backup list, find the backup you want to restore.
4. Click **Restore** on that backup row.
5. In the confirmation modal, verify:
   - Backup name
   - Backup completion date
   - Backup version
6. If the backup version differs from the current cluster version, review the warning and select the acknowledgment checkbox.
7. Click **Restore** to start.

After confirmation, cluster status changes to **Restoring** and the cluster is unavailable until completion.

<!-- TODO(restore-from-backup): Add screenshots for Backups table row action, restore confirmation modal, version-mismatch warning, and restoring status. Capture from staging once the final UI is available. -->

---
Source: https://docs.camunda.io/docs/next/components/saas/how-to-restore
