# Camunda backup creation (RDBMS) — (Optional) Back up Camunda Hub data {#back-up-web-modeler-data}

If you are using Camunda Hub, you can also back up its data. Camunda Hub stores its data in a relational database, so you can use the same backup tools as for the RDBMS secondary storage.

See [backup and restore Camunda Hub data](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/modeler-backup-and-restore) for more details.


## Primary storage retention

Automatic retention for primary storage (Zeebe's) backups is available. This periodically deletes backups from the configured blob storage based on a preconfigured retention window. At least one backup is always retained to prevent potential data loss, even if it falls outside the configured retention window.. To configure backup retention settings, see [backup retention configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundadataprimary-storagebackupretention).

When retention deletes old backups, the affected [backup ranges](#backup-ranges) shrink accordingly, narrowing your available restore window. Ensure that your retention window is at least as long as the restore window you require. For example, if you need the ability to restore to any point in the last 7 days, set the retention window to at least `P7D`.

**Note**
Backups created outside or before the scheduler was activated are also susceptible to being deleted by the retention mechanism. This only affects the primary storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
