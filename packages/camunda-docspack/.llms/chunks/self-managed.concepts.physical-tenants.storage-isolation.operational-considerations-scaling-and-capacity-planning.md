# Storage isolation — Operational considerations — Scaling and capacity planning

- **RDBMS**: Monitor schema size per tenant; high-traffic tenants may need dedicated instances
- **ES/OS**: Monitor index size per prefix; set retention policies independently per tenant. If ES/OS is shared across multiple Physical Tenants, also monitor overall cluster health and capacity.
- **Document Store**: Monitor bucket size per tenant; set lifecycle policies for archival

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
