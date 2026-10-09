# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — 6. Create a backup of the exported Zeebe indices in Elasticsearch/OpenSearch

You can create this backup using the respective Snapshots API.

By default, the old Elasticsearch or OpenSearch exporter creates indices with the prefix `zeebe-record`. If you configured a different prefix in the exporter, use that prefix instead.

This remains relevant if you run Optimize, which still relies on the former exporters.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
