# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Migrate deprecated Helm keys to `extraConfiguration`

The `extraConfiguration` value format is the same as in 8.9. If you already use `extraConfiguration`, you don't need to change the format for this upgrade. For the mechanics and the behavior of each component, see [Application configuration and `extraConfiguration`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs). The same page gives a worked example of how to move settings into a configuration file.

The following condensed example shows the shape of the migration for the Orchestration Cluster:

```yaml
# Before (8.9 keys that chart 15.x deprecates)
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
        logging:
          level:
            io.camunda.zeebe: debug
        camunda:
          data:
            snapshot-period: 10m
            secondary-storage:
              retention:
                enabled: true
                minimum-age: 45d
              elasticsearch:
                history:
                  policy-name: camunda-history-retention-policy
```

The `policy-name` entry keeps the ILM policy name the chart rendered in 8.9. For OpenSearch, use `opensearch:` instead of `elasticsearch:`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
