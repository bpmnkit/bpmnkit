# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — 1. Soft pause exporting in Zeebe

This will continue exporting records, but not delete those records (log compaction) from Zeebe. This makes the backup a hot backup, as covered in the [why you should use backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#why-you-should-use-backup-and-restore). Pausing exporting is required before a backup for state consistency, to avoid log compaction removing data the backup still needs; neither API enforces this as a precondition of the backup call itself.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
