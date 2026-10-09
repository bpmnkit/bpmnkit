# Multi-Region RDBMS operational procedure — Bring a region back

Failback is short by design. It has no secondary storage snapshot and restore step. The database holds a single copy of the exported data and replicates it itself. A returning region has nothing to catch up on at the Camunda level.

```bash
./failback.sh <recovered-region-slot>
```

The procedure does four things:

1. **Redeploys Camunda** in the recovered region: namespace, database secret, Helm values, and chart.
2. **Re-exports the region's services** to the ClusterSet, so brokers in other regions can resolve them again.
3. **Re-adds the zone** if you force-removed it during failover. If you left the zone in place, its brokers rejoin and catch up from the Raft log with no membership change at all.
4. **Reports the database state**, and stops if an unplanned recovery left the global topology incomplete.

Move the writer back to the recovered region if the other regions are further from the current writer:

```bash
./failback.sh <recovered-region-slot> --switch-writer
```

Leaving the writer where it is costs nothing but cross-region latency for the regions furthest from it.

**Note: After an unplanned failover**
An unplanned recovery can leave the promoted member detached from the global database. Restore a complete Aurora Global Database topology with the AWS recovery procedure before running `failback.sh`. The script refuses to continue while the global cluster has only one member.

Confirm the topology when done:

```bash
./check-cluster-topology.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
