# Variables — Disabling built-in interceptors — Configuring custom interceptors

Configure your custom interceptors in `application.yml`:

```yaml
# Variable interceptor plugins configuration
# These plugins can be packaged in JARs and dropped in the userlib folder
camunda:
  migrator:
    interceptors:
      - class-name: com.example.migrator.AuditVariableInterceptor
        enabled: true
        properties:
          prefix: "CUSTOM_PREFIX_"
          enableLogging: true
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
