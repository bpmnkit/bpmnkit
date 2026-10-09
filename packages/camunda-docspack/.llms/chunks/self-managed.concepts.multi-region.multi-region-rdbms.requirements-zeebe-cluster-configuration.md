# Multi-Region RDBMS — Requirements — Zeebe cluster configuration

| Setting                       | Requirement                                                                                                                                  |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Partitioning scheme           | `ZONE_AWARE`. The parity-based broker numbering only supports exactly two regions.                                                           |
| Zones                         | One zone per region, two or more. Three or more to keep processing through a region loss.                                                    |
| `number-of-replicas` per zone | Declared per zone, and free to differ between them. To survive a zone loss, no zone may hold half the replication factor or more.            |
| `number-of-brokers` per zone  | Declared per zone. Keep zones balanced so a zone loss removes an equal share of capacity.                                                    |
| Surviving capacity            | Size the cluster so the regions left after a loss carry the full workload. Quorum surviving is not the same as the cluster keeping up.       |
| `priority` per zone           | Highest for the zone hosting the database writer, to keep partition leaders next to it.                                                      |
| `partitionCount`              | Unrestricted. Size it from your workload. See [sizing your environment](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment). |

Each broker sets its own zone, while the zone list is identical in every region. For the full property reference, see [zone-aware clusters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters). For the matching Helm keys, see [multi-region zone awareness](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
