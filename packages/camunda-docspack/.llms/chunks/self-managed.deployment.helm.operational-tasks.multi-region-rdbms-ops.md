# Multi-Region RDBMS operational procedure

Handle a region loss, bring a region back, and add a region to a Multi-Region RDBMS setup.

This runbook covers the day-2 operations of a [Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms) setup: losing a region, bringing it back, and adding a region.

**Caution**
Develop, test, and rehearse these procedures in a non-production environment before you need them. The commands below are examples from the [reference implementation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms). Adapt them to your environment.


## What is different from dual-region

In a [dual-region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops) setup, losing a region costs the Zeebe quorum. Processing stops, and the failover procedure exists to restore it. That procedure removes the lost brokers, disables the exporter to the lost region, and later restores secondary storage from a snapshot.

With three or more zones and no zone holding half the replicas or more, none of that applies. Every partition keeps a majority of its replicas. Zeebe keeps processing, and you need no Zeebe action to restore service. The [dry run](#1-confirm-the-quorum-is-intact) confirms this before you act. The failover procedure mostly reports. It only acts on the database writer, and only when the writer was in the lost region.

| Step                             | Dual-region                             | Multi-Region RDBMS                              |
| :------------------------------- | :-------------------------------------- | :---------------------------------------------- |
| Restore processing               | Force-remove the lost brokers           | Nothing, processing never stopped               |
| Secondary storage after failover | Disable the exporter to the lost region | Nothing, there is one exporter and one database |
| Promote the database             | n/a                                     | Only if the writer was in the lost region       |
| Remove the lost zone             | Same step as restoring processing       | Recommended, not needed for quorum              |
| Failback                         | Snapshot and restore secondary storage  | Redeploy the region                             |

The [dual-region procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops) takes 10 operator steps: two to fail over and eight to fail back. The diagram above counts three operator actions here: promote the writer if needed, remove the lost zone, and redeploy the region at failback. The runbook below adds confirmations around them, for five steps in total.

**Warning: Use this runbook only for Multi-Region RDBMS**
This runbook applies only to a zone-aware cluster with RDBMS secondary storage. Its region-loss procedures assume three or more zones. A cluster that starts on two zones uses only [Add a region](#add-a-region) until it runs three. If it loses a zone before then, processing stops. Bring the lost zone back before you add the third region, because the add-zone change needs a quorum. Don't run the [dual-region procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops) on it: force-removing brokers or restoring secondary storage from a snapshot is unnecessary here and can lose data. For a two-region cluster with Elasticsearch, use the dual-region procedure instead.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
