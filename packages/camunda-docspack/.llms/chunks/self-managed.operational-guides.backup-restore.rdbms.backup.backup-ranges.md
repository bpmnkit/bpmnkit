# Camunda backup creation (RDBMS) — Backup ranges

A **backup range** is a contiguous sequence of backups that together cover the complete log data between the first and last backup, with no gaps. Ranges are tracked per partition.

Ranges are critical for restore because restoring from a time window or to match the RDBMS state requires complete log coverage. Each successful backup extends the current range as long as its log data connects to the previous backup. If a backup fails and the next successful backup no longer covers the missing log data, the current range ends and a new range begins.

Use the [backup state actuator](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#request-runtime-state) to inspect the current ranges for each partition.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
