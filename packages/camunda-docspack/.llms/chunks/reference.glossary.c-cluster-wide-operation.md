# Glossary — C — Cluster-wide operation

An operation that affects the entire [Orchestration Cluster](#orchestration-cluster), such as cluster configuration updates, cluster-level health checks, or cluster backups. Cluster-wide operations are protected by the cluster-admin role, except `GET /cluster/v2/status`, which is deliberately unauthenticated so load balancers can use it as a health check. Cluster-wide operations are not scoped to a specific [Physical Tenant](#physical-tenant).

- [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
