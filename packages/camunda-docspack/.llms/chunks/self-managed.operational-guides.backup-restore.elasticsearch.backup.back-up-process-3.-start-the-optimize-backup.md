# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — 3. Start the Optimize backup

Optimize is not covered by the Orchestration Cluster backup REST API. The [Optimize management backup API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup) must be used, regardless of which API you use for the other steps.

```bash
curl -XPOST "$OPTIMIZE_MANAGEMENT_API/actuator/backups" \
   -H "Content-Type: application/json" \
   -d "{\"backupId\": $BACKUP_ID}"
```

   
      Example output
      

      ```json
      {
         "message":"Backup creation for ID 1748937221 has been scheduled. Use the GET API to monitor completion of backup process"
      }
      ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
