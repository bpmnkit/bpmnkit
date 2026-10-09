# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — management

This step uses the [web applications management backup API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup).

      ```bash
      curl -s "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupHistory/$BACKUP_ID"
      ```

         
            Example output
            

            ```json
            {
               "backupId":1748937221,
               "state":"COMPLETED",
               "failureReason":null,
               "details":[
                  {
                     "snapshotName":"camunda_webapps_1748937221_8.8.0_part_1_of_5",
                     "state":"SUCCESS",
                     "startTime":"2025-06-03T07:55:15.685+0000",
                     "failures":[

                     ]
                  },
                  {
                     "snapshotName":"camunda_webapps_1748937221_8.8.0_part_2_of_5",
                     "state":"SUCCESS",
                     "startTime":"2025-06-03T07:55:16.288+0000",
                     "failures":[

                     ]
                  },
                  {
                     "snapshotName":"camunda_webapps_1748937221_8.8.0_part_3_of_5",
                     "state":"SUCCESS",
                     "startTime":"2025-06-03T07:55:17.092+0000",
                     "failures":[

                     ]
                  },
                  {
                     "snapshotName":"camunda_webapps_1748937221_8.8.0_part_4_of_5",
                     "state":"SUCCESS",
                     "startTime":"2025-06-03T07:55:17.293+0000",
                     "failures":[

                     ]
                  },
                  {
                     "snapshotName":"camunda_webapps_1748937221_8.8.0_part_5_of_5",
                     "state":"SUCCESS",
                     "startTime":"2025-06-03T07:55:18.298+0000",
                     "failures":[

                     ]
                  }
               ]
            }
            ```

            

         

      Alternatively as a one-line to wait until the state is `COMPLETED` using a while loop and jq to parse the response JSON.

      ```bash
      while [[ "$(curl -s "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/backupHistory/$BACKUP_ID" | jq -r .state)" != "COMPLETED" ]]; do echo "Waiting..."; sleep 5; done; echo "Finished backup with ID $BACKUP_ID"
      ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
