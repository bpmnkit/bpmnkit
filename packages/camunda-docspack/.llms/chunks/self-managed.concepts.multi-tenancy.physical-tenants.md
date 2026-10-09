# Physical Tenants

Physical Tenants enable strong data isolation and independent management within a single Camunda 8 cluster.


## About

A Physical Tenant is an isolated execution unit within an Orchestration Cluster. Multiple Physical Tenants can run in a single cluster, each with fully isolated data, its own partition group, and independent lifecycle management.

Isolation covers data and management, not compute. Physical Tenants share the cluster's brokers and gateways, so runtime interference between tenants is reduced but not eliminated. See [what is not isolated](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index#what-is-not-isolated).

Physical Tenants provide a balanced approach to multi-tenancy. They offer strong isolation without the operational complexity and cost of running separate clusters. See [multi-tenancy overview](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/index) to compare isolation models.

![Two Physical Tenants, payments and lending, each with its own database, identity provider, backup and restore, and web apps, running inside one Orchestration Cluster. Logical Tenants remain available inside each Physical Tenant.](./img/physical-tenant-summary.png)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants
