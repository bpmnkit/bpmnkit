# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — time-range

Constrain the restore to a specific backup range by specifying both `--from` and `--to`. This is useful if automatic matching did not work.

The restore app finds a backup range whose start is at or before `--from` and whose end is at or after `--to`, then restores to the checkpoint closest to `--to`.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
