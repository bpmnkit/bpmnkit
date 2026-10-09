# Helm chart dual-region operational procedure

The operational procedure concerning dual-region setups to recover from a region loss.

<!-- Image source: https://miro.com/app/board/uXjVL-6SrPc=/ -->

<!-- Failover -->

<!-- Failback -->


## Introduction

This operational blueprint procedure is a step-by-step guide on how to restore operations in the case of a total region failure. It explains how to temporarily restore functionality in the surviving region and how to ultimately do a full recovery to restore the dual-region setup.

This procedure is the failover and failback runbook for [Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region). For an overview of Camunda's multi-region resilience options and how Dual-Region compares to Cold Recovery, see [Multi-region resilience tiers](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/resilience-tiers).

**Warning: Check your topology before you start**
This procedure applies only to a two-region cluster with Elasticsearch secondary storage and numbered brokers, where even node IDs run in one region and odd node IDs in the other.

- On a [Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms) cluster with three or more regions, don't run it: its force-remove, exporter, and Elasticsearch restore steps don't apply there. Use the [Multi-Region RDBMS operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops) instead.
- On a cluster that you [migrated to zone-aware brokers](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration), the node IDs in its commands don't match your brokers. Don't apply them as written.
- On a two-region cluster with RDBMS secondary storage and database replication, for example the [Amazon ECS dual-region setup](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region), don't run this procedure either. Its Elasticsearch exporter and restore steps don't apply there.

The operational procedure builds on top of the [dual-region AWS setup guidance](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region), but is generally applicable for any dual-region setup.
It has been also validated for the [OpenShift dual-region setup guidance](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region).

Before proceeding with the operational procedure, thoroughly review and understand the contents of the [dual-region concept page](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region). This page outlines various limitations and requirements pertinent to the procedure, which are crucial for successful execution.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
