# Grow a Multi-Region RDBMS cluster

Add a region to a running Multi-Region RDBMS cluster through the cluster management API, and plan the partition count.

Learn how to grow a [Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms) cluster from two regions to three or more.

You can add a zone to a running cluster without changing the brokers that already run. Each broker ID combines a zone name and an index, such as `london_0`. A new zone brings new IDs and leaves the existing ones as they are.


## Declare only the zones you deploy

Every zone in the zone list must have its brokers running when the cluster bootstraps. Don't declare a zone to reserve it for later growth. Add it through the management API after its brokers run.

A zone in the zone list receives partition replicas even if its brokers don't run. A declared zone without brokers leaves every partition one zone short. For example, if you declare a `2-2-1` layout but deploy only the first two zones, each partition runs four of five replicas. Losing either database zone then stops processing.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-growth
