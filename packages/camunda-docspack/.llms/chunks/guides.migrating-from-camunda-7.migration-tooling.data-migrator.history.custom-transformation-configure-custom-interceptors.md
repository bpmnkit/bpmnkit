# History — Custom transformation — Configure custom interceptors

Configure your custom interceptors in `application.yml`:

```yaml
# Entity interceptor plugins configuration
# These plugins can be packaged in JARs and dropped in the userlib folder
camunda:
  migrator:
    interceptors:
      - class-name: com.example.migrator.ProcessInstanceEnricher
        enabled: true
        properties:
          customProperty: "value"
          enableAudit: true
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
