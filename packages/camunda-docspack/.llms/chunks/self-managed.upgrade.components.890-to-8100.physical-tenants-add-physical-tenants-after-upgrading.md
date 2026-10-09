# Upgrade Camunda components from 8.9 to 8.10 — Physical Tenants — Add Physical Tenants after upgrading

Physical Tenants are provisioned through static configuration, so adding one is a configuration change followed by a rolling restart. Dynamic creation at runtime is not available. See [provisioning and lifecycle](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle), or [set up two isolated Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started) for a hands-on walkthrough.

A tenant's lifecycle follows its configuration. A tenant present in configuration is provisioned automatically, removing it from configuration disables it and retains its data, and re-adding it re-enables the tenant with that data. Deleting a tenant's data is not supported. A disabled tenant can be [logically removed](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle#logically-remove-a-disabled-tenant) from the cluster topology, which deletes no data.

Three behaviors change once a node serves more than one tenant:

- Each tenant's secondary storage is initialized independently. A tenant whose storage is unusable is degraded on its own, returning `503` with a `Retry-After` header, while the other tenants keep serving traffic.
- Node readiness reports ready while at least one tenant is serviceable, so a ready node no longer implies every tenant is healthy.
- Browser sessions become path-scoped per tenant. A user signed in to one tenant is not signed in to another, and signing in to a second tenant creates a second, independent session rather than replacing the first.

Before adding tenants, review [storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation) so each tenant resolves to a distinct storage location. Two tenants sharing a location fails startup.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
