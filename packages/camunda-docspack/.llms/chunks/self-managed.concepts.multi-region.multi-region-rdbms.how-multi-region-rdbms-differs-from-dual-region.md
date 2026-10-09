# Multi-Region RDBMS — How Multi-Region RDBMS differs from Dual-Region

The two multi-region architectures differ in region count and in secondary storage.

[Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) is the two-region architecture with Elasticsearch secondary storage and parity-numbered brokers. It has two properties that come from the region count rather than from any implementation choice.

With two regions, no replica placement survives losing half of them. A region loss therefore costs the Raft quorum, and Zeebe stops processing until an operator force-removes the lost brokers. Each region also owns its own copy of the secondary storage, so a returning region has to be re-seeded. Failback therefore includes a secondary storage snapshot and a cross-region restore.

Multi-Region RDBMS removes both. It changes the number of regions, and it changes who owns replication of the secondary storage.

| Consideration     | Dual-Region                                                                       | Multi-Region RDBMS                                                                                                                 |
| :---------------- | :-------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| Regions           | Exactly two                                                                       | Two or more. Three or more to keep processing through a region loss                                                                |
| Region loss       | Quorum lost, processing stops until brokers are force-removed                     | With three or more regions, quorum preserved and processing continues                                                              |
| Failback          | Multi-step runbook including a secondary storage snapshot and restore             | Redeploy the region, nothing to restore                                                                                            |
| Secondary storage | Elasticsearch, one cluster per region, one Camunda exporter per region            | RDBMS, one database, one exporter, replication inside the database                                                                 |
| Optimize          | Supported                                                                         | Not available, Optimize requires Elasticsearch or OpenSearch                                                                       |
| Relative cost     | **$$$**: two regions of Orchestration Cluster capacity, plus cross-region traffic | **$$$$**: two or more regions of Orchestration Cluster capacity, three or more to survive a region loss, plus cross-region traffic |

Choose Multi-Region RDBMS when processing must continue through a region loss without operator intervention, and when you can run without Optimize. Choose [Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) when two regions are sufficient, or when you need Optimize on the same cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
