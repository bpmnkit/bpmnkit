# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — cli

```bash
./camunda/bin/restore \
  --allTenants \
  --backupId=1748937221 \
  --override.tenanta.from=<TIMESTAMP> --override.tenanta.to=<TIMESTAMP> \
  --override.tenantb.backupId=32
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
