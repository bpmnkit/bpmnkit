# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — 2. Find available backup IDs {#find-available-backup-ids}

With the cluster in recovery mode, use the Orchestration Cluster REST API to list the available runtime and history backups for the current Physical Tenant. Both endpoints require the `BACKUP:READ` permission. Use the returned backup ID to select the matching Elasticsearch/OpenSearch snapshots and Zeebe primary storage backup.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
