# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — Restore options

There are four restore options. In all cases, the restore app reads the exporter position from the restored RDBMS to ensure consistency between primary and secondary storage.

**Note**
`--backupId` is mutually exclusive with `--from`/`--to`. Specifying both will result in error.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
