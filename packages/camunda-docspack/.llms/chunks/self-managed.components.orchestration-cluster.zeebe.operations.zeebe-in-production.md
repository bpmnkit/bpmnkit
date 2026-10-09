# Operating Zeebe in production

This chapter covers topics relevant to anyone who wants to operate Zeebe in production.

- [Resource planning](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed) - Gives an introduction for calculating how many resources need to be provisioned.
- [Network ports](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/network-ports) - Discusses which ports are needed to run Zeebe.
- [Setting up a Zeebe cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster) - Quick guide on how to set up a cluster with multiple brokers.
- [Health status](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/health) - Lists available high-level health and liveness probes.
- [Backpressure](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure) - Discusses the backpressure mechanism used by Zeebe brokers.
- [Disk space](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/disk-space) - Explains how to set limits for the amount of free disk space. Once these limits are undercut, Zeebe degrades gracefully to allow the operations team to provide more disk space.
- [Upgrade Zeebe](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/update-zeebe) - Contains information on how to perform a shutdown upgrade.
- [Rebalancing](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing) - Describes how to rebalance a cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/zeebe-in-production
