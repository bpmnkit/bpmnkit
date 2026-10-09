# Multi-Region RDBMS operational procedure — Upgrade the cluster

{/* TODO: multi-region upgrade paths are not tested yet. Document them once they are. */}

Upgrade **one region at a time**, and wait for the cluster to report healthy before starting the next:

```bash
./check-cluster-topology.sh
```

Upgrading several regions at the same time risks losing quorum.

Follow the general [upgrade guidance](https://docs.camunda.io/docs/next/self-managed/upgrade/index) and create a [backup](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) first.


## Diagnose problems

| Symptom                                 | Start here                                                                      |
| :-------------------------------------- | :------------------------------------------------------------------------------ |
| Brokers do not reach the expected count | `./submariner/verify-submariner.sh`, then `./submariner/diagnose-submariner.sh` |
| Cross-region traffic is dropped         | `./verify-cross-region-connectivity.sh`                                         |
| Export latency is higher than expected  | `./measure-rdbms-latency.sh`                                                    |
| Partition distribution looks wrong      | `./check-cluster-topology.sh`                                                   |

For the underlying causes and the AWS commands that confirm them, see [troubleshooting in the EKS guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms#troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
