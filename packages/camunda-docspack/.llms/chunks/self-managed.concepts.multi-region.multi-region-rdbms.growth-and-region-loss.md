# Multi-Region RDBMS — Growth and region loss

Two companion pages describe how the cluster changes over its life:

- [Grow a Multi-Region RDBMS cluster](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-growth): add a region to a running cluster through the cluster management API.
- [Region loss and recovery in Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss): what the cluster does when a region disappears, the recovery window, and when to remove a lost zone.


## Limitations

Recovery behaves as described only inside the boundaries this architecture sets. The following table lists them.

| Aspect                      | Details                                                                                                                                                                                       |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installation methods        | Kubernetes with the [Camunda Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install). Alternative installation methods are not covered by these guides.                           |
| Secondary storage           | RDBMS only. Elasticsearch and OpenSearch replicate per region and do not fit the single-endpoint model this architecture depends on.                                                          |
| Database availability       | The database tier is active-standby. A single writer serves every region, and regions further from it pay more export latency.                                                                |
| Management Identity support | Management Identity is not available in this setup. The Orchestration Cluster-level Admin supports multi-tenancy and role-based access control instead.                                       |
| Optimize support            | Not available. Optimize requires Elasticsearch or OpenSearch, regardless of the region count.                                                                                                 |
| Camunda Hub                 | Hub is a standalone component not covered in this guide. Modeling applications can operate independently outside of the Orchestration Clusters. Hub also depends on Management Identity.      |
| Connectors deployment       | Connectors run in every region and are not deduplicated. Account for [idempotency](https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound#creating-the-connector-event) to avoid event duplication. |
| Zone list changes           | Adding a zone is online, through the cluster management API: the engine places the new zone's replicas without renumbering brokers. Adding a zone leaves the partition count unchanged.       |
| Backup and restore          | RDBMS backup relies on continuous primary storage backups plus a database-native backup. See [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).     |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
