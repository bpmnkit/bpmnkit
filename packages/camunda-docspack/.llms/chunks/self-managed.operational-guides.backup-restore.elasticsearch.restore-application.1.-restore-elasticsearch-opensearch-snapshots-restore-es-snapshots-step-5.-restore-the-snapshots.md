# Restore a backup with the Restore Application — 1. Restore Elasticsearch/OpenSearch snapshots {#restore-es-snapshots-step} — 5. Restore the snapshots

Although the backup order was important so far to ensure consistent backups, you can restore the backed up indices in any order.

As the components do not have an endpoint to restore the backup in Elasticsearch, you will need to restore it yourself directly in your selected datastore.

Using your chosen backup ID from the previous step, restore the snapshots in Elasticsearch/OpenSearch for each available backup under the same backup ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
