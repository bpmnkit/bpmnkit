# Restore a backup with the Restore Application — 2. Restore the Zeebe cluster {#restore-zeebe-cluster} — yaml

```yaml
orchestration:
  env:
    - name: SPRING_PROFILES_ACTIVE
      value: "restore"
    - name: ZEEBE_RESTORE
      value: "true"
    - name: ZEEBE_RESTORE_ALL_TENANTS
      value: "true"
    - name: ZEEBE_RESTORE_FROM_BACKUP_ID
      value: "27"

  extraConfiguration:
    - file: restore-overrides.yaml
      content: |
        override:
          tenanta:
            backupId: [31]
          tenantb:
            backupId: [32]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
