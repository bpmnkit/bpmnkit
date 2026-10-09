# Configuration reference — Default tenant behavior and compatibility — Startup error message formats

**Secondary storage (RDBMS, Elasticsearch, or OpenSearch) location conflict:**

```text
Physical tenants must not share a secondary-storage location, or they would write into the same
database. Use a distinct connection, or a distinct index/table prefix per tenant. Conflicts: tenants
[tenanta, tenantb] share the same secondary-storage location [type=rdbms,
connection=jdbc:postgresql://db/shared, namespace='']
```

For Oracle, a colliding RDBMS location additionally appends a hint to isolate by schema-per-user instead: `To isolate Oracle physical tenants by schema-per-user (distinct DB users on a shared jdbc url), set data.secondary-storage.rdbms.database-vendor-id: oracle on each tenant.`

**Document store location conflict:**

```text
Physical tenants must not share a document store location, or they would read and write into the
same backing storage. Use a distinct bucket, container, or path per tenant, and never nest one
tenant's path inside another's. A nested path is reachable through a caller-supplied document id,
which no object store bounds at '/'. Conflicts: tenants [tenanta, tenantb] share the same document
store location [provider=aws, namespace=[company-docs-bucket], keyPrefix='tenant-a']
```

If one tenant's path is nested inside another's rather than identical, the message instead reads: `tenant <enclosing> 's document store location [...] encloses tenant <enclosed> 's [...]`.

**Secret store or cache misconfiguration:**

```text
Physical tenant 'riskprod' has 2 secret stores configured, but only one is supported at this time
```

```text
Physical tenant 'riskprod' configures secret store 'primary', but the only supported store id is
'default'; rename camunda.physical-tenants.riskprod.secrets.stores.file.primary to
camunda.physical-tenants.riskprod.secrets.stores.file.default
```

```text
Physical tenant 'riskprod' has an invalid secret cache configuration: camunda.secrets.cache.ttl must
be at least 1 minute, but was PT30S
```

```text
Physical tenant 'riskprod' has an invalid secret cache configuration: camunda.secrets.cache.ttl must
be a whole number of minutes, but was PT1M30S
```

```text
Physical tenant 'riskprod' has an invalid secret cache configuration: camunda.secrets.cache.max-size
must be at least 1, but was 0
```

```text
File store 'default' for physical tenant 'riskprod' has no path configured
```

The cache messages always report the canonical `camunda.secrets.cache.*` property path, even when the
value came from a `camunda.physical-tenants.<tenant-key>.secrets.cache.*` override; the tenant name in
the surrounding sentence is what identifies which tenant's override is at fault.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference
