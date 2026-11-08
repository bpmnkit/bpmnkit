# Multi-region resilience

Learn about multi-region deployment and choose the right strategy for your recovery and resilience needs.


## About

Camunda provides a structured multi-region resilience framework for Self-Managed Orchestration Cluster deployments.

- **[Cold Recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery)**: Camunda's lowest-cost multi-region configuration uses scheduled cross-region backups and a manual restore procedure to recover from complete primary-region loss. Recovery measured in hours is operationally acceptable.

- **[Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region)**: Dual-region deployment with continuous replication. A full Camunda Orchestration Cluster runs continuously in both a primary and secondary region.

- **[Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms)**: One Orchestration Cluster runs active-active across two or more regions, and survives a region loss with three or more. A relational database (RDBMS) with cross-region replication holds the secondary storage. Losing one region preserves the cluster quorum. You must fail over the database writer if the lost region held the writer.

**Tip: Looking for single-region high availability?**

To protect against availability-zone outages within one region, see [high-availability architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#high-availability-ha) and [topology spread constraints](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index#topology-spread-constraints). Multi-AZ deployment doesn't protect against a complete region outage.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/resilience-tiers
