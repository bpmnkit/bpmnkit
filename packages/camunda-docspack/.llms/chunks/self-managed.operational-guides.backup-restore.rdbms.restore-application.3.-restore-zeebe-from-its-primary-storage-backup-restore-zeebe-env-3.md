# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — env

```yaml
orchestration:
  enabled: true
  env:
    - name: SPRING_PROFILES_ACTIVE
      value: "restore"
    - name: ZEEBE_RESTORE
      value: "true"
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

With the backup ID passed as a command-line argument:

```yaml
orchestration:
  command:
    - "/usr/local/camunda/bin/restore"
    - "--backupId=1772001869309,1772001899400"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
