# Camunda 8.10 deployment topology — Why the topology is split

- **Independent cluster lifecycle.** Each Orchestration Cluster is deployed, scaled, upgraded, and removed on its own schedule, without declaring its sibling clusters or duplicating their configuration.
- **One authoritative inventory.** Management Identity registration and Camunda Hub's cluster list both derive from the same `global.topology.clusters` records, so client IDs, audiences, roles, and endpoints can't drift apart.
- **Tenant-level isolation.** Physical Tenants give each team separate data storage and independent backup and restore within one cluster, and each tenant's Optimize gets its own OIDC client and resource server.
- **Declarative operation.** Topology renders from values alone, with no cluster discovery, so Helm, Argo CD, and Flux all produce the same resources.

### What the split does not give you

- **Hub is single-region.** Multi-region guidance applies to the Orchestration Cluster only.
- **Physical Tenants share compute.** Tenants have isolated data and independent management, but they share the cluster's brokers and gateways, so runtime interference is reduced rather than eliminated. See [what is not isolated](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants).
- **Identity reconciliation is additive.** Removing a cluster or tenant record doesn't delete its external client, resource server, permissions, or role. Inventory and clean those objects yourself, after the releases that used them have stopped.
- **Authentication isolation isn't storage isolation.** Separate OIDC credentials per cluster and tenant do nothing to separate shared Elasticsearch or OpenSearch data. Index prefixes do that, and they're your responsibility. See [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants).
- **Scale limits are undefined.** Supported cluster and tenant counts haven't been established. Validate your own target scale before committing to it.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology
