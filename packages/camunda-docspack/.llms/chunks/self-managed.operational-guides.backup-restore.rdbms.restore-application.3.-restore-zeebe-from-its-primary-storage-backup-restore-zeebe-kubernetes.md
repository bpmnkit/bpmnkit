# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — kubernetes

```yaml
orchestration:
  enabled: true
  env:
    - name: SPRING_PROFILES_ACTIVE
      value: "restore"
    - name: ZEEBE_RESTORE
      value: "true"
    - name: CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_STORE
      value: "S3" # or GCS, AZURE, FILESYSTEM
    # Rest of the backup store configuration (bucket, region, etc.)
    - name: CAMUNDA_DATA_SECONDARY_STORAGE_TYPE
      value: "rdbms"
    # Rest of the RDBMS configuration (URL, username, password)

connectors:
  enabled: false
optimize:
  enabled: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
