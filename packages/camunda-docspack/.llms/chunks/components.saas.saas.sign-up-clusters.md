# Camunda 8 SaaS — Sign up — Clusters

There are two types of [cluster](https://docs.camunda.io/docs/next/components/concepts/clusters) used when running Camunda 8 SaaS:

- Camunda Hub is hosted in AWS in the eu-central-1 [region](https://docs.camunda.io/docs/next/components/saas/regions).
- Orchestration cluster components such as Zeebe, Tasklist, Operate, Optimize, and Connectors, are hosted in GCP or Amazon Web Services (AWS) regions. An Orchestration Cluster is a provided group of production-ready nodes that run Camunda 8.

By default, each cluster serves a single tenant, with all data associated with the `<default>` tenant.

A cell-based architecture means that each cluster runs as dedicated processes in a separate cell isolated from all other clusters, allowing secure fault and workload separation. Scaling is achieved by deploying additional clusters for new use cases and/or teams.

**Note**
On clusters running generation 8.8 and later, you can enable [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) to serve multiple tenants from the same cluster, with their data logically isolated. Each data entry (for example, process definition, process instance, job) is appended with a tenant ID to ensure separation.

---
Source: https://docs.camunda.io/docs/next/components/saas/saas
