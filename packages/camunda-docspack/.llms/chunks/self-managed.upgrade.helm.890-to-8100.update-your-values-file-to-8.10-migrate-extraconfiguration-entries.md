# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Migrate `extraConfiguration` entries

The `extraConfiguration` value format is unchanged from 8.9. If you already use `extraConfiguration`, no format change is required for this upgrade. For the mechanics, per-component behavior, and a worked example of moving settings into a configuration file, see [Application configuration and `extraConfiguration`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs).

The following condensed example shows the shape of the migration for the orchestration component:

```yaml
# Before (8.9, deprecated keys)
orchestration:
  logLevel: debug
  data:
    snapshotPeriod: 10m
  history:
    retention:
      enabled: true
      minimumAge: 45d

# After (8.10, extraConfiguration)
orchestration:
  extraConfiguration:
    - file: application-migrated.yaml
      content: |
        zeebe:
          log:
            level: debug
        camunda:
          data:
            snapshot-period: 10m
            secondary-storage:
              retention:
                enabled: true
                minimum-age: 45d
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
