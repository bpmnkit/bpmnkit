# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — management

This step uses the [web applications management backup API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup).

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupHistory" \
         -H "Content-Type: application/json" \
         -d "{\"backupId\": $BACKUP_ID}"
      ```

         
            Example output
            

            ```json

            {
               "scheduledSnapshots":[
                  "camunda_webapps_1748937221_8.8.0_part_1_of_5",
                  "camunda_webapps_1748937221_8.8.0_part_2_of_5",
                  "camunda_webapps_1748937221_8.8.0_part_3_of_5",
                  "camunda_webapps_1748937221_8.8.0_part_4_of_5",
                  "camunda_webapps_1748937221_8.8.0_part_5_of_5"
               ]
            }
            ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
