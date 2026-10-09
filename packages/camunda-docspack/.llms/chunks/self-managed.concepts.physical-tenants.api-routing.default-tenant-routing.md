# API routing for Physical Tenants — Default tenant routing

On the REST API, requests that omit the Physical Tenant prefix are routed to the `default` Physical Tenant. This rule is specific to the `/v2/...` REST API; the actuator surface does not follow it uniformly. For example, an unscoped `POST /actuator/cluster/purge` targets every configured tenant, not just the default one. See [data purge](https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge).

```
/v2/{resource}  →  /physical-tenants/default/v2/{resource}
```

This means existing integrations that do not use the tenant-prefixed paths continue to work without modification. They interact with the default Physical Tenant.

You can also use `default` explicitly as the `physicalTenantId`:

```
GET /physical-tenants/default/v2/process-definitions/search
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing
