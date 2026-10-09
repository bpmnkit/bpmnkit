# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — 3. Trigger the restore {#trigger-the-restore}

There are multiple ways to define your restore point objective depending on your backup strategy. Requests that combine `backupIds` with `from` or `to`, that specify a time range without continuous backups enabled, or that reference a backup with no completed state in the store, are rejected with `400`.

[Provide the restore parameters](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/restore.api). Camunda validates the request, resolves the backups for every partition, and acknowledges the request with `202` before the restore itself runs:

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
