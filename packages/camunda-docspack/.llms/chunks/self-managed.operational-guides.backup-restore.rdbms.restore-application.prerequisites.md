# Restore a backup with the Restore Application (RDBMS) — Prerequisites

The following prerequisites are required before you can restore a backup:

| Prerequisite     | Description                                                                                                                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camunda version  | Backups can be restored using the same Camunda version they were created with, or up to one minor version newer. For example, a backup taken with 8.9.x can be restored with 8.9.x or 8.10.x. |
| Backup available | At least one Zeebe primary storage backup is available in the configured blob store. See [Create a backup](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup).                                                                      |
| Backup storage   | Zeebe is configured with the same backup storage as outlined in the [prerequisites](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup#prerequisites).                                                                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
