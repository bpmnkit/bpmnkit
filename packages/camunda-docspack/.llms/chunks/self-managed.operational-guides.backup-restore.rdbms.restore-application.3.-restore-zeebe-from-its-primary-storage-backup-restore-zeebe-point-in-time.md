# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — point-in-time

Restore Zeebe to a specific point in time using `--to`. The restore app finds the closest backup to the provided timestamp. The configured [checkpoint interval](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup#checkpoint-interval) determines how fine-grained the restore points are.

Use the [backup state actuator](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#request-runtime-state) to inspect available backup ranges.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
