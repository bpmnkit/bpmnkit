# Logical Tenants — Management Identity

[Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview) is a component of Camunda 8 Self-Managed used for identity and access management of components outside the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/overview). Of those, only [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview) is tenant aware, and can make use of logical multi-tenancy.

If you wish to use it with the same tenants as an Orchestration Cluster, you will have to manually synchronize the tenants in both the Orchestration Cluster and Management Identity. This means manually creating them, and updating them whenever they change. Two tenants are considered the same if they have the same ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/logical-tenants
