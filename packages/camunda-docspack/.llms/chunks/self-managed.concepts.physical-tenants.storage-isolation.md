# Storage isolation

Configure separate storage backends per Physical Tenant for RDBMS, Elasticsearch/OpenSearch, and Document Store.


## About

Learn how to configure isolated secondary storage for Physical Tenants across RDBMS, Elasticsearch/OpenSearch, and Document Store backends.


## RDBMS storage

Each Physical Tenant can have its own schema or database instance.

### Configuration models

**Separate schema** (recommended for cost-efficiency):

```yaml
camunda:
  physical-tenants:
    default:
      data:
        secondary-storage:
          rdbms:
            url: jdbc:postgresql://db.example.com:5432/camunda?currentSchema=default_schema
    tenanta:
      data:
        secondary-storage:
          rdbms:
            url: jdbc:postgresql://db.example.com:5432/camunda?currentSchema=tenant_a_schema
            # The 'default_schema' and 'tenant_a_schema' schemas must exist before startup
```

**Separate database instance** (maximum isolation):

```yaml
tenanta:
  data:
    secondary-storage:
      rdbms:
        url: jdbc:postgresql://db-tenant-a.example.com:5432/camunda
```

**Mixed vendors**: Different Physical Tenants can use PostgreSQL, MySQL, Oracle, etc. in the same cluster.

### Validation and operations

- **Configuration**: Misconfiguration (duplicate schema/URL) causes a startup error with a clear message. For Oracle, schema isolation uses distinct authenticated users rather than URL differences, so set `database-vendor-id: oracle` on each tenant to avoid a false conflict on identical URLs.
- **Pre-startup**: Ensure each tenant's schema exists, is empty, and has valid credentials
- **Manual DDL**: If running Liquibase scripts separately, apply to every tenant's schema before each upgrade
- **Resource scaling**: Each tenant gets its own JDBC datasource per cluster node; add memory/CPU for many tenants

**Note: RDBMS table prefixes are normalized to uppercase**
Camunda converts RDBMS table prefixes to uppercase before applying them, so `tenanta_` and `TENANTA_` produce the same schema objects. Two consequences follow:

- Prefixes that differ only in case resolve to the same storage location. Configuring `ta_` for one tenant and `TA_` for another fails the startup uniqueness check.
- Prefixes that are invalid SQL identifiers for other reasons, such as hyphens, spaces, or a leading digit, are still accepted at configuration time and fail later during schema migration.

Earlier 8.10 alpha releases carried the prefix through verbatim, which failed the Liquibase migration at startup for a lowercase prefix. See [camunda/camunda#56093](https://github.com/camunda/camunda/issues/56093).

**Note: Isolate Oracle tenants by schema-per-user**
Oracle isolates Physical Tenants by distinct authenticated database users rather than by differing JDBC URLs, so two Oracle tenants can share one URL and still be isolated. Because the URLs are identical, startup validation reports a storage-location conflict unless you tell Camunda the vendor explicitly.

Set `data.secondary-storage.rdbms.database-vendor-id: oracle` on each tenant. The startup error includes this hint.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
