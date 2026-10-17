# c8ctl CLI — Tenant resolution

Tenants are resolved in the following order:

1. **Active tenant** — set with `c8 use tenant <id>`.
2. **Default tenant** from the active profile.
3. **`CAMUNDA_DEFAULT_TENANT_ID`** environment variable.
4. **`<default>`** tenant.

```bash
c8 use tenant my-tenant-id
c8 list pi   # uses my-tenant-id
```


## Profile management

`c8ctl` supports two types of profiles:

1. `c8ctl` profiles — managed directly with `c8ctl` commands.
2. Camunda Modeler profiles — automatically imported from Camunda Modeler (read-only, prefixed with `modeler:`).

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
