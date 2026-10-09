# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — rest

[Pause exporting](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/pause-exporting.api). This requires the `EXPORTER:PAUSE` permission.

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_API/exporting/pause?soft=true"
      ```

      A `204` response indicates the pause was accepted.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
