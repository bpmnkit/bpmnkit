# Configure zone-aware multi-region deployments — Custom application configuration is not merged

`orchestration.configuration` replaces the generated application configuration rather than merging with it. With the `zone-aware` scheme, the chart therefore does not inject `camunda.cluster.partitioning` into your custom content. If you supply `orchestration.configuration`, describe the zone-aware settings there yourself.

The chart still injects `CAMUNDA_CLUSTER_ZONE` into the pod environment, because that value is per-deployment rather than part of the shared configuration.


## What the chart validates

The chart rejects the inputs that would otherwise render a cluster that cannot form:

| Rejected                                                                                        | What would happen without the check                                                                                                        |
| :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `zone` or `zones` set while `scheme` is not `zone-aware`                                        | The topology would be ignored and the cluster would come up single-region with no bootstrap peers.                                         |
| `zone` unset, or naming a zone absent from `zones`                                              | The release would take the broker IDs of the first zone and collide with it.                                                               |
| A zone name that repeats                                                                        | Zone names are member ID prefixes, so a duplicate collapses two zones into one identity space.                                             |
| A zone with more `numberOfReplicas` than `numberOfBrokers`                                      | A zone cannot hold more replicas of a partition than it has brokers to hold them.                                                          |
| `orchestration.clusterSize` or `orchestration.replicationFactor` that contradicts the zone list | Both are derived from the zone list in zoned mode, so a stale value would be discarded in silence. Restating the derived total is allowed. |
| `numberOfZones` or `zoneIndex` carrying a non-default value                                     | They belong to the round-robin broker numbering that zone awareness replaces, so the zone list would silently lose to them.                |

The schema also requires each `zones` entry to declare `name`, `numberOfBrokers`, `numberOfReplicas`, and `priority`, with each numeric value at least `1`.

The chart rejects the last two keys only when they carry a non-default value. Helm gives no reliable way to tell a value you supplied from the chart default. A key that equals its default therefore stays inert instead of failing the render. `numberOfZones` and `zoneIndex` may also carry their round-robin values while `keepUnzonedBrokers` is set, where they still describe the retained broker generation. The chart keeps all of these keys, and they keep working with the `round-robin` scheme.

The application validates what the chart cannot validate from values alone, including replica counts against the resulting partition distribution and the remaining zone constraints.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness
