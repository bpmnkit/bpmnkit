# Restore a backup with the Restore API (RDBMS) — Prerequisites

The Restore API requires the following:

| Prerequisite     | Description                                                                                                                                                                                                                                                            |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camunda version  | Camunda 8.10 or later, restored with the exact version the backup was created with.                                                                                                                                                                                    |
| Backup store     | Every broker is configured with the same backup store that holds the backup, as described in the [RDBMS backup prerequisites](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup#prerequisites).                                                                                                              |
| Completed backup | A completed backup exists for every partition. List the available backups with [list runtime backups](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/list-runtime-backups.api).                                                                         |
| Partition count  | The partition count of the cluster matches the partition count of the backup. Brokers can be scaled between backup and restore as long as the partition count is unchanged. See [restoring a backup with fewer partitions](#restoring-a-backup-with-fewer-partitions). |
| API access       | Authenticated access to the Orchestration Cluster REST API. See [authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).                                                                                         |
| Authorizations   | If [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) are enabled, the caller needs the `RESTORE` permission on the `BACKUP` resource.                                                                                                            |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
