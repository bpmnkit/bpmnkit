# Dual-Region — Requirements — Zeebe cluster configuration

Zeebe supports the following broker and replication configurations for dual-region setups:

- `clusterSize` must be a multiple of **2** and at least **4** to distribute brokers evenly across both regions.
- `replicationFactor` must be **4** to ensure even partition distribution across regions.
- `partitionCount` is unrestricted but should be based on workload requirements. See [understanding sizing and scalability behavior](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#understanding-sizing-and-scalability-behavior) and [partitions](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions).

Zeebe creates partitions in a [round-robin fashion](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions#partition-distribution). The Helm chart places all brokers with even numbers (0, 2, 4, 6, ...) in one region and all brokers with odd numbers (1, 3, 5, 7, ...) in the other. This distribution ensures even partition replication across both regions.

**Info: Zone-aware brokers**
This numbered, parity-based broker distribution was the default multi-region configuration before Camunda 8.10 and remains supported. Starting with 8.10, [zone-aware clusters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters) name brokers after their zone instead of inferring the region from node ID parity, which extends beyond two regions and simplifies managing zones. To move an existing dual-region cluster to zone-aware brokers, see [Migrate to zone-aware brokers](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration).

#### Scaling the Zeebe cluster

When scaling, follow the [cluster scaling steps](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling) and ensure you meet the [Zeebe cluster configuration](#zeebe-cluster-configuration) requirements.

Keep both regions balanced. They should always have the same number of brokers.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
