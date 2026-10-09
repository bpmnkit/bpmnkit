# Restore a backup with the Restore Application — 1. Restore Elasticsearch/OpenSearch snapshots {#restore-es-snapshots-step} — opensearch

The following uses the [OpenSearch snapshot API](https://docs.opensearch.org/docs/latest/api-reference/snapshots/get-snapshot/) to list all registered snapshots in a repository.

      ```bash
      OPENSEARCH_ENDPOINT=http://localhost:9200       # Your OpenSearch endpoint
      OPENSEARCH_SNAPSHOT_REPOSITORY=camunda_backup   # Your defined snapshot repository on OpenSearch for Camunda backups

      # Get a list of all available snapshots
      curl $OPENSEARCH_ENDPOINT/_snapshot/$OPENSEARCH_SNAPSHOT_REPOSITORY/_all

      # Get a list of all available snapshots and use jq to parse just the names for easier readability
      curl $OPENSEARCH_ENDPOINT/_snapshot/$OPENSEARCH_SNAPSHOT_REPOSITORY/_all | jq -r '.snapshots[].snapshot'
      ```

      Ensure that all backups and parts exist for each component for your chosen backup ID.

      
      Example output

      ```bash
      camunda_optimize_1748937221_8.8.0_part_1_of_2
      camunda_optimize_1748937221_8.8.0_part_2_of_2
      camunda_webapps_1748937221_8.8.0_part_1_of_5
      camunda_webapps_1748937221_8.8.0_part_2_of_5
      camunda_webapps_1748937221_8.8.0_part_3_of_5
      camunda_webapps_1748937221_8.8.0_part_4_of_5
      camunda_webapps_1748937221_8.8.0_part_5_of_5
      camunda_zeebe_records_backup_1748937221
      ```

      

   

**Available backups of Zeebe partitions**

For the Zeebe partitions backup, you will need to check your configured backup store for available backup IDs, and correlate those to the available backups on Elasticsearch/OpenSearch.

Zeebe creates a folder for each Partition ID and subfolder in this with each backup ID.

**Warning**
Using the [Zeebe Management Backup API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#list-backups-api) is the recommended method for listing available backups, as it ensures the backups are complete and valid. Manually identifying backup IDs can result in restoring an incomplete backup, which will fail the restore process. If this occurs, you will need to choose a different backup ID and repeat the restore process for all components with the new backup ID, including the datastore, to avoid mismatched backup windows and potential data loss.

   Example output
   Example in the case of 3 partitions with two available backups:

```bash
#PartitionID folder
#   BackupID folder
1/
├── 1748937221
└── 1749130104
2/
├── 1748937221
└── 1749130104
3/
├── 1748937221
└── 1749130104
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
