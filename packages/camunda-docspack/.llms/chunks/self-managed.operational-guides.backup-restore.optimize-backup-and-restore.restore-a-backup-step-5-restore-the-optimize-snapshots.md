# Back up and restore Optimize independently — Restore a backup — Step 5: Restore the Optimize snapshots

Although backup creation order matters for consistency, you can restore the backed-up Optimize snapshots in any order.

Optimize does not provide an API endpoint to restore these backups. Restore them directly in your Elasticsearch or OpenSearch datastore.

Based on your chosen backup ID in [find available backup IDs](#step-2-find-available-backup-ids), you can now restore the snapshots in Elasticsearch/OpenSearch for each available backup under the same backup ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
