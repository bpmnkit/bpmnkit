# Region loss and recovery in Multi-Region RDBMS — Remove a lost zone

Whether the lost zone has to be removed depends on the replicas it held, not on how many zones there are. A partition keeps its quorum as long as the lost zone held fewer than half its replicas:

- Under a layout that satisfies this, such as the default `2-2-1` across three zones, the majority holds. Processing continues whether or not you remove the zone.
- When one zone holds half the replicas or more, losing that zone costs the quorum. Processing only resumes once the zone is removed from the partition distribution.

An evenly split two-zone cluster, such as the `2-2` bootstrap, always loses its quorum with a zone. Bring the lost zone back before you add the third region. The same limit applies to [Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region). An uneven two-zone layout keeps its quorum only when it loses the smaller zone.

In a cluster with three or more zones, remove a lost zone once you confirm that it is down and won't come back soon. The [operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops#4-remove-the-lost-zone) has the command.

After the removal, raise the replicas of the remaining zones if the layout needs it. Losing a two-replica zone of a `2-2-1` layout leaves `2-1`. Raise the one-replica zone to two, to get `2-2`, through the [Partitioning API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#partitioning-api). Losing the one-replica zone leaves `2-2`, so the remaining zones need no change.

Removal makes failback slower. You must add the zone back explicitly, and its brokers then rebuild their state. The rebuild is automatic and can take a few minutes. Its duration depends on the number of active process instances, not on the data in secondary storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss
