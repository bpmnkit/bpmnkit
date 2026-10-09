# Connectors runtime: Physical Tenant support — Outbound connectors

### Tenant context propagation

The runtime resolves each job's Physical Tenant from the activated job record and uses it to select the per-tenant secret provider, document store, and metrics attribution for that job.

The `physicalTenantId` is not exposed as a process variable, so it cannot be referenced directly from a FEEL expression in a connector's element template. To route a connector to a tenant-specific endpoint, set a variable at process start and reference that variable instead.

### Per-tenant secret access

Per-tenant secret isolation is **opt-in and disabled by default**. Enable it explicitly in any multi-tenant deployment:

```yaml
camunda:
  connector:
    secretprovider:
      environment:
        physicaltenantaware: true
```

Equivalent environment variable: `CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PHYSICALTENANTAWARE`.

With this enabled, the runtime resolves each secret against a name scoped to the job's Physical Tenant: `${prefix}${physicalTenantId}_${name}`. With the default secret prefix `SECRET_`, a reference to `MY_SECRET` from a job on `tenanta` resolves the environment variable `SECRET_tenanta_MY_SECRET`.

**Warning: Secrets are shared across tenants by default**
With `physicaltenantaware` left at its default of `false`, all configured clients resolve secrets from a single flat namespace. A reference to `{{secrets.MY_SECRET}}` resolves the same `SECRET_MY_SECRET` value regardless of which Physical Tenant the job belongs to. Enable `physicaltenantaware` in any deployment where tenants must not share secret values.

Reference secrets in connector properties using a [legacy secret reference](https://docs.camunda.io/docs/next/reference/glossary#secret-reference-legacy), `{{secrets.MY_SECRET}}`. The runtime replaces references when it binds the job's variables, and does not write resolved values back to the variable store, Operate, Tasklist, or logs.

Independently of tenant scoping, `camunda.connector.secret-resolver.secret-filter.mode` controls whether a connector element may reference secret keys it has not declared. It defaults to `DISABLED`, meaning no key-level restriction is enforced. Set it to `LAX` or `STRICT` to restrict each element to the secret keys declared in its process definition.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime
