# Physical Tenants — Physical Tenants in Camunda Hub

In Camunda Hub, each Physical Tenant is an [environment](https://docs.camunda.io/docs/next/components/concepts/environments), and teams deploy to it instead of to the cluster. See [how an environment maps to infrastructure](https://docs.camunda.io/docs/next/components/concepts/environments#how-an-environment-maps-to-infrastructure) for the naming.


## Wording conventions

When referencing Physical Tenants and Logical Tenants in documentation and code:

- Use **`physicalTenantId`** when referencing Physical Tenant API parameters, configuration keys, or system identifiers.
- Use **`tenantId`** only when referencing Logical Tenants (backward-compatible with existing API).
- Existing API keys remain unchanged.
- Use **Physical Tenant** and **Logical Tenant** (capitalized) as the canonical terms.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants
