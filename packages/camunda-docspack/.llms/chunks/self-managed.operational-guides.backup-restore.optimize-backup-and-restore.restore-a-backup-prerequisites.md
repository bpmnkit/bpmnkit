# Back up and restore Optimize independently — Restore a backup — Prerequisites

- **Optimize stopped**: Optimize must not be running while restoring the datastore.
- **Clean state**: Elasticsearch or OpenSearch must have no existing Optimize indices. All data will be restored from the snapshots.
- **Optimize version**: The backup must be restored using the **same Optimize version** it was created with. The version is embedded in the snapshot names, for example as `camunda_optimize_123456_<optimize-version>_part_1_of_2`.
- **Snapshot repository**: Elasticsearch or OpenSearch must be configured with the same snapshot repository used during backup.

**Warning**
Do not start Optimize against a partially restored datastore. Ensure all snapshots are fully restored before starting Optimize.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
