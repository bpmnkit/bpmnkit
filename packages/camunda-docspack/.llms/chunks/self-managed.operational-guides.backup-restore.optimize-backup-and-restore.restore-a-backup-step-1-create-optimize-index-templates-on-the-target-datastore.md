# Back up and restore Optimize independently — Restore a backup — Step 1: Create Optimize index templates on the target datastore

Optimize creates its index templates on first startup. These templates must exist before snapshots can be successfully restored.

Start Optimize connected to the target Elasticsearch/OpenSearch instance (the clean instance where you intend to restore). Allow it to reach a healthy state, which seeds the required index templates and component templates.

You can verify the templates were created:

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
