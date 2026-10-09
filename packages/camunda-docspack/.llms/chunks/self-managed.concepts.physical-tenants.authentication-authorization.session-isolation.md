# Authentication and authorization for Physical Tenants — Session isolation

Each Physical Tenant has its own path-scoped session cookie. The browser only sends the session cookie for that tenant's URL prefix (`/physical-tenants/<id>`), so sessions from different tenants do not interfere.

For example:

- Tenant A: `camunda-session-tenanta`, scoped to `/physical-tenants/tenanta`
- Default tenant: `camunda-session-default`, scoped to `/physical-tenants/default`


## Cluster-admin role

Cluster-wide management endpoints use the cluster-admin role. Broker startup does not fail if the role is not configured. Configure the role to restrict cluster-wide operations, such as backup, restore, and topology management, to authorized operators.

The cluster-admin role is resolved from JWT token claims using configurable mapping rules. No persisted cluster-level role bindings or new cluster identity service is required. Multiple mechanisms are supported: claim-based mapping rules, a dedicated cluster-admin configuration, and explicit user assignment for Basic authentication.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
