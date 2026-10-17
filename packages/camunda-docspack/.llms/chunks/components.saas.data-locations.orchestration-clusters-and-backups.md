# Data locations — Orchestration Clusters and backups

You can choose a [region](https://docs.camunda.io/docs/next/components/saas/regions) in **GCP** or **AWS**. Each [Orchestration Cluster](https://docs.camunda.io/docs/next/components/orchestration-cluster) uses a dedicated infrastructure.

| Host location                                                                                                                                                                                                                                                                                                                 | Data handled                                                                                                                                                | Personal data processing                                                                                                    |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| Orchestration Clusters are created on AWS or GCP, in one of the available [regions](https://docs.camunda.io/docs/next/components/saas/regions).Backups are single‑region by default, in the same region as the Orchestration Cluster.Optionally, you can replicate backups in a [secondary region](https://docs.camunda.io/docs/next/components/saas/regions), depending on the chosen primary region. | All data uploaded to Camunda in Orchestration Clusters during customers’ process orchestration (used in Zeebe, Operate, Tasklist, Optimize and Connectors). | Dependent on the data you sent to Camunda in the Orchestration Clusters. Camunda does not process personal data by default. |

**Info: Learn More**

- [Backups](https://docs.camunda.io/docs/next/components/saas/backups)
- [Cluster backups](https://docs.camunda.io/docs/next/components/saas/clusters/cluster-backups)

---
Source: https://docs.camunda.io/docs/next/components/saas/data-locations
