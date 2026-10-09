# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — rest

[Take a history backup](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-history-backup.api). This requires the `BACKUP:CREATE` permission.

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_API/backups/history" \
         -H "Content-Type: application/json" \
         -d "{\"backupId\": $BACKUP_ID}"
      ```

         
            Example output
            

            ```json
            {
               "backupId": 1748937221,
               "scheduledSnapshots":[
                  "camunda_webapps_1_8.10.0_part_1_of_5",
                  "camunda_webapps_1_8.10.0_part_2_of_5",
                  "camunda_webapps_1_8.10.0_part_3_of_5",
                  "camunda_webapps_1_8.10.0_part_4_of_5",
                  "camunda_webapps_1_8.10.0_part_5_of_5"
               ]
            }
            ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
