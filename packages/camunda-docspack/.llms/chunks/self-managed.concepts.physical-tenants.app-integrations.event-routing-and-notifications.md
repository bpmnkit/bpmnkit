# App Integrations and Physical Tenants — Event routing and notifications

Each tenant's exporter posts its events to the same App Integrations endpoint. The tenant is resolved per request:

1. **The `X-Physical-Tenant-Id` header**, if present. It must name a tenant configured for that cluster, or the request is rejected with `400 Invalid X-Physical-Tenant-Id header`.
2. **The authenticating API key**, if it is a tenant's `exporter.apiKey`.
3. **`default`**, otherwise.

**Warning**
A request authenticated with the **cluster-level** `exporter.apiKey` never resolves to a named tenant, because the cluster key is matched before the per-tenant keys. If such a request omits the header, its events are attributed to `default` and silently match no rule on a cluster whose `default` tenant is hidden. Give every tenant its own `exporter.apiKey`, send the header, or both.

Notification rules are scoped to the `(organization, cluster, Physical Tenant)` triple, and the tenant is matched on exact equality. Unlike the process and element filters, it has no wildcard: a rule scoped to `default` never receives a named tenant's events.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
