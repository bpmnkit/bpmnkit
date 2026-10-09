# Configure the audit log — Configure secondary storage retention

With Camunda 8 Self-Managed, you control the [secondary storage retention policy](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#data---secondary-storage), which applies to audit log records:

### application.yaml

```yaml
camunda:
  data:
    secondary-storage:
      retention:
        enabled: true
        minimum-age: 30d
```

### env

```bash
CAMUNDA_DATA_SECONDARYSTORAGE_RETENTION_ENABLED=true
CAMUNDA_DATA_SECONDARYSTORAGE_RETENTION_MINIMUMAGE=30d
```

### helm

```yaml
orchestration:
  retention:
    enabled: true
    minimumAge: 30d
```

See [Configure data retention](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention) for more information about the Helm configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/audit-log/configure
