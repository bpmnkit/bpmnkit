# Migrate to zone-aware brokers — Configure the zone-aware values

Add the zone-aware configuration to the values of each release. The `zones` list describes the complete target topology and must be identical in every release. The `zone` value selects the zone owned by this release.

Keep these values unchanged while `keepUnzonedBrokers` is `true`, because they still describe the retained numbered brokers:

| Value                                      | Required value during migration                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `orchestration.clusterSize`                | The existing numbered cluster size. The chart divides it by `numberOfZones` to size the numbered StatefulSet.                        |
| `orchestration.replicationFactor`          | The current replication factor of the cluster.                                                                                       |
| `orchestration.partitioning.numberOfZones` | The number of regions of the numbered deployment: `1` for single-region, `2` for dual-region. `clusterSize` must be divisible by it. |
| `orchestration.partitioning.zoneIndex`     | The region index of this release in the numbered deployment: `0` for single-region, `0` or `1` for dual-region.                      |

For a single-region cluster, you can omit `numberOfZones` and `zoneIndex`. The chart defaults to `numberOfZones: 1` and `zoneIndex: 0`.

If the existing values use the deprecated `global.multiregion` block, remove it when you add `orchestration.partitioning`. Set `numberOfZones` to the former `regions` value and `zoneIndex` to the former `regionId` value. The chart rejects values that configure both blocks.

The sum of the zones' `numberOfReplicas` values must equal the cluster's current replication factor. If the target topology needs a higher factor, see [Update the partitioning configuration](#update-the-partitioning-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
