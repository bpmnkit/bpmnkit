# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — management

This step uses the [management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api).

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/exporting/resume"
      ```

**Warning**
      This endpoint always returns HTTP `200`. Check the `status` field in the response body to determine whether the operation succeeded: `204` indicates success and `500` indicates failure.

      If the request fails, verify that all brokers are running and retry.

         
            Example output
            

            ```json
            {
               "body":null,
               "status":204,
               "contentType":null
            }
            ```

            
         

      

   

**Warning**
If any of the steps above fail, you might have to restart with a new backup ID. Ensure Zeebe exporting is resumed if the backup process force quits in the middle of the process.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
