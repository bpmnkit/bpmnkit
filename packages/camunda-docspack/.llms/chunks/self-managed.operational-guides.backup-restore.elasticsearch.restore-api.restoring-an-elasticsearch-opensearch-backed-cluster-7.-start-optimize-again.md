# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — 7. Start Optimize again

If you stopped Optimize in [step 3](#restore-es-snapshots-step), start it again now that the cluster is processing. If you are using the Camunda Helm chart, set `optimize.enabled` back to `true` in your `values.yml` and apply the change. For a manual deployment, start Optimize the way you normally do.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
