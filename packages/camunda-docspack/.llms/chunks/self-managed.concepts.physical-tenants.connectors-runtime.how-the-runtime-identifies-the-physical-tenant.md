# Connectors runtime: Physical Tenant support — How the runtime identifies the Physical Tenant

The activated job record carries the `physicalTenantId`, propagated through the broker request. The runtime uses this value to determine which Physical Tenant a job belongs to.

- The runtime registers one job worker per configured client per connector type, so each Physical Tenant gets its own worker for each job type.
- Registration covers **statically configured** `camunda.clients.*` entries only. A Physical Tenant only gets a job worker if it is explicitly configured as a client.
- Always set `physical-tenant-id` explicitly on each client entry. If it is omitted, the runtime falls back to a derived value and per-tenant attribution in metrics and the connector instance listing becomes unreliable.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime
