# History — Tenants

- Camunda 7's `null` tenant is migrated to Camunda 8's `<default>` tenant.
- All other `tenantId`s will be migrated as-is.
- For details, see [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy#tenant-identifier) in Camunda 8.


## Auto-cancellation of active instances

When migrating history data, the Data Migrator automatically handles **active or suspended** process instances from Camunda 7 by marking them as **canceled** in Camunda 8. This applies to:

- Process instances
- Flow nodes
- User tasks
- Incidents

Auto-canceled entities are assigned the migration timestamp as their end date.

By default, auto-canceled instances receive a cleanup date calculated as:

```text
cleanup_date = end_date + 6 months
```

This keeps auto-canceled instances eligible for history cleanup after six months and helps prevent unbounded history growth.

See [configuration for history auto-cancellation](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties#camundamigratorhistoryauto-cancelcleanup) for more details.

**Warning: Negative TTL values**
If you configure a negative auto-cancel TTL value, calculated cleanup dates are in the past. If Camunda 8 is running during migration, history cleanup can immediately clean up these entities, potentially before their child entities are migrated. See [history cleanup](#history-cleanup) for mitigation strategies.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
