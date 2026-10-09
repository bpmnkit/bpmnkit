# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — rest

[Query the historic backup](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-history-backup.api). This requires the `BACKUP:READ` permission.

      ```bash
      curl -s "$ORCHESTRATION_CLUSTER_API/backups/history/$BACKUP_ID"
      ```

      Wait until `state` is `COMPLETED`:

      ```bash
      while [[ "$(curl -s "$ORCHESTRATION_CLUSTER_API/backups/history/$BACKUP_ID" | jq -r .state)" != "COMPLETED" ]]; do echo "Waiting..."; sleep 5; done; echo "Finished backup with ID $BACKUP_ID"
      ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
