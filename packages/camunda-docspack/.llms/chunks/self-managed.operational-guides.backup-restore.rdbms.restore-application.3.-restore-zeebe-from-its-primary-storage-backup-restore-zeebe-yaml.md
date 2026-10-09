# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe} — yaml

```yaml
orchestration:
  env:
    - name: SPRING_PROFILES_ACTIVE
      value: "restore"
    - name: ZEEBE_RESTORE
      value: "true"
    - name: ZEEBE_RESTORE_ALL_TENANTS
      value: "true"
    - name: ZEEBE_RESTORE_FROM_TIMESTAMP
      value: "<TIMESTAMP>"
    - name: ZEEBE_RESTORE_TO_TIMESTAMP
      value: "<TIMESTAMP>"

  extraConfiguration:
    - file: restore-overrides.yaml
      content: |
        override:
          tenanta:
            from: "<TIMESTAMP>"
            to: "<TIMESTAMP>"
          tenantb:
            backupId: [32]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
