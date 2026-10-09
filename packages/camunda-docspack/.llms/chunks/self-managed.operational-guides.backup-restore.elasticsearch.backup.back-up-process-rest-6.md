# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — rest

[Resume exporting](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/resume-exporting.api). This requires the `EXPORTER:PAUSE` permission.

      ```bash
      curl -XPOST "$ORCHESTRATION_CLUSTER_API/exporting/resume"
      ```

      A `204` response indicates the resume was accepted.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
