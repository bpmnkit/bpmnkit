# Back up and restore Optimize independently — Restore a backup — Step 4: Delete all existing Optimize indices

Delete the indices created during startup so they do not block the snapshot restore. The commands match only indices that start with the default index prefix `optimize-`. If you configured a custom index prefix (see [Elasticsearch index settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#elasticsearch-index-settings) or [OpenSearch index settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#opensearch-index-settings)), use it instead.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
