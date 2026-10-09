# Upgrade Camunda components from 8.9 to 8.10 — Physical Tenants — What happens automatically

- Your existing root-level configuration becomes the configuration of the `default` Physical Tenant. There is no manual migration step and no data migration.
- Storage keeps its existing location. Schemas, index prefixes, and document store paths are not reorganized.
- The `default` Physical Tenant is always present, and cannot be renamed, disabled, or deleted.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
