# Multi-region setup with RDBMS (EKS)

Run one Orchestration Cluster across three Amazon EKS regions, connected by AWS Transit Gateway and Submariner and backed by an Aurora Global Database. Start on two regions, then add the third.

This guide deploys one Camunda 8 Orchestration Cluster across three AWS regions. It starts the cluster on two regions, then adds the third to the running cluster, the same path the reference implementation tests. It uses [Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html) for compute and [AWS Transit Gateway](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html) for inter-region routing. It uses [Submariner](https://submariner.io/) for cross-cluster service discovery and [Aurora Global Database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html) as relational secondary storage.

**Caution**
Review the [Multi-Region RDBMS concept documentation](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms) before continuing, to understand the limitations and requirements of this configuration.

The result is a cluster where losing a region does not stop processing. Bringing the region back is a redeployment rather than a data restore. For the reasoning behind the topology, see [partition placement across zones](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms#partition-placement-across-zones).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
