# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — management

This step uses the [Zeebe management backup API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore).

      ```bash
      curl "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupRuntime/$BACKUP_ID"
      ```

         
            Example output
            

            ```json
            {
               "backupId":1748937221,
               "state":"COMPLETED",
               "details":[
                  {
                     "partitionId":1,
                     "state":"COMPLETED",
                     "createdAt":"2025-06-03T08:06:06.246997293Z",
                     "lastUpdatedAt":"2025-06-03T08:06:10.408893628Z",
                     "checkpointPosition":1,
                     "brokerVersion":"8.8.0"
                  }
               ]
            }
            ```

            
         

      Alternatively as a one-line to wait until the state is `COMPLETED` using a while loop and jq to parse the response JSON.

      ```bash
      while [[ "$(curl -s "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupRuntime/$BACKUP_ID" | jq -r .state)" != "COMPLETED" ]]; do echo "Waiting..."; sleep 5; done; echo "Finished backup with ID $BACKUP_ID"
      ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
