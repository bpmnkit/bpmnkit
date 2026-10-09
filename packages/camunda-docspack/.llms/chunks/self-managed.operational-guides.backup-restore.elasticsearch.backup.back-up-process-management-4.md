# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — management

This step uses the [Zeebe management backup API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore).

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupRuntime" \
         -H "Content-Type: application/json" \
         -d "{\"backupId\": $BACKUP_ID}"
      ```

         
            Example output
            

            ```json
            {
               "message":"A backup with id 1748937221 has been scheduled. Use GET actuator/backupRuntime/1748937221 to monitor the status."
            }
            ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
