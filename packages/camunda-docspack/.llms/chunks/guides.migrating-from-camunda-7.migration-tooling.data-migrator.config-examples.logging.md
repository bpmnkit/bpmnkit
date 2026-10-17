# Configuration examples — Logging

```yaml
logging:
  level:
    root: INFO # Root logger level
    io.camunda.migration.data: INFO # Migrator logging
    io.camunda.migration.data.RuntimeMigrator: DEBUG # Runtime migration logging
    io.camunda.migration.data.persistence.IdKeyMapper: DEBUG # ID mapping logging
  file:
    name: logs/camunda-7-to-8-data-migrator.log
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-examples
