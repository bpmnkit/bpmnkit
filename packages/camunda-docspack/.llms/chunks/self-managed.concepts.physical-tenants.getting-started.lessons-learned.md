# Set up two isolated Physical Tenants — Lessons learned

- **Start with one shared identity provider.** Connecting a second tenant to its own separate identity provider is supported, but it's a second thing to get wrong on your first rollout. Prove the pattern with a shared provider first, then split identity later if compliance requires it.
- **Storage isolation errors happen at startup, not at runtime.** Getting the schema, database, or prefix wrong fails the rollout immediately and names both conflicting tenants. It doesn't silently share data. Treat a failed rollout here as the isolation check working, not a bug.
- **Authorization doesn't compose across tenants, budget for it.** Every explicitly configured tenant needs its own complete `security.initialization` block. For two tenants this is a few extra lines; for ten, template it rather than hand-writing each one.
- **Add tenants for isolation boundaries, not for scale.** If Risk just needs more throughput on the same data and identity as Operations, that's a partition-count or broker-count change within one tenant, not a new tenant. Reach for a new Physical Tenant when a team needs its own storage, identity, or backup, not just more capacity.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
