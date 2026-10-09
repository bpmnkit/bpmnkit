# Camunda 8 reference architectures — Architecture — High availability (HA)

High availability (HA) ensures that a system remains operational even when components fail. All components can run in HA mode, but Optimize requires special consideration: the importer/archiver must run on only one replica at a time. See the [Optimize configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8#general-settings) for details.

Consider regional and zonal placement of workloads. Use at least three zones in a region to maintain availability if a zone fails. On Kubernetes, see [high availability](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#high-availability-ha) for how to enforce that placement.

For more information on how Zeebe handles fault tolerance, see the [Raft consensus chapter](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering#raft-consensus-and-replication-protocol).

If running a single instance, implement [regular backups](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore), as resilience will be limited.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture
