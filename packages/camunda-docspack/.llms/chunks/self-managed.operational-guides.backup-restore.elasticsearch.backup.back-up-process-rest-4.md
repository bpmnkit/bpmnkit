# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — rest

[Take a runtime backup](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-runtime-backup.api). This requires the `BACKUP:CREATE` permission.

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_API/backups/runtime" \
         -H "Content-Type: application/json" \
         -d "{\"backupId\": $BACKUP_ID}"
      ```

         
            Example output
            

            ```json
            {
               "backupId": 1748937221
            }
            ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
