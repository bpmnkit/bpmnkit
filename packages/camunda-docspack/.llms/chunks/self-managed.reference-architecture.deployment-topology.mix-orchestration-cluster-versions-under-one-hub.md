# Camunda 8.10 deployment topology — Mix Orchestration Cluster versions under one Hub

An 8.10 Hub release manages Orchestration Cluster releases on the 8.7, 8.8, 8.9, and 8.10 charts. Each cluster deploys from its own chart and its own values, so clusters upgrade independently of the Hub and of each other.

| Orchestration chart | Role to set     | Cluster record needs                                |
| :------------------ | :-------------- | :-------------------------------------------------- |
| 8.10                | `orchestration` | The standard record                                 |
| 8.9                 | `orchestration` | The standard record                                 |
| 8.8                 | `orchestration` | The standard record                                 |
| 8.7                 | `orchestration` | `architecture: legacy` and the legacy service names |

Chart 8.7 predates the unified Orchestration Cluster, so it runs Zeebe, Zeebe Gateway, Operate, and Tasklist as separate workloads. Its Hub cluster record must set `architecture: legacy`, which makes the Hub inventory address those split services and omit the Orchestration Admin component. See [describe a chart 8.7 cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#describe-a-chart-87-cluster).

The Hub release always owns registration, clients, permissions, and inventory, whatever chart version a cluster runs. The older charts can't own any of that, because Camunda Hub doesn't exist in them.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology
