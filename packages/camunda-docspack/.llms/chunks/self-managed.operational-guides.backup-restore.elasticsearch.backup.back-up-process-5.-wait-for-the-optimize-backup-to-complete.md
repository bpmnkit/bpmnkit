# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — 5. Wait for the Optimize backup to complete

This step uses the [Optimize management backup API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup).

```bash
curl -s "$OPTIMIZE_MANAGEMENT_API/actuator/backups/$BACKUP_ID"
```

   
      Example output
      

      ```json
      {
         "backupId":1748937221,
         "failureReason":null,
         "state":"COMPLETED",
         "details":[
            {
               "snapshotName":"camunda_optimize_1748937221_8.8.0_part_1_of_2",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:53:54.389+0000",
               "failures":[

               ]
            },
            {
               "snapshotName":"camunda_optimize_1748937221_8.8.0_part_2_of_2",
               "state":"SUCCESS",
               "startTime":"2025-06-03T07:53:54.389+0000",
               "failures":[

               ]
            }
         ]
      }
      ```

      

   

Alternatively as a one-line to wait until the state is `COMPLETED` using a while loop and jq to parse the response JSON.

```bash
while [[ "$(curl -s "$OPTIMIZE_MANAGEMENT_API/actuator/backups/$BACKUP_ID" | jq -r .state)" != "COMPLETED" ]]; do echo "Waiting..."; sleep 5; done; echo "Finished backup with ID $BACKUP_ID"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
