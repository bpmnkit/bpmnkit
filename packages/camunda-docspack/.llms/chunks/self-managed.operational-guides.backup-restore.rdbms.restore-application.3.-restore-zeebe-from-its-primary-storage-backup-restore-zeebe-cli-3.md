# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — cli

```bash
mkdir -p camunda
tar -xzf camunda-zeebe-X.Y.Z.tar.gz --strip-components=1 -C camunda/
./camunda/bin/restore --backupId=1772001869309,1772001899400
```

  

**Caution**
When using backup ID restore, the RDBMS exporter position is not consulted. You must ensure that the provided backups are compatible with the restored RDBMS state.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
