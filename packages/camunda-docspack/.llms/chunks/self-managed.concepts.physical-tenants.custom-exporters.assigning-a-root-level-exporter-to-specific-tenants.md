# Custom exporters for Physical Tenants — Assigning a root-level exporter to specific tenants

```yaml
camunda:
  data:
    exporters:
      audit-log:
        class-name: com.example.AuditLogExporter
        jar-path: /usr/local/camunda/exporters/audit-log.jar
        args:
          endpoint: https://audit.example.com/ingest

  physical-tenants:
    tenanta:
      data:
        exporters-assigned:
          - audit-log
        exporters:
          audit-log:
            args:
              # Overrides/extends the root args for this tenant only
              endpoint: https://audit.example.com/ingest/tenanta

    tenantb:
      data:
        exporters-assigned: []
        # tenantb does not run the audit-log exporter
```

- `exporters-assigned` is the tenant's complete list of generic (non-autoconfigured) exporter IDs. It is mandatory for every tenant once the root catalog is non-empty or the tenant declares its own exporter; pass an empty list to explicitly run no generic exporters.
- Listing an ID in `exporters-assigned` without also declaring it under `data.exporters` is enough to run the exporter with its root `args` unchanged.
- Declaring an exporter under `data.exporters` without also listing it in `exporters-assigned` is rejected at startup: configuring an exporter is not a way to activate it.
- The autoconfigured `camundaexporter` and `rdbms` exporters (created automatically from a tenant's secondary-storage configuration) must never appear in `exporters-assigned`.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/custom-exporters
