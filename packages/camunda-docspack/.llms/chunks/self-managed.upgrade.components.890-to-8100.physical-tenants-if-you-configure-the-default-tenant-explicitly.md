# Upgrade Camunda components from 8.9 to 8.10 — Physical Tenants — If you configure the default tenant explicitly

Leaving the configuration untouched is the safe path. If you add any `camunda.physical-tenants.default.*` override, one validation rule changes.

While no `camunda.physical-tenants.*` configuration is present, the implicit default tenant inherits the full set of cluster identity providers. As soon as you configure `camunda.physical-tenants.default` explicitly, it must declare its own `providers.assigned`, exactly like any other tenant. On an OIDC cluster, omitting it fails startup:

```text
Invalid physical-tenant provider selection: non-default physical tenant '<tenantId>' must declare a
non-empty 'camunda.physical-tenants.<tenantId>.security.authentication.providers.assigned' selecting
which cluster OIDC providers apply to it
```

Values under `camunda.physical-tenants.default.*` are interpreted as overrides of the existing default tenant, not as the creation of a new one.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
