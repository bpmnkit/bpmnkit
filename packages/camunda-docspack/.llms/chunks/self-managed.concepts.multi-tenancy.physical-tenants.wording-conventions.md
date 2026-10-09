# Physical Tenants — Wording conventions

When referencing Physical Tenants and Logical Tenants in documentation and code:

- Use **`physicalTenantId`** when referencing Physical Tenant API parameters, configuration keys, or system identifiers.
- Use **`tenantId`** only when referencing Logical Tenants (backward-compatible with existing API).
- Existing API keys remain unchanged.
- Use **Physical Tenant** and **Logical Tenant** (capitalized) as the canonical terms.


## Learn more

- For detailed technical information about isolation model, architecture, and storage configuration, see [physical tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index).
- To set up a second isolated Physical Tenant end to end, see [set up two isolated Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started).
- For tenant configuration defaults, overrides, validation, and examples, see [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference).
- For adding tenants and lifecycle expectations in 8.10, see [provisioning and lifecycle](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle).
- For how REST API requests are routed to Physical Tenants, including default tenant compatibility and HTTP status codes, see [API routing](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing).
- For identity deployment models, token routing, and per-tenant authorization, see [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization).
- For how authorization is divided between cluster-wide and tenant-local operations, see [authorization model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model).
- For how Physical Tenant storage isolation works across primary storage, secondary storage, and document stores, see [storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation).
- For how Physical Tenants map onto Helm releases, including the per-tenant Optimize release, index prefixes, and tenant lifecycle operations, see [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants
