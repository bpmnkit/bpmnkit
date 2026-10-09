# Restore a backup with the Restore Application — 1. Restore Elasticsearch/OpenSearch snapshots {#restore-es-snapshots-step} — elasticsearch

The following uses the [Elasticsearch snapshot API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-snapshot-get) to list all registered snapshots in a repository.

      ```bash
      ELASTIC_ENDPOINT=http://localhost:9200       # Your Elasticsearch endpoint
      ELASTIC_SNAPSHOT_REPOSITORY=camunda_backup   # Your defined snapshot repository on Elasticsearch for Camunda backups

      # Get a list of all available snapshots
      curl $ELASTIC_ENDPOINT/_snapshot/$ELASTIC_SNAPSHOT_REPOSITORY/_all

      # Get a list of all available snapshots and use jq to parse just the names for easier readability
      curl $ELASTIC_ENDPOINT/_snapshot/$ELASTIC_SNAPSHOT_REPOSITORY/_all | jq -r '.snapshots[].snapshot'
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

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
