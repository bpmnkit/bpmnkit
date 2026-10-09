# Cluster mode

Switch an Orchestration Cluster between processing and recovery mode.

A cluster mode change transitions every broker in an Orchestration Cluster between processing and recovery mode. The selected mode determines whether the partitions process data or remain inactive while you restore the cluster from a backup.

A mode change is a cluster configuration change, similar to [cluster scaling](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling). The API acknowledges the request when it accepts the change, and each broker applies the transition asynchronously.


## Cluster modes

| Mode         | Behavior                                                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROCESSING` | The default broker operational mode. Each broker installs the full set of partition services.                                                                                                                   |
| `RECOVERING` | Each local partition is registered as `inactive` and does not join its Raft group, so the cluster does not elect a leader, process, replicate, or export records. Each broker starts a reduced set of services. |

### Operations available in recovery mode

- Query the cluster state and topology.
- Query the primary storage backup store.
- Restore primary storage from a backup.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/modes
