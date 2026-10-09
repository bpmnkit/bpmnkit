# Migrate to zone-aware brokers

Migrate an existing single-region or dual-region Orchestration Cluster from numbered brokers to zone-aware brokers with Helm.

This procedure migrates an existing Orchestration Cluster from numbered broker identities to zone-aware broker identities with the Camunda 8.10 Helm chart. You can migrate both single-region and dual-region clusters.

The migration creates replacement brokers instead of changing the persisted identity of existing brokers. The numbered and zone-aware broker generations run together until the cluster has moved its partitions and membership to the new brokers.


## Migration overview

The migration follows the same steps for single-region and dual-region clusters. The only difference is the number of zones and Helm releases involved.

| Topology      | Helm releases                         | Zones                        | Zone migration order                      |
| ------------- | ------------------------------------- | ---------------------------- | ----------------------------------------- |
| Single-region | One release in one Kubernetes cluster | One zone                     | The single zone                           |
| Dual-region   | One release per Kubernetes cluster    | One zone per region, 2 total | `zoneIndex: 1` first, then `zoneIndex: 0` |

In a dual-region cluster, the primary zone is the region with `zoneIndex: 0`, whose numbered brokers have even node IDs. The secondary zone is the region with `zoneIndex: 1`, whose numbered brokers have odd node IDs. You must start a dual-region migration with the secondary zone (`zoneIndex: 1`). The numbered broker with node ID `0` belongs to the primary zone and coordinates cluster configuration changes. Migrating the secondary zone first keeps this coordinator in place while the other zone migrates. If you start with the primary zone, the management API rejects the request with an error similar to:

```text
Zone migration must proceed from the highest remaining zone index to the lowest. Expected next zoneIndex 1 but got 0.
```

In a dual-region cluster, run every Helm step once per release, one release at a time, and wait for each release to be healthy before you continue with the next one. You can send each management API request to any node in the cluster. However, configure the port-forward on the region with `zoneIndex: 0`, since that region is the last to be migrated.

The procedure consists of these steps:

1. Upgrade every release to the chart version that supports zone-aware migration.
1. Upgrade every release with zone-aware values that keep the numbered brokers.
1. Update the persisted partitioning configuration once.
1. For each zone, add the zone's zone-aware brokers to the cluster with the management API, then remove the numbered brokers of that zone's release.

The migration is not reversible. After you update the persisted partitioning configuration, you can't return the cluster to numbered brokers. If a later step fails, complete the migration instead of reverting it. See [Recover from an incomplete migration](#recover-from-an-incomplete-migration).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
