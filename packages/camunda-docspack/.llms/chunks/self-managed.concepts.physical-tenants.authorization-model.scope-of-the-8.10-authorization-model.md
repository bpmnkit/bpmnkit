# Authorization model for Physical Tenants — Scope of the 8.10 authorization model

The Physical Tenant authorization model is designed around per-engine, per-tenant role and permission management. Key design principles:

- **Per-tenant authorization is independently managed.** Each Physical Tenant defines its own roles, permissions, and mapping rules. A change in one tenant's authorization configuration does not affect other tenants.
- **Cluster-wide governance via Camunda Hub is a future capability.** Cross-tenant administration using Camunda Hub is not available in 8.10. Cluster-wide management endpoints use the dedicated cluster-admin role.
- **Identity provider setup is covered separately.** See [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization) for the supported identity deployment models and why per-engine IdP fragmentation is discouraged.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model
