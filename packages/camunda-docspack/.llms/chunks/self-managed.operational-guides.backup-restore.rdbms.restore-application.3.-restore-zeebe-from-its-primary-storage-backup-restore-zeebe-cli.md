# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — cli

```bash
export ZEEBE_RESTORE_TO_TIMESTAMP=2026-01-10T14:00:00Z

mkdir -p camunda
tar -xzf camunda-zeebe-X.Y.Z.tar.gz --strip-components=1 -C camunda/
./camunda/bin/restore --to="${ZEEBE_RESTORE_TO_TIMESTAMP}"
```

  

**Warning**
The `--to` timestamp must not be before the restored state of the RDBMS. If it is, the secondary storage would be ahead of the primary storage and the restore will fail.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
