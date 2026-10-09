# Dual-Region — Architecture

The dual-region setup uses two Kubernetes clusters, each running a complete set of Camunda 8 components.

- With v2 APIs (default in 8.9+), both regions serve user traffic simultaneously.
- With v1 APIs, **Region 0** is the primary region serving user traffic; **Region 1** is operational but doesn't serve user traffic under normal conditions.

**Note**
The diagram shows both regions as operational. Any grayed-out appearance represents user traffic routing, not system operational status. All components in both regions must be running.

|                                     Component | Mode                                                    | Both regions running | User traffic                              | RPO |
| --------------------------------------------: | :------------------------------------------------------ | :------------------- | :---------------------------------------- | :-- |
| **Orchestration Cluster** |                                                         | ✅ Required          |                                           |     |
|                                         Zeebe | Active-active                                           | ✅ Required          | Both regions process data                 | 0   |
|                                         Admin | Active-active                                           | ✅ Required          | Cluster-level identity                    | 0   |
|                                       Operate | Active-active with v2 API (active-passive with v1)      | ✅ Required          | Both regions serve users with v2 API      | 0   |
|                                      Tasklist | Active-active with Tasklist V2 (active-passive with v1) | ✅ Required          | Both regions serve users with Tasklist V2 | 0   |
|         **Elasticsearch** | Active-active                                           | ✅ Required          | Data replicated to both                   | 0   |

In a dual-region setup, each Orchestration Cluster component operates as follows:

- **Orchestration cluster** runs across both regions using the [Raft protocol](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region/<https:/en.wikipedia.org/wiki/Raft_(algorithm)>), distributing partition leaders and followers for continuous replication.
- **Camunda exporters** push identical data to the Elasticsearch instance in each region. Camunda orchestration cluster dual export mechanism (not Elasticsearch replication) maintains data consistency. The two Elasticsearch clusters don't communicate directly with each other.
- **Operate and Tasklist** maintain synchronized data state across both regions via the [Camunda Exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter). See [Active-active and active-passive modes](#active-active-and-active-passive-modes).
- **Admin** is embedded in the Orchestration Cluster and provides cluster-level identity management.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
