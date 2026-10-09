# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — elasticsearch

Using `?wait_for_completion=true` in the previous call, as outlined, ensures that the request only returns once the backup has completed. However, to double-check that the backup completed successfully, you can perform the following verification:

      The following uses the [Elasticsearch snapshot API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-snapshot-status-2) to get the snapshot status.

      ```bash
      curl "$ELASTIC_ENDPOINT/_snapshot/$ELASTIC_SNAPSHOT_REPOSITORY/camunda_zeebe_records_backup_$BACKUP_ID/_status"
      ```

      
         Example output
         

         ```
         {
            "snapshots":[
               {
                  "snapshot":"camunda_zeebe_records_backup_1748937221",
                  "repository":"camunda",
                  "uuid":"1p_HdzKeTZ-zY-SN1LJ9VQ",
                  "state":"SUCCESS",
                  "include_global_state":true,
                  "shards_stats":{
                     "initializing":0,
                     "started":0,
                     "finalizing":0,
                     "done":8,
                     "failed":0,
                     "total":8
                  },
                  "stats":{
                     "incremental":{
                        "file_count":0,
                        "size_in_bytes":0
                     },
                     "total":{
                        "file_count":8,
                        "size_in_bytes":0
                     },
                     "start_time_in_millis":1748937910633,
                     "time_in_millis":0
                  },
                  "indices":{
                     "zeebe-record_process_8.8.0_2025-06-03",
                     "zeebe-record_job_8.8.0_2025-06-03",
                     "zeebe-record_process-instance_8.8.0_2025-06-03",
                     "zeebe-record_deployment_8.8.0_2025-06-03"
                  }
               }
            ]
         }
         ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
