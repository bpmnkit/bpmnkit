# Monitor cluster load

Cluster load provides you with a high-level overview of how well a cluster is coping with and handling its current workload.

Use the cluster load metric to view and manage your cluster load and utilization.

**Note**
This page applies to Camunda 8 SaaS. For clusters in Self-Managed, see [clusters in Self-Managed](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index).


## About cluster load

The cluster load metric provides a high-level overview of how well a cluster is coping with its current workload.

- Use this information to check and monitor if a cluster is appropriately sized for its workload.
- Cluster load can also be used as an indicator of cluster health. For example, a cluster running at maximum load can indicate poor cluster responsiveness.

A general guideline to follow when using the cluster load metric is:

- **High cluster load percentage**: The higher the cluster load percentage value, the more likely it is that things will slow down, time out, requests will fail, and so on. For example, if a cluster is continually running at 95% load, this means the cluster is probably overloaded and may not be performing well.

- **Low cluster load percentage**: The lower the cluster load percentage value, the more you could increase the cluster workload as the cluster is probably underused. For example, if a cluster load is only 5% then the cluster can probably accept more workload and may be underused.

**Note**
To understand how cluster load is calculated, see [how cluster load is calculated](#load-calculation).

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/cluster-capacity
