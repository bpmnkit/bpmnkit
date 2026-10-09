# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — manual

```bash
# Ensure RDBMS configuration is set (URL, credentials, etc.)
export CAMUNDA_DATA_SECONDARY_STORAGE_TYPE=rdbms
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_URL="jdbc:postgresql://localhost:5432/camunda"
# ... other RDBMS config

# Ensure backup store is configured
export CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_STORE=S3
# ... other store config

mkdir -p camunda
tar -xzf camunda-zeebe-X.Y.Z.tar.gz --strip-components=1 -C camunda/
./camunda/bin/restore
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
