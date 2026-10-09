# Troubleshoot Physical Tenants — Startup and configuration errors

Camunda validates Physical Tenant configuration at startup and fails fast with an error that names the offending tenant.

| Symptom                                                         | Cause                                                                                 | Resolution                                                                                                          |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| Startup fails naming two tenants that share a storage location  | Two tenants resolve to the same schema, index prefix, or document store path          | Give each tenant a distinct location. See [storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#rdbms-storage).                |
| Startup fails on provider selection for a non-default tenant    | A configured tenant does not declare `providers.assigned`                             | Assign at least one cluster OIDC provider to the tenant.                                                            |
| Startup fails naming an unresolvable database vendor            | The JDBC URL prefix is unrecognized and no `database-vendor-id` is set                | Set `database-vendor-id` explicitly for that tenant.                                                                |
| Schema migration fails on an identifier                         | The RDBMS table prefix is not a valid SQL identifier                                  | Remove hyphens, spaces, and leading digits from the prefix.                                                         |
| Startup reports an Oracle storage conflict for distinct tenants | Oracle tenants isolated by schema-per-user share one JDBC URL, so they look identical | Set `data.secondary-storage.rdbms.database-vendor-id: oracle` on each tenant. The startup error includes this hint. |
| Per-tenant exporter settings appear to be ignored               | The exporter is declared only for the tenant and not at the root                      | Declare the exporter at the root as well, then override it per tenant.                                              |

The provider selection error names the exact property path it expects:

```text
Invalid physical-tenant provider selection: non-default physical tenant '<tenantId>' must declare a
non-empty 'camunda.physical-tenants.<tenantId>.security.authentication.providers.assigned' selecting
which cluster OIDC providers apply to it
```

The one exception is the implicit default tenant. When no `camunda.physical-tenants.*` configuration is present at all, the default tenant inherits the full cluster provider set. Once you configure `camunda.physical-tenants.default` explicitly, it must declare its assigned providers like any other tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
