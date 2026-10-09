# Environments — How an environment maps to infrastructure

An environment is backed by an isolated unit of a cluster. The cluster version determines which unit backs it, and you don't choose it:

| Cluster                             | Backed by                                                                   | Environments on the cluster                                                |
| :---------------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| Self-Managed, version 8.10 or later | [Physical Tenant](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants) | One for each Physical Tenant. The `default` Physical Tenant always exists. |
| SaaS                                | [Cluster](https://docs.camunda.io/docs/next/components/concepts/clusters)                                                    | One environment                                                            |
| Any cluster before version 8.10     | [Cluster](https://docs.camunda.io/docs/next/components/concepts/clusters)                                                    | One environment                                                            |

Camunda Hub derives the name of an environment. An environment backed by a Physical Tenant other than `default` uses the Physical Tenant ID. Any other environment uses the cluster name.

Camunda Hub also supports [Logical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/logical-tenants) for an environment. If the target of a deployment has [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) enabled, you choose a Logical Tenant during the deployment.

---
Source: https://docs.camunda.io/docs/next/components/concepts/environments
