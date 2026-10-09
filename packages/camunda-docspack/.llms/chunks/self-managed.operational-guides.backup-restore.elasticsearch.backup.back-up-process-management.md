# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — management

This step uses the [management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api.md?exporting=softPause#exporting-api).

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/exporting/pause?soft=true"
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

            

         

      

   

#### Behavior during a Zeebe hot backup

During a hot backup, the Zeebe cluster remains fully operational:

- Zeebe continues to accept new client requests (for example, starting process instances) and to process existing workflow instances.
- Job workers and other external workers continue to receive and complete jobs.
- Exporters continue to export records. While soft pause is active, Zeebe temporarily does not advance the exporter position, which prevents log compaction and increases broker disk usage for the duration of the backup window. Ensure broker disks have enough free space. Keep the backup window as short as possible and resume exporting promptly once the backup completes.
- If a broker restarts while soft pause is active, some already-exported records may be exported again after the restart. This is expected, because exporting always resumes from the last acknowledged exporter position. The same behavior applies after a restore: exporters start from the last persisted position and re-export all records processed during the soft-pause window. This is the intended mechanism that bridges the Zeebe backup and the secondary storage (Elasticsearch/OpenSearch) backup.

The runtime backup step below then creates a consistent backup of each partition while processing continues. The “wait for backup to complete” steps in this guide only poll backup status and do not introduce any additional pause in processing beyond the initial soft export pause.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
