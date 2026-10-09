# Camunda backup creation (RDBMS) — Prerequisites

The following prerequisites are required before you can create a backup.

| Prerequisite                                    | Description                                                                                                                                                                                                                                                                         |
| :---------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configure Zeebe backup storage.                 | Configure the backup storage for Zeebe. This is required regardless of your secondary storage choice. See [Zeebe backup configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackup).                                         |
| Enable continuous backups                       | Enable continuous backups. See [Zeebe scheduler configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundadataprimary-storagebackup).                                                                                              |
| (Recommended) Configure Zeebe scheduled backup. | Configure Zeebe's internal primary storage backup scheduler. See [Zeebe scheduler configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundadataprimary-storagebackup).                                                            |
| Set up RDBMS backups.                           | You are responsible for backing up the RDBMS using your database vendor's native tools (for example, `pg_dump`, `mysqldump`, `RMAN`). Back up the **entire Camunda database**, including all component tables. Schedule RDBMS backups at a similar frequency to your Zeebe backups. |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
