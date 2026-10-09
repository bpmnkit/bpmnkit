# Helm chart dual-region operational procedure — Procedure — OpenShift (2)

7. Restore Elasticsearch backup in the new region namespace `CAMUNDA_NAMESPACE_RECREATED`. Depending on the amount of data, this operation may take a while to complete.

   ```bash
   kubectl --context $CLUSTER_RECREATED exec -n $CAMUNDA_NAMESPACE_RECREATED -it $ELASTIC_POD -c elasticsearch -- \
    curl -u "elastic:$ES_PASSWORD" -XPOST 'http://localhost:9200/_snapshot/camunda_backup/failback/_restore?wait_for_completion=true' \
    -H 'Content-Type: application/json' \
    -d '{"include_global_state": true}'
   ```

8. Verify that the restore has been completed successfully in the new region:

   ```bash
   kubectl --context $CLUSTER_RECREATED exec -n $CAMUNDA_NAMESPACE_RECREATED -it $ELASTIC_POD -c elasticsearch -- curl -u "elastic:$ES_PASSWORD" -XGET 'http://localhost:9200/_snapshot/camunda_backup/failback/_status'
   ```

   
   Example output
   

   **This is only an example, and the values will differ for you.** Ensure you see `state: "SUCCESS"`, and that the properties `done` and `total` have equal values.

   ```json
   {
   "snapshots": [
      {
         "snapshot": "failback",
         "repository": "camunda_backup",
         "uuid": "1S_C05K0RjqFyWMfjSKI_A",
         "state": "SUCCESS",
         "include_global_state": true,
         "shards_stats": {
         "initializing": 0,
         "started": 0,
         "finalizing": 0,
         "done": 33,
         "failed": 0,
         "total": 33
         },
         "stats": {
         "incremental": {
            "file_count": 145,
            "size_in_bytes": 353953
         },
         "total": {
            "file_count": 145,
            "size_in_bytes": 353953
         },
         "start_time_in_millis": 1712058365525,
         "time_in_millis": 1005
         },
         "indices": {
         ...
         }
      }
   ]
   }
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
