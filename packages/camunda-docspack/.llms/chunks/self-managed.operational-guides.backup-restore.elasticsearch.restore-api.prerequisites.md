# Restore a backup with the Restore API — Prerequisites

In addition to the [general restore prerequisites](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore#prerequisites), the Restore API requires the following:

| Prerequisite     | Description                                                                                                                                                                                                                    |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camunda version  | Camunda 8.10 or later, restored with the exact version the backup was created with.                                                                                                                                            |
| Backup store     | Every broker is configured with the same backup store that holds the Zeebe backup, and Elasticsearch/OpenSearch is configured with the same snapshot repository as the backup. See [prerequisites](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup#prerequisites). |
| Sizing           | Elasticsearch/OpenSearch should be sized the same or larger than the original cluster; a smaller cluster can prevent shards from being assigned and fail the restore.                                                          |
| Optimize stopped | Optimize must be stopped before you restore the Elasticsearch/OpenSearch snapshots in [step 3](#restore-es-snapshots-step); every other component keeps running in recovery mode.                                              |
| Partition count  | The partition count of the cluster matches the partition count of the backup. Brokers can be scaled between backup and restore as long as the partition count is unchanged.                                                    |
| API access       | Authenticated access to the Orchestration Cluster REST API. See [authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).                                                 |
| Authorizations   | If [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) are enabled, the caller needs the `RESTORE` permission on the `BACKUP` resource.                                                                    |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
