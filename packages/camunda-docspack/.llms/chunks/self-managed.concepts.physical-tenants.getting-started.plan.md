# Set up two isolated Physical Tenants — Plan

Before touching configuration, decide three things for the new tenant:

1. **Storage**: a distinct RDBMS schema, database, or index prefix. This guide uses a separate schema on the same PostgreSQL instance `default` already uses, the lowest-effort option. See [RDBMS storage](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#rdbms-storage) for the tradeoffs against a dedicated database instance.
2. **Identity**: whether Risk reuses the platform's existing Keycloak/OIDC provider (recommended to start, since it's one less moving part) or connects its own identity provider.
3. **Authorization**: who administers Risk's tenant, and what roles their process applications need. Physical Tenants don't inherit authorization from the cluster or from other tenants. Each tenant's `security.initialization` block is independent. See [per-tenant role and permission definitions](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#per-tenant-role-and-permission-definitions).

For this walkthrough, the new tenant is named `riskprod`, reusing the existing Keycloak provider, with its own schema and its own authorization block.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
