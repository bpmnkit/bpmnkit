# Custom exporters for Physical Tenants — Declaring a tenant-private exporter

Use an exporter ID that is not defined in the root catalog to scope an exporter entirely to one tenant:

```yaml
camunda:
  physical-tenants:
    tenanta:
      data:
        exporters-assigned:
          - tenanta-only-exporter
        exporters:
          tenanta-only-exporter:
            class-name: com.example.TenantAExporter
            jar-path: /usr/local/camunda/exporters/tenant-a.jar
            args:
              region: us-east
```

A tenant-private exporter is not visible to, or usable by, other Physical Tenants, and it does not need to match any root definition.

**Note: Related pages**

- [Configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference)
- [Storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation)
- [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/custom-exporters
