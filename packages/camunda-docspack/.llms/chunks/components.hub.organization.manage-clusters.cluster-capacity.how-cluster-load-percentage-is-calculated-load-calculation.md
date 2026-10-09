# Monitor cluster load — How cluster load percentage is calculated {#load-calculation}

Cluster load percentage is based on the cluster's [flow control configuration](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control).

Essentially, if flow control is configured, every partition is assigned a [write rate](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control#exporting-and-write-rate) and a [write rate limit](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control#write-rate-limit).

This means a partition's cluster load is defined as:

`(writeRate / writeRateLimit)`

This gives a value between 0 and 1, which is multiplied by 100 to give the partition load as a percentage.

The cluster load percentage is then the average of the load of all partitions in the cluster.

**Note**

- The partition load is _only_ calculated and reported on the current partition leader.
- It typically takes about five minutes for cluster load data to update with the latest information.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/cluster-capacity
