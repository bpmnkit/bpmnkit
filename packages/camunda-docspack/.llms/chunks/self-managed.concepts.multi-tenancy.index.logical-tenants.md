# Multi-tenancy — Logical Tenants

Lightweight tenant-ID based multi-tenancy for cost-efficient subdivision within a single cluster.

Logical Tenants share infrastructure but have logically isolated data, configurations, and access controls. This model is best for departments or teams within the same organization with low-risk separation needs.

[Logical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/logical-tenants)


## Physical Tenants

Strong physical data isolation within a single cluster with separate data storage and independent operations per tenant.

Physical Tenants still share cluster compute resources such as CPU and memory, so runtime interference is reduced but not fully eliminated.

This model is best for multiple teams or organizations requiring strong isolation without the cost and complexity of separate clusters.

In Camunda Hub, each Physical Tenant appears as an [environment](https://docs.camunda.io/docs/next/components/concepts/environments) that organization admins assign to workspaces.

Physical Tenants and Logical Tenants can be used together. Each Physical Tenant can contain its own set of Logical Tenants, providing two independent layers of isolation: physical separation between top-level tenant groups, and logical separation within each group.

  [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants)
  [Set up two isolated Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/index
