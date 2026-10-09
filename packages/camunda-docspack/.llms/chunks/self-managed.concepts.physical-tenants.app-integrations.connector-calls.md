# App Integrations and Physical Tenants — Connector calls

The App Integrations connector posts to the same deployment, and its tenant is resolved the same way as an exporter event's: the `X-Physical-Tenant-Id` header first, then the tenant whose `connector.apiKey` authenticated the request, then `default`.

The connector reads the tenant from the job it is executing and sends it on every call, so there is nothing to configure on the connector task or in the process model. What matters is that the connector runtime knows its own tenant. Set `physical-tenant-id` on each client entry, as described in [Connectors runtime](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime#how-the-runtime-identifies-the-physical-tenant). A client without it produces jobs that carry no tenant, so the connector omits the header and the call resolves to `default`.

Because the tenant reaches the backend, a form referenced by the connector is fetched from that tenant's own orchestration endpoint using that tenant's audience, and notification rule matching is scoped to the same tenant.

A call naming a tenant that is not configured for the cluster is rejected with `400 Invalid X-Physical-Tenant-Id header` rather than delivered to `default`. Keep the tenant IDs in `physicalTenants` and the runtime's `physical-tenant-id` values in sync.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
