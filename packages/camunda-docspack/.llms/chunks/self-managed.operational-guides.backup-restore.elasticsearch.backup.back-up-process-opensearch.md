# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — opensearch

The following uses the [OpenSearch snapshot API](https://docs.opensearch.org/docs/latest/api-reference/snapshots/create-snapshot/) to create a snapshot.

      ```bash
      curl -XPUT "$OPENSEARCH_ENDPOINT/_snapshot/$OPENSEARCH_SNAPSHOT_REPOSITORY/camunda_zeebe_records_backup_$BACKUP_ID?wait_for_completion=true" \
      -H 'Content-Type: application/json' \
      -d '{
            "indices": "zeebe-record*"
            }'
      ```

      
         Example output
         

         ```json
         {
            "snapshot":{
               "snapshot":"camunda_zeebe_records_backup_1748937221",
               "uuid":"PUFbcSJZT1Cqc4jY8OE2uA",
               "version_id":136408027,
               "version":"2.19.2",
               "remote_store_index_shallow_copy":false,
               "indices":[
                  "zeebe-record_process_8.8.0_2025-06-03",
                  "zeebe-record_job_8.8.0_2025-06-03",
                  "zeebe-record_process-instance_8.8.0_2025-06-03",
                  "zeebe-record_deployment_8.8.0_2025-06-03"
               ],
               "data_streams":[

               ],
               "include_global_state":true,
               "state":"SUCCESS",
               "start_time":"2025-06-03T09:37:45.623Z",
               "start_time_in_millis":1748943465623,
               "end_time":"2025-06-03T09:37:46.342Z",
               "end_time_in_millis":1748943466342,
               "duration_in_millis":719,
               "failures":[

               ],
               "shards":{
                  "total":8,
                  "failed":0,
                  "successful":8
               }
            }
         }
         ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
