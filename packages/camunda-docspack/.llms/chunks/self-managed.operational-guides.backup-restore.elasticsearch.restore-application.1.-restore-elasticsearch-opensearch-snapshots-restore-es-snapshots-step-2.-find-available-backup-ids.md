# Restore a backup with the Restore Application — 1. Restore Elasticsearch/OpenSearch snapshots {#restore-es-snapshots-step} — 2. Find available backup IDs

With the active environment that was required to restore the datastore templates you can quickly work out available backups, using the backup APIs for each component to list available backups.

**Note**
You will need the output for your chosen backup ID in the following steps to be able to restore datastore snapshots as it contains the snapshot names.

   
      Web Applications Example

      Using the [Web Applications management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup#get-backups-list-api) to list backups.

      You must have the Elasticsearch / OpenSearch backup repository configured to be able to retrieve backups.

      ```bash
      curl $ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupHistory
      ```

      ```json
      [
      {
         "backupId": 1748937221,
         "state": "COMPLETED",
         "details": [
            {
               "snapshotName":"camunda_webapps_1748937221_8.8.0_part_1_of_5",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:55:15.685+0000",
               "failures":[]
            },
            {
               "snapshotName":"camunda_webapps_1748937221_8.8.0_part_2_of_5",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:55:16.288+0000",
               "failures":[]
            },
            {
               "snapshotName":"camunda_webapps_1748937221_8.8.0_part_3_of_5",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:55:17.092+0000",
               "failures":[]
            },
            {
               "snapshotName":"camunda_webapps_1748937221_8.8.0_part_4_of_5",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:55:17.293+0000",
               "failures":[]
            },
            {
               "snapshotName":"camunda_webapps_1748937221_8.8.0_part_5_of_5",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:55:18.298+0000",
               "failures":[]
            }
         ]
      }
      ]
      ```

   

   
      Optimize Example

      Using the [Optimize management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup#get-backup-info-api) to list backups.

      You must have the Elasticsearch / OpenSearch backup repository configured to be able to retrieve backups.

      ```bash
      curl $OPTIMIZE_MANAGEMENT_API/actuator/backups
      ```

      ```json
      [
      {
         "backupId": 1748937221,
         "state": "COMPLETED",
         "details": [
            {
               "snapshotName":"camunda_optimize_1748937221_8.8.0_part_1_of_2",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:53:54.389+0000",
               "failures":[]
            },
            {
               "snapshotName":"camunda_optimize_1748937221_8.8.0_part_2_of_2",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:53:54.389+0000",
               "failures":[]
            }
         ]
      }
      ]
      ```

   

   
      Zeebe Example

      Using the [Zeebe management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#list-backups-api) to list backups.

      ```bash
      curl $ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupRuntime
      ```

      ```json
      [
      {
         "backupId": 1748937221,
         "state": "COMPLETED",
         "details": [
            {
            "partitionId": 1,
            "state": "COMPLETED",
            "createdAt": "2025-06-03T08:06:10.408893628Z",
            "brokerVersion": "8.8.0"
            },
            {
            "partitionId": 2,
            "state": "COMPLETED",
            "createdAt": "2025-06-03T08:06:10.408893628Z",
            "brokerVersion": "8.8.0"
            },
            {
            "partitionId": 3,
            "state": "COMPLETED",
            "createdAt": "2025-06-03T08:06:10.408893628Z",
            "brokerVersion": "8.8.0"
            }
         ]
      }
      ]
      ```

   

As there may be cases where this is not possible, an alternative approach is covered in the following example.

**Available backups on Elasticsearch/OpenSearch**

In this scenario, follow the steps above, but when you have your Elasticsearch/OpenSearch available, use the snapshot API to list available snapshots and correlate this to the available snapshots in your backup bucket (AWS S3, Azure Store, Google GCS). It is important to use the same ID for all backups.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
