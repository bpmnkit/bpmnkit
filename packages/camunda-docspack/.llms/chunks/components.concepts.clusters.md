# Clusters

Learn more about the clusters available in your Camunda 8 plan.

A [cluster](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/create-cluster) is a provided group of production-ready nodes that run Camunda 8.

When [creating a cluster in SaaS](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/create-cluster), you can choose the cluster **type** and **size** to meet your organization's availability and scalability needs, and to provide control over cluster performance and availability.


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
Source: https://docs.camunda.io/docs/next/components/concepts/clusters
