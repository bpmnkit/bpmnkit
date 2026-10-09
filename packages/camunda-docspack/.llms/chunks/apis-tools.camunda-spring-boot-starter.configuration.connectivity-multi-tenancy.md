# Configuration — Connectivity — Multi-tenancy

To connect the client to a specific tenant, you can configure:

```yaml
camunda:
  client:
    tenant-id: myTenant
```

This does also affect the default tenant being used by all job workers, however there are [more possibilities](#control-tenant-usage) to configure them.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
