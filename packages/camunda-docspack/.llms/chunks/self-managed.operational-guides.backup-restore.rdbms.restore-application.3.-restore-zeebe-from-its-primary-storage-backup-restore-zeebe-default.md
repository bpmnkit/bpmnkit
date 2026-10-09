# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — default

**This is the recommended restore option.** No additional parameters are required — the restore application automatically determines the best backup to use.

The restore app reads the exporter position from the restored RDBMS for each partition and identifies the most recent backup taken before that position. It then applies all subsequent backups in the range, restoring up to the latest available backup.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
