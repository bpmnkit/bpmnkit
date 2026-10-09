# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — elasticsearch

The following uses the [Elasticsearch snapshot API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-snapshot-create) to create a snapshot.

      ```bash
      curl -XPUT "$ELASTIC_ENDPOINT/_snapshot/$ELASTIC_SNAPSHOT_REPOSITORY/camunda_zeebe_records_backup_$BACKUP_ID?wait_for_completion=true" \
      -H 'Content-Type: application/json' \
      -d '{
            "indices": "zeebe-record*",
            "feature_states": ["none"]
            }'
      ```

      
         Example output
         

         ```json
         {
            "snapshot":{
               "snapshot":"camunda_zeebe_records_backup_1748937221",
               "uuid":"1p_HdzKeTZ-zY-SN1LJ9VQ",
               "repository":"camunda",
               "version_id":8521000,
               "version":"8.18.0",
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
               "start_time":"2025-06-03T08:05:10.633Z",
               "start_time_in_millis":1748937910633,
               "end_time":"2025-06-03T08:05:11.336Z",
               "end_time_in_millis":1748937911336,
               "duration_in_millis":603,
               "failures":[

               ],
               "shards":{
                  "total":8,
                  "failed":0,
                  "successful":8
               },
               "feature_states":[

               ]
            }
         }
         ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
