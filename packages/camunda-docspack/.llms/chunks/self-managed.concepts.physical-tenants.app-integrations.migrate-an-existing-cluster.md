# App Integrations and Physical Tenants — Migrate an existing cluster

Adding `physicalTenants` to a cluster that already runs App Integrations changes which tenant its traffic is attributed to. Plan for the following:

1. **Existing notification rules stop matching.** Rules created before the change are scoped to `default`. Once events arrive tagged with a named tenant, those rules no longer match and deliver nothing. Recreate them per tenant.
2. **Users must reselect their cluster.** A stored context pointing at a tenant that is no longer offered is not migrated.
3. **The `default` tenant disappears from the picker** unless you set `exposeDefaultTenant: true`.
4. **Give each tenant's exporter its own credentials.** Configure a per-tenant `exporter.apiKey`, and confirm the exporter sends `X-Physical-Tenant-Id`.

To keep the cluster-wide view available during a migration, set `exposeDefaultTenant: true` and remove it once every rule has been recreated.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
