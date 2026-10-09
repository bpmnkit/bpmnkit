# Clusters

A cluster is the infrastructure that runs Camunda 8. Learn how clusters relate to environments, workspaces, and Physical Tenants.

A cluster is the infrastructure that runs Camunda 8. It includes the Orchestration Cluster that automates your processes, and the components that run alongside it, such as connectors and Optimize.

In Camunda Hub, a cluster is an administrative unit: the infrastructure that organization admins create, size, and maintain. Teams don't deploy to a cluster directly. They deploy to an [environment](https://docs.camunda.io/docs/next/components/concepts/environments) hosted on it.


## Create and manage clusters

How you create and manage clusters depends on the edition of Camunda that you use.

In SaaS, organization admins create clusters in Camunda Hub. When you [create a cluster](https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster), you choose its type, size, region, and version. The type defines the availability and uptime of the cluster, and the size defines its capacity.

Organization admins and DevOps users [manage clusters](https://docs.camunda.io/docs/next/components/saas/clusters/manage-cluster), for example to rename, resume, update, or resize a cluster.

Learn more about [SaaS clusters](https://docs.camunda.io/docs/next/components/saas/clusters), including cluster types, sizes, and Free Trial clusters.

In Self-Managed, you provision clusters outside Camunda Hub, and you don't create them in Camunda Hub. To show a cluster and its environments in Camunda Hub, add it to the Camunda Hub configuration.

Learn more about [clusters in Self-Managed](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index) and [Physical Tenants in the Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments#physical-tenants).

---
Source: https://docs.camunda.io/docs/next/components/concepts/clusters
