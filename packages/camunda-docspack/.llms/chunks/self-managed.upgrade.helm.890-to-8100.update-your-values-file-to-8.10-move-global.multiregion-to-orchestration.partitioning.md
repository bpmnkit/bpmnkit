# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Move `global.multiregion` to `orchestration.partitioning`

`global.multiregion.regions` and `global.multiregion.regionId` still work in 8.10, but the chart emits a deprecation warning for them. Only the Orchestration Cluster reads them. Therefore, move them to `orchestration.partitioning`:

| 8.9 key                       | 8.10 key                                   |
| :---------------------------- | :----------------------------------------- |
| `global.multiregion.regions`  | `orchestration.partitioning.numberOfZones` |
| `global.multiregion.regionId` | `orchestration.partitioning.zoneIndex`     |

Remove the `global.multiregion` block when you add `orchestration.partitioning`. If you set both, the render fails.

Keep `orchestration.partitioning.scheme` at its default, `round-robin`, for the upgrade to 8.10. The scheme stays fixed for the life of a cluster. If you switch an existing cluster to `zone-aware`, every broker's identity changes. To convert an existing cluster, first complete the upgrade to 8.10. Then follow [Migrate to zone-aware brokers](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
