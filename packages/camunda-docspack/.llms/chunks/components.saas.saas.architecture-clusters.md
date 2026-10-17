# Camunda 8 SaaS — Architecture — Clusters

Camunda Hub is hosted in AWS in the eu-central-1 [region](https://docs.camunda.io/docs/next/components/saas/regions). It is where you manage your organization, workspaces, environments, and clusters.

Your processes run on [clusters](https://docs.camunda.io/docs/next/components/saas/clusters). Each cluster hosts one or more environments, and you choose its [type](https://docs.camunda.io/docs/next/components/saas/clusters#cluster-type) and [size](https://docs.camunda.io/docs/next/components/saas/clusters#cluster-size) when you create it. A cluster runs the Orchestration Cluster components such as Zeebe, Tasklist, Operate, Optimize, and Connectors in GCP or Amazon Web Services (AWS) regions. An Orchestration Cluster is a provided group of production-ready nodes that run Camunda 8.

By default, each cluster serves a single [logical tenant](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy), with all data associated with the `<default>` tenant.

A cell-based architecture means that each cluster runs as dedicated processes in a separate cell isolated from all other clusters, allowing secure fault and workload separation. Scaling is achieved by deploying additional clusters for new use cases and/or teams.

**Note**
On clusters running generation 8.8 and later, you can enable [logical multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) to serve multiple logical tenants from the same cluster. The tenants share the cluster infrastructure, and their data is logically isolated. Each data entry (for example, process definition, process instance, job) is appended with a tenant ID to ensure separation.

---
Source: https://docs.camunda.io/docs/next/components/saas/saas
