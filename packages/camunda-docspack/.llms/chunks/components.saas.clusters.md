# SaaS clusters

Learn about the cluster types, sizes, and Free Trial clusters available in your Camunda 8 SaaS plan.

In Camunda 8 SaaS, [creating a cluster](https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster) lets you choose the cluster **type** and **size** to meet your organization's availability and scalability needs, and to provide control over cluster performance and availability.

This page describes the details of clusters in SaaS. To learn what a cluster is and how it relates to environments and workspaces, see [clusters](https://docs.camunda.io/docs/next/components/concepts/clusters).


## Cluster type

The cluster type defines the Availability Target for the cluster.

You can choose from three different cluster types:

- **Basic**: A cluster for non-production use, including experimentation, early development, and basic use cases that don't require a high Availability Target.
- **Standard**: A production-ready cluster with a higher Availability Target.
- **Advanced**: A production-ready cluster with the highest Availability Target.

### Cluster availability and uptime

| Type                                                               | Basic                                                                                  | Standard                                                      | Advanced                                                         |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------ | :--------------------------------------------------------------- |
| Usage                                                              | Non-production use, including experimentation, early development, and basic use cases. | A production-ready cluster with a higher Availability Target. | A production-ready cluster with the highest Availability Target. |
| Availability Target(Orchestration Cluster\*) | 99%                                                                                    | 99.5%                                                         | 99.9%                                                            |

* Orchestration Cluster means the core components for process automation and orchestration: Zeebe, Operate, Tasklist, Identity, and the Orchestration Cluster APIs (or any successor or renamed equivalent as specified in the Documentation from time to time).

**Info**
See the terms of your agreement with Camunda for the definitions of Availability Target, Downtime, and Excluded Downtime.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters
