# Physical Tenant isolation model — Health and status endpoints

Physical Tenants expose three distinct endpoints for health and status:

| Endpoint                             | Scope   | Use when                                                                                                                                                                                                                                                      |
| :----------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/actuator/health`                   | Node    | Checking whether the individual broker or gateway node is healthy, ready, or live (for example, Kubernetes probes). Exposed on port 9600 by default (brokers and gateways); the other endpoints below are exposed on the Gateway REST port (8080 by default). |
| `/cluster/v2/status`                 | Cluster | Determining whether the cluster as a whole is operational.                                                                                                                                                                                                    |
| `/physical-tenants/{id}/v2/topology` | Tenant  | Checking whether a specific Physical Tenant can accept work and which of its partitions are available.                                                                                                                                                        |

`/physical-tenants/{id}/v2/topology` is the tenant-prefixed form of `/v2/topology`: the same endpoint, reached through the tenant prefix. An unprefixed `/v2/topology` request returns the `default` tenant's topology, not a cluster-wide view. For the cluster-wide aggregate, use `/cluster/v2/topology`.

The `/v2/status` endpoint is scoped to the default Physical Tenant. Use `/cluster/v2/status` for overall cluster status or `/physical-tenants/{id}/v2/topology` for per-tenant status.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
