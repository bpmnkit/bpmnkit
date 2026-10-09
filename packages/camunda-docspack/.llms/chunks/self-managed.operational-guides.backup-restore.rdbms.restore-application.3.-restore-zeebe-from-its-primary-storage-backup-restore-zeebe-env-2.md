# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — env

```yaml
orchestration:
  enabled: true
  env:
    - name: SPRING_PROFILES_ACTIVE
      value: "restore"
    - name: ZEEBE_RESTORE
      value: "true"
    - name: ZEEBE_RESTORE_FROM_TIMESTAMP
      value: "2026-01-10T13:00:00Z"
    - name: ZEEBE_RESTORE_TO_TIMESTAMP
      value: "2026-01-10T14:00:00Z"
    - name: CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_STORE
      value: "S3"
    # Rest of the backup store configuration
    - name: CAMUNDA_DATA_SECONDARY_STORAGE_TYPE
      value: "rdbms"
    # Rest of the secondary storage configuration

connectors:
  enabled: false
optimize:
  enabled: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
