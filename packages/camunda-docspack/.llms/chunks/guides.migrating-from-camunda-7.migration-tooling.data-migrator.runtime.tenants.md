# Runtime — Tenants

- Camunda 7 process instances assigned to no tenant (`tenantId=null`) are migrated to Camunda 8 with `<default>` tenant.
- The default behavior is to migrate only process instances without assigned tenant.
- When migrating process instances, the migrator can be configured to handle specific tenants
  throughout the migration process. Defining tenant IDs ensures that only process instances
  associated with those tenants are migrated.
  - Make sure to create the tenants in Camunda 8 before starting the migration.
  - Add `Authentication configuration for the client` and assign the user to the all of the tenants

### How Multi-Tenancy Works

1. **Validation**: Pre-migration validation ensures target tenant deployments exist in Camunda 8
2. **Tenant Preservation**: Process instances maintain their original tenant association during
   migration
3. **Job Activation**: The migrator fetches jobs only for the configured tenants and the default
   tenant when activating jobs

### Example

Use the `camunda.migrator.tenant-ids` [property](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties#camundamigrator) to specify which tenants should be included in the migration process. This property accepts a comma-separated list of tenant identifiers.

```yaml
camunda:
  migrator:
    tenant-ids: tenant-1, tenant-2, tenant-3
```

With this configuration, only process instances associated with `tenant-1`, `tenant-2`, `tenant-3`,
and the default tenant will be created and migrated. Instances associated with other tenants will be skipped.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
