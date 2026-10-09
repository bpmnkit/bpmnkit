# Restore a backup with the Restore Application — 2. Restore the Zeebe cluster {#restore-zeebe-cluster} — cli

```bash
./camunda/bin/restore \
  --allTenants \
  --backupId=1748937221 \
  --override.tenanta.backupId=31 \
  --override.tenantb.backupId=32
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
