# Configure zone-aware multi-region deployments

Configure the Camunda Helm chart to deploy an Orchestration Cluster across named zones, and understand what the chart derives from the zone list.

The Camunda Helm chart deploys an Orchestration Cluster across named zones through `orchestration.partitioning`. Each zone runs its own release of the chart, and every release describes the same cluster-wide topology. The zone list is therefore identical everywhere, and only the local zone name changes.

For what zones are and how the application places partition replicas across them, see [zone-aware clusters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters).


## Move from global.multiregion

Chart v15 (Camunda 8.10) deprecates `global.multiregion`. Only the Orchestration Cluster ever read these keys, so they now live under `orchestration.partitioning`. The deprecated keys still work and still render in v15. Chart v16 removes them, so move them before you upgrade to v16.

Two keys shipped under `global.multiregion`: `regions` and `regionId`. They configure the broker numbering for [dual-region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) deployments. The new block describes zones rather than regions, so the keys change name as well as location:

| Deprecated key                | Replacement                                |
| :---------------------------- | :----------------------------------------- |
| `global.multiregion.regions`  | `orchestration.partitioning.numberOfZones` |
| `global.multiregion.regionId` | `orchestration.partitioning.zoneIndex`     |

The values do not change. Only the names and their location change:

```yaml
# Before
global:
  multiregion:
    regions: 2
    regionId: 1

# After
orchestration:
  partitioning:
    numberOfZones: 2
    zoneIndex: 1
```

Keeping the old names under the new block fails the render. The schema declares `orchestration.partitioning` with `additionalProperties: false`. It allows only `scheme`, `zone`, `zones`, `numberOfZones`, `zoneIndex`, and `keepUnzonedBrokers`. The chart therefore rejects the old pair with `additional properties 'regionId', 'regions' not allowed` instead of ignoring it.

Both key paths produce the same broker numbering. The deprecated one renders identically and adds a deprecation warning. Setting both blocks fails the render. The chart does not pick one, because neither block merges into the other. The ignored block would describe a topology you don't get.

You configure zone awareness only under `orchestration.partitioning`. The `scheme`, `zone`, and `zones` keys have never existed under `global.multiregion`, so there is nothing to migrate for a zone-aware cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness
